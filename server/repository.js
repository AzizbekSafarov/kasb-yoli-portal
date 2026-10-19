import { createClient } from '@supabase/supabase-js';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
const hash = token => createHash('sha256').update(token).digest('hex');
const check = ({ data, error }) => { if (error) throw new Error('database_unavailable'); return data; };
export async function createDemoRepository(path) {
  const { DatabaseSync } = await import('node:sqlite');
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS favorites (user_id TEXT NOT NULL, course_id TEXT NOT NULL, PRIMARY KEY(user_id,course_id));
    CREATE TABLE IF NOT EXISTS applications (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, course_id TEXT NOT NULL, goal TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'received', telegram_status TEXT NOT NULL DEFAULT 'unconfigured', created_at TEXT NOT NULL, UNIQUE(user_id,course_id));`);
  return {
    async login() { const token = randomBytes(32).toString('hex'); const user = { id: randomUUID(), email: 'sinov@example.test', name: 'Sinov foydalanuvchisi' }; db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(hash(token), user.id, Date.now()+7*86400000); return {token, user}; },
    async user(token) { const row = db.prepare('SELECT user_id FROM sessions WHERE token=? AND expires>?').get(hash(token || ''), Date.now()); return row ? { id:row.user_id, email:'sinov@example.test', name:'Sinov foydalanuvchisi' } : null; },
    async logout(token) { db.prepare('DELETE FROM sessions WHERE token=?').run(hash(token || '')); },
    async dashboard(user) { return { favorites: db.prepare('SELECT course_id FROM favorites WHERE user_id=?').all(user.id).map(x=>x.course_id), applications: db.prepare('SELECT * FROM applications WHERE user_id=? ORDER BY created_at DESC').all(user.id) }; },
    async favorite(user, courseId, saved) { db.prepare(saved ? 'INSERT OR IGNORE INTO favorites VALUES (?,?)' : 'DELETE FROM favorites WHERE user_id=? AND course_id=?').run(user.id,courseId); },
    async apply(user, courseId, goal) { const result = db.prepare('INSERT OR IGNORE INTO applications (id,user_id,course_id,goal,created_at) VALUES (?,?,?,?,?)').run(randomUUID(),user.id,courseId,goal,new Date().toISOString()); return { application:db.prepare('SELECT * FROM applications WHERE user_id=? AND course_id=?').get(user.id,courseId), created: result.changes === 1 }; },
    async application(user,id) { return db.prepare('SELECT * FROM applications WHERE id=? AND user_id=?').get(id,user.id); },
    close() { db.close(); }
  };
}
export function createSupabaseRepository(config) {
  const opts = { auth:{ persistSession:false, autoRefreshToken:false }, global:{ fetch:(url,init={})=>fetch(url,{...init,signal:AbortSignal.timeout(10000)}) } };
  const client = token => createClient(config.supabaseUrl,config.anonKey,{...opts,global:{...opts.global,headers:{Authorization:`Bearer ${token}`}}});
  const admin = config.serviceKey ? createClient(config.supabaseUrl,config.serviceKey,opts) : null;
  return {
    async user(token) { if (!token) return null; const {data,error} = await client(token).auth.getUser(token); if(error){if([400,401,403,422].includes(error.status))return null;throw new Error('auth_unavailable');}if(!data.user)return null;return {id:data.user.id,email:data.user.email,name:data.user.user_metadata?.full_name || 'Foydalanuvchi', token}; },
    async dashboard(user) { const sb=client(user.token); const [favorites,applications] = await Promise.all([sb.from('ky_favorites').select('course_id'),sb.from('ky_applications').select('id,course_id,goal,status,telegram_status,created_at').order('created_at',{ascending:false})]); return {favorites:check(favorites).map(x=>x.course_id),applications:check(applications)}; },
    async favorite(user,courseId,saved) { const sb=client(user.token); check(await (saved ? sb.from('ky_favorites').upsert({user_id:user.id,course_id:courseId},{onConflict:'user_id,course_id',ignoreDuplicates:true}) : sb.from('ky_favorites').delete().eq('user_id',user.id).eq('course_id',courseId))); },
    async apply(user,courseId,goal) { return check(await client(user.token).rpc('ky_submit_application',{p_course_id:courseId,p_goal:goal})); },
    async application(user,id) { return check(await client(user.token).from('ky_applications').select('id,course_id,goal,status,telegram_status,created_at').eq('id',id).maybeSingle()); },
    async claim(id) { if (!admin) return null; return check(await admin.rpc('ky_claim_notification',{p_id:id})); },
    async finish(id,status) { check(await admin.from('ky_applications').update({telegram_status:status}).eq('id',id).eq('telegram_status','sending')); },
    async pending() { if(!admin)return []; return check(await admin.from('ky_applications').select('id').eq('telegram_status','pending').limit(20)); },
    async recover() { if(!admin)return; check(await admin.from('ky_applications').update({telegram_status:'unknown'}).eq('telegram_status','sending').lt('notification_claimed_at',new Date(Date.now()-60000).toISOString())); }
  };
}

