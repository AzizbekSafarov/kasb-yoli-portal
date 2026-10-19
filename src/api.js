import { createClient } from '@supabase/supabase-js';
let authClient=null;
export class ApiError extends Error{
  constructor(message,status,path){super(message);this.name='ApiError';this.status=status;this.path=path;}
}
export function setupAuth(config){
  if(config.authReady && !config.demo && !authClient)authClient=createClient(config.supabaseUrl,config.supabaseAnonKey,{auth:{flowType:'pkce',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  return authClient;
}
export async function request(path,options={}) {
  const headers={'Content-Type':'application/json',...options.headers};
  if(authClient){const {data}=await authClient.auth.getSession();if(data.session)headers.Authorization=`Bearer ${data.session.access_token}`;}
  let response;
  try { response=await fetch(`/api${path}`,{...options,headers,credentials:'same-origin',signal:AbortSignal.timeout(25000)}); }
  catch{throw new Error('Server bilan aloqa uzildi. Internetni tekshirib, qayta urinib ko‘ring.');}
  const body=await response.json().catch(()=>({error:'Server javobini o‘qib bo‘lmadi.'}));
  if(!response.ok)throw new ApiError(body.error||'Amal bajarilmadi. Qayta urinib ko‘ring.',response.status,path);
  return body;
}
export async function loginGoogle(){
  if(!authClient)throw new Error('Google orqali kirish hali sozlanmagan. Kurslarni ko‘rishda davom etishingiz mumkin.');
  const {error}=await authClient.auth.signInWithOAuth({provider:'google',options:{redirectTo:`${location.origin}/auth/callback`,scopes:'openid email profile'}});
  if(error)throw new Error('Google orqali kirish boshlanmadi. Qayta urinib ko‘ring.');
}
export async function logout(config){if(config.demo)await request('/demo/logout',{method:'POST'});else {const {error}=await authClient.auth.signOut();if(error)throw new Error('Hisobdan chiqish bajarilmadi. Qayta urinib ko‘ring.');}}
