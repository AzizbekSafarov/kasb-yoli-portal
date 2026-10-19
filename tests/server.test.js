import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../server/app.js';
import {readConfig} from '../server/config.js';
import {createDemoRepository} from '../server/repository.js';
import {advise,deliverNotification} from '../server/services.js';
test('production sinov hisoblarini qabul qilmaydi',()=>{assert.throws(()=>readConfig({NODE_ENV:'production',DEMO_MODE:'true'}));assert.throws(()=>readConfig({NODE_ENV:'production'}));});
test('API: autentifikatsiya, validatsiya, idempotent ariza, izolyatsiya va saqlanish',async t=>{
  const folder=mkdtempSync(join(tmpdir(),'kasb-test-'));const dbPath=join(folder,'test.sqlite');
  const repo=await createDemoRepository(dbPath);const app=createApp(readConfig({DEMO_MODE:'true'}),repo);const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base=`http://127.0.0.1:${server.address().port}`;
  let cookie='';
  const req=async(path,method='GET',body,otherCookie=cookie)=>{const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(otherCookie?{Cookie:otherCookie}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:response.status,body:await response.json(),cookie:response.headers.get('set-cookie')?.split(';')[0]};};
  try{
    assert.equal((await req('/health')).body.status,'ok');
    assert.equal((await req('/api/dashboard')).status,401);
    const login=await req('/api/demo/login','POST');cookie=login.cookie;const firstUser=login.body.user;
    assert.ok(cookie);assert.ok((await req('/api/me')).body.user);
    assert.equal((await req('/api/applications','POST',{courseId:'unknown',goal:'Sun’iy maqsad matni'})).status,400);
    assert.equal((await req('/api/applications','POST',{courseId:'frontend',goal:'qisqa'})).status,400);
    assert.equal((await req('/api/applications','POST',{courseId:'frontend',goal:'Bu sun’iy sinov maqsadi',user_id:'forged'})).status,400);
    const responses=await Promise.all(Array.from({length:6},()=>req('/api/applications','POST',{courseId:'frontend',goal:'Sun’iy sinov: portfolio yaratishni o‘rganish.'})));
    assert.equal(responses.filter(x=>x.status===201).length,1);assert.equal(new Set(responses.map(x=>x.body.application.id)).size,1);
    assert.equal(responses[0].body.application.telegram_status,'unconfigured');
    await req('/api/favorites/frontend','PUT',{saved:true});await req('/api/favorites/frontend','PUT',{saved:true});
    let state=(await req('/api/dashboard')).body;assert.equal(state.applications.length,1);assert.deepEqual(state.favorites,['frontend']);
    const second=await req('/api/demo/login','POST');const secondCookie=second.cookie;
    state=(await req('/api/dashboard','GET',null,secondCookie)).body;assert.deepEqual(state.applications,[]);assert.deepEqual(state.favorites,[]);
    assert.equal((await req(`/api/applications/${responses[0].body.application.id}/notification`,'POST',null,secondCookie)).status,404);
    assert.equal((await req(`/api/applications/${responses[0].body.application.id}/notification`,'POST')).status,503);
    assert.equal((await req('/api/advice','POST',{interest:'dizayn ijod',experience:'new'})).body.source,'guide');
    const forbidden=await fetch(base+'/api/favorites/frontend',{method:'PUT',headers:{'Content-Type':'application/json',Origin:'https://foreign.invalid',Cookie:cookie},body:JSON.stringify({saved:false})});assert.equal(forbidden.status,403);
    await req('/api/demo/logout','POST');assert.equal((await req('/api/dashboard')).status,401);
    repo.close();const reopened=await createDemoRepository(dbPath);const persisted=await reopened.dashboard(firstUser);assert.equal(persisted.applications.length,1);assert.deepEqual(persisted.favorites,['frontend']);reopened.close();
  }finally{await new Promise(r=>server.close(r));rmSync(folder,{recursive:true,force:true});}
});
test('AI noto‘g‘ri yoki mavjud bo‘lmagan kurs qaytarsa, tekshirilgan yo‘riqnoma chiqadi',async()=>{
  const fake=async()=>({ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({recommendations:[{courseId:'imaginary-millionaire',reason:'income'}]})}}]})});
  assert.equal((await advise({groqKey:'fake',model:'test'},'kod yozish','new',fake)).source,'guide');
  assert.equal((await advise({groqKey:'fake',model:'test'},'kod yozish','new',async()=>{throw Error('timeout');})).source,'guide');
  const good=async()=>({ok:true,json:async()=>({choices:[{message:{content:'{"recommendations":[{"courseId":"frontend","reason":"beginner"}]}'}}]})});
  assert.equal((await advise({groqKey:'fake',model:'test'},'kod','new',good)).source,'ai');
});
test('Telegram: success faqat tasdiqdan so‘ng, xato va noma’lum yetkazilish ajratiladi',async()=>{
  let state='pending';const repo={claim:async()=>{if(state!=='pending')return null;state='sending';return{id:'synthetic-id',course_id:'frontend'};},finish:async(_id,status)=>{state=status;}};const config={telegramReady:true,telegramToken:'fake',chatId:'synthetic-chat'};
  assert.equal(await deliverNotification(repo,config,'synthetic-id',async()=>({ok:true,json:async()=>({ok:true,result:{message_id:1}})})),'sent');assert.equal(state,'sent');
  assert.equal(await deliverNotification(repo,config,'synthetic-id',()=>{throw Error('must not send twice');}),null);
  state='pending';assert.equal(await deliverNotification(repo,config,'synthetic-id',async()=>({ok:false,json:async()=>({ok:false})})),'failed');
  state='pending';assert.equal(await deliverNotification(repo,config,'synthetic-id',async()=>{throw Error('timeout');}),'unknown');
  state='pending';assert.equal(await deliverNotification(repo,config,'synthetic-id',async()=>({ok:true,json:async()=>({ok:true})})),'failed');
});
