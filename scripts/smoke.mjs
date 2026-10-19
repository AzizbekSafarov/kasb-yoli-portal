import assert from 'node:assert/strict';
const origin=process.argv[2]||'https://kasb-yoli-portal.onrender.com';
async function get(path){return fetch(origin+path,{signal:AbortSignal.timeout(60000)});}
assert.equal((await(await get('/health')).json()).status,'ok');
const config=await(await get('/api/config')).json();assert.equal(config.demo,false);assert.equal(config.authReady,true);
for(const key of ['serviceKey','telegramToken','groqKey','SUPABASE_SERVICE_ROLE_KEY'])assert.equal(config[key],undefined);
assert.equal((await(await get('/api/catalog')).json()).courses.length,8);
assert.equal((await get('/api/dashboard')).status,401);
assert.equal((await get('/auth/callback')).status,200);
for(const path of ['/privacy.html','/terms.html','/logo-120.png','/logo-64.png'])assert.equal((await get(path)).status,200,path);
console.log(JSON.stringify({origin,health:'ok',demo:config.demo,authReady:config.authReady,aiReady:config.aiReady,telegramReady:config.telegramReady,catalogCount:8,privateDashboard:401,staticAssets:'ok',serverSecretsExposed:false},null,2));
