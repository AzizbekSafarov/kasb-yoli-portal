import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { z } from 'zod';
import { courses, courseById } from '../shared/catalog.js';
import { advise, deliverNotification } from './services.js';
const cookieToken=req=>req.headers.cookie?.split(';').find(x=>x.trim().startsWith('ky_demo='))?.trim().slice(8);
const goalSchema=z.object({courseId:z.string().refine(id=>Boolean(courseById(id))),goal:z.string().trim().min(15).max(600)}).strict();
const adviceInput=z.object({interest:z.string().trim().min(3).max(600),experience:z.enum(['new','some','experienced'])}).strict();
export function createApp(config,repo) {
  const app=express();
  app.disable('x-powered-by'); app.set('trust proxy',1);
  app.use(helmet({contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'"],fontSrc:["'self'"],imgSrc:["'self'",'data:'],connectSrc:["'self'",...(config.supabaseUrl?[config.supabaseUrl]:[])],objectSrc:["'none'"],frameAncestors:["'none'"],upgradeInsecureRequests:config.production?[]:null}},strictTransportSecurity:config.production?undefined:false}));
  app.use(express.json({limit:'12kb'}));
  app.get('/health',(_req,res)=>res.json({status:'ok'}));
  app.use('/api',(req,res,next)=>{res.set('Cache-Control','no-store'); req.requestId=randomUUID(); if(!['GET','HEAD'].includes(req.method) && req.headers.origin && ![config.origin,...(!config.production?['http://localhost:5173','http://127.0.0.1:5173','http://localhost:3001','http://127.0.0.1:3001']:[])].includes(req.headers.origin))return res.status(403).json({error:'Bu manzildan so‘rovga ruxsat yo‘q.'}); next();});
  const limiter=rateLimit({windowMs:60000,limit:80,standardHeaders:'draft-8',legacyHeaders:false,message:{error:'Juda ko‘p so‘rov yuborildi. Bir daqiqadan keyin urinib ko‘ring.'}});
  app.use('/api',limiter);
  app.get('/api/config',(_req,res)=>res.json({demo:config.demo,authReady:config.authReady,supabaseUrl:config.supabaseUrl,supabaseAnonKey:config.anonKey,aiReady:Boolean(config.groqKey),telegramReady:config.telegramReady}));
  app.get('/api/catalog',(_req,res)=>res.json({courses}));
  const authenticate=async(req,res,next)=>{
    const token=config.demo?cookieToken(req):req.headers.authorization?.replace(/^Bearer /,'');
    req.user=await repo.user(token);
    if(!req.user)return res.status(401).json({error:'Davom etish uchun hisobingizga kiring.'});
    next();
  };
  app.get('/api/me',async(req,res)=>{const token=config.demo?cookieToken(req):req.headers.authorization?.replace(/^Bearer /,''); const user=await repo.user(token);res.json({user:user?{id:user.id,email:user.email,name:user.name}:null});});
  if(config.demo){
    app.post('/api/demo/login',async(_req,res)=>{const {token,user}=await repo.login();res.cookie('ky_demo',token,{httpOnly:true,sameSite:'strict',secure:false,maxAge:7*86400000,path:'/'});res.json({user});});
    app.post('/api/demo/logout',async(req,res)=>{await repo.logout(cookieToken(req));res.clearCookie('ky_demo',{path:'/'}).json({ok:true});});
  }
  app.get('/api/dashboard',authenticate,async(req,res)=>res.json(await repo.dashboard(req.user)));
  app.put('/api/favorites/:courseId',authenticate,async(req,res)=>{if(!courseById(req.params.courseId)||typeof req.body.saved!=='boolean')return res.status(400).json({error:'Yo‘nalish yoki saqlash amali noto‘g‘ri.'});await repo.favorite(req.user,req.params.courseId,req.body.saved);res.json({saved:req.body.saved});});
  app.post('/api/applications',authenticate,async(req,res)=>{
    const parsed=goalSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Kursni tanlang va maqsadingizni 15–600 ta belgi bilan yozing.'});
    const result=await repo.apply(req.user,parsed.data.courseId,parsed.data.goal);
    // A committed application is returned even if notification delivery fails.
    if(config.telegramReady) { try {await deliverNotification(repo,config,result.application.id);}catch{console.warn(JSON.stringify({requestId:req.requestId,event:'notification_status_unavailable'}));} }
    let application=result.application;
    try{application=await repo.application(req.user,application.id)||application;}catch{}
    res.status(result.created?201:200).json({application,created:result.created});
  });
  app.post('/api/applications/:id/notification',authenticate,async(req,res)=>{
    if(!z.uuid().safeParse(req.params.id).success)return res.status(404).json({error:'Ariza topilmadi.'});
    const existing=await repo.application(req.user,req.params.id);if(!existing)return res.status(404).json({error:'Ariza topilmadi.'});
    if(!config.telegramReady)return res.status(503).json({error:'Telegram hali sozlanmagan. Arizangiz saqlangan.'});
    if(existing.telegram_status==='unknown')return res.status(409).json({error:'Yetkazilish noma’lum. Takror xabar yubormaslik uchun sinov chatini tekshiring.'});
    try{await deliverNotification(repo,config,existing.id);}catch{}
    res.json({application:await repo.application(req.user,existing.id)});
  });
  app.post('/api/advice',authenticate,rateLimit({windowMs:60000,limit:8,standardHeaders:'draft-8',legacyHeaders:false,message:{error:'Yordamchiga ko‘p savol berildi. Bir daqiqadan so‘ng urinib ko‘ring.'}}),async(req,res)=>{const parsed=adviceInput.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Qiziqishingizni 3–600 ta belgi bilan yozing va tajribangizni tanlang.'});res.json(await advise(config,parsed.data.interest,parsed.data.experience));});
  app.use('/api',(_req,res)=>res.status(404).json({error:'So‘ralgan xizmat topilmadi.'}));
  if(existsSync(resolve('dist/index.html'))){app.use(express.static(resolve('dist')));app.get('/{*path}',(_req,res)=>res.sendFile(resolve('dist/index.html')));}
  app.use((err,req,res,_next)=>{const status=err.type==='entity.too.large'?413:err.type==='entity.parse.failed'?400:503;console.error(JSON.stringify({event:'request_failed',requestId:req.requestId,code:status}));res.status(status).json({error:status===400?'So‘rov shakli noto‘g‘ri.':status===413?'Yuborilgan ma’lumot juda katta.':'Xizmatga ulanishda muammo. Birozdan keyin qayta urinib ko‘ring.',requestId:req.requestId});});
  return app;
}
