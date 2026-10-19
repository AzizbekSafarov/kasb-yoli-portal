import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../server/app.js';
test('Telegram javobi kutishda qolsa ham saqlangan ariza darhol qaytadi',async()=>{
  let release,notifying=false;
  const app=createApp({demo:false,production:false,origin:'http://localhost',telegramReady:true},{user:async()=>({id:'synthetic-user'}),apply:async()=>({created:true,application:{id:'11111111-2222-4333-8444-555555555555',course_id:'frontend',status:'received',telegram_status:'pending'}})},{notify:async()=>{notifying=true;await new Promise(resolve=>{release=resolve;});}});
  const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
  try{
    const response=await fetch(`http://127.0.0.1:${server.address().port}/api/applications`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer synthetic'},body:JSON.stringify({courseId:'frontend',goal:'Sun’iy sinov uchun o‘rganish maqsadi.'}),signal:AbortSignal.timeout(1500)});
    assert.equal(response.status,201);assert.equal((await response.json()).application.telegram_status,'pending');assert.equal(notifying,true);
  }finally{release?.();await new Promise(resolve=>server.close(resolve));}
});
test('bir mijozning haddan ortiq so‘rovi 429 bilan cheklanadi; health ishlaydi',async()=>{
  const app=createApp({demo:false,production:false,origin:'http://localhost'},{});
  const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));const base=`http://127.0.0.1:${server.address().port}`;
  try{let status;for(let i=0;i<81;i++){const response=await fetch(base+'/api/config',{headers:{'X-Forwarded-For':'198.18.1.1'}});await response.text();status=response.status;}assert.equal(status,429);assert.equal((await fetch(base+'/health')).status,200);assert.equal((await fetch(base+'/api/config',{headers:{'X-Forwarded-For':'198.18.1.2'}})).status,200);}finally{await new Promise(resolve=>server.close(resolve));}
});
