import React,{useEffect,useRef,useState} from 'react';
import {Pause,Play,ArrowUpRight,ArrowDown,Sparkles,MoveUpRight} from 'lucide-react';
import {advance,clamp,seeded,spherePoint} from './particles.js';

// One bounded canvas per scene. Positions persist as targets morph; no DOM particle nodes.
export default function ParticleField({variant='hero',paused=false}){
  const canvasRef=useRef(null),controller=useRef(null),[ready,setReady]=useState(false);
  useEffect(()=>{
    let disposed=false,frame=0,last=0,time=0,visible=false;let points=[],targets=[],width=1,height=1;let waves=[];
    const canvas=canvasRef.current,context=canvas.getContext('2d');if(!context)return;
    const media=matchMedia('(prefers-reduced-motion: reduce)');let reduced=media.matches;
    const pointer={x:-10000,y:-10000};const image=new Image();image.src='/logo-192.png';
    const state={paused};controller.current=state;
    const sample=document.createElement('canvas'),mask=sample.getContext('2d',{willReadFrequently:true});
    function buildTargets(){
      sample.width=Math.max(1,Math.round(width));sample.height=Math.max(1,Math.round(height));mask.clearRect(0,0,width,height);
      const mobile=width<600,logoSize=variant==='hero'?Math.min(width*.65,height*.86):Math.min(height*(mobile ? .39 : .6),width*.2);
      const lx=variant==='hero'?(width-logoSize)/2:mobile?(width-logoSize)/2:width*.08;
      const ly=variant==='hero'?(height-logoSize)/2:mobile?height*.03:(height-logoSize)/2;
      if(image.complete&&image.naturalWidth)mask.drawImage(image,lx,ly,logoSize,logoSize);
      if(variant==='brand'){
        mask.fillStyle='#772c3c';mask.textAlign='center';mask.textBaseline='middle';
        const fontSize=mobile?width*.17:width*.13;mask.font=`400 ${fontSize}px "Instrument Serif"`;
        mask.fillText('Kasb yo‘li',mobile?width*.5:width*.63,mobile?height*.68:height*.5,mobile?width*.94:width*.66);
      }
      const pixels=mask.getImageData(0,0,sample.width,sample.height).data,candidates=[];
      // Ignore the ivory logo background and keep the cherry symbol + gold pathway.
      const spacing=width<600?5:5.7;
      for(let y=2;y<height;y+=spacing)for(let x=2;x<width;x+=spacing){const i=(Math.floor(y)*sample.width+Math.floor(x))*4;const r=pixels[i],g=pixels[i+1],b=pixels[i+2];if(pixels[i+3]>160&&(r<185||g<225||b<175))candidates.push({x,y,gold:r>190&&g>120,color:r>190&&g>120?'#c68837':'#772c3c'});}
      const limit=width<600?1450:2800;
      targets=candidates.length>limit?Array.from({length:limit},(_,i)=>candidates[Math.floor(i*candidates.length/limit)]):candidates;
      points=targets.map((t,i)=>points[i]||{x:width*seeded(i+13),y:height*seeded(i+81),vx:0,vy:0});
      if(reduced||state.paused)points.forEach((p,i)=>{p.x=targets[i].x;p.y=targets[i].y;p.vx=p.vy=0;});
      canvas.dataset.particles=String(points.length);if(points.length){canvas.dataset.ready='true';setReady(true);}
    }
    function resize(){const box=canvas.getBoundingClientRect();width=Math.max(1,box.width);height=Math.max(1,box.height);const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);context.setTransform(dpr,0,0,dpr,0,0);buildTargets();paint(0);start();}
    function paint(dt){
      context.clearRect(0,0,width,height);
      const morph=reduced||state.paused?1:variant==='hero'?(Math.sin(time*.35)>-.48?1:.1):1;
      const entry=reduced||state.paused?1:clamp(time/2.2,0,1),blend=morph*entry;
      const scrollPhase=variant==='brand'?clamp((innerHeight-canvas.getBoundingClientRect().top)/(innerHeight*.65),0,1):1;
      points.forEach((p,i)=>{
        const target=targets[i],orb=spherePoint(i,points.length,time,width,height);
        const wave=reduced||state.paused?0:Math.sin(target.x/width*7-time*.8)*4+Math.sin(target.y/height*5+time*.55)*2;
        const aim={x:orb.x+(target.x-orb.x)*blend,y:orb.y+(target.y-orb.y)*blend+wave*(variant==='brand'?.9:.5)};
        if(variant==='brand'&&!reduced&&!state.paused){aim.x=target.x+(seeded(i+3)-.5)*width*(1-scrollPhase);aim.y=target.y+(seeded(i+5)-.5)*height*(1-scrollPhase)+wave;}
        if(dt)advance(p,aim,pointer,waves,dt);
        context.globalAlpha=(reduced||state.paused) ? .93 : .5+orb.depth*.45;
        context.fillStyle=target.color;const size=(width<600?1.2:1.65)+(target.gold ? .15 : 0);
        context.beginPath();context.arc(p.x,p.y,size,0,Math.PI*2);context.fill();
      });context.globalAlpha=1;
    }
    function tick(now){frame=0;if(!visible||document.hidden||reduced||state.paused)return;const dt=last?clamp((now-last)/16.6667,0,2):1;last=now;time+=dt/60;waves=waves.map(w=>({...w,radius:w.radius+dt*9})).filter(w=>w.radius<Math.max(width,height));paint(dt);start();}
    function start(){if(!frame&&visible&&!document.hidden&&!reduced&&!state.paused)frame=requestAnimationFrame(tick);}
    function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
    state.update=()=>{stop();if(state.paused||reduced){points.forEach((p,i)=>{p.x=targets[i].x;p.y=targets[i].y;p.vx=p.vy=0;});paint(0);}else start();};
    const move=e=>{if(e.pointerType==='touch'||reduced||state.paused)return;const box=canvas.getBoundingClientRect();pointer.x=e.clientX-box.left;pointer.y=e.clientY-box.top;};
    const leave=()=>{pointer.x=pointer.y=-10000;};
    const click=e=>{if(!reduced&&!state.paused){const box=canvas.getBoundingClientRect();waves.push({x:e.clientX-box.left,y:e.clientY-box.top,radius:0});}};
    const visibility=()=>{document.hidden?stop():start();};
    const onReduced=e=>{reduced=e.matches;state.update();};
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;visible?start():stop();},{rootMargin:'70px'});observer.observe(canvas);
    const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas);
    canvas.addEventListener('pointermove',move,{passive:true});canvas.addEventListener('pointerleave',leave);canvas.addEventListener('pointerdown',click,{passive:true});document.addEventListener('visibilitychange',visibility);media.addEventListener('change',onReduced);
    Promise.all([image.decode().catch(()=>{}),document.fonts.load('400 140px "Instrument Serif"')]).then(()=>{if(!disposed)resize();});
    return()=>{disposed=true;stop();observer.disconnect();resizeObserver.disconnect();canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerleave',leave);canvas.removeEventListener('pointerdown',click);document.removeEventListener('visibilitychange',visibility);media.removeEventListener('change',onReduced);controller.current=null;};
  },[variant]);
  useEffect(()=>{if(controller.current){controller.current.paused=paused;controller.current.update();}},[paused]);
  return <div className={`particle-field ${ready?'is-ready':''} variant-${variant}`}><canvas ref={canvasRef} aria-hidden="true"/><div className="particle-static" aria-hidden="true"><img src="/logo-192.png" alt=""/>{variant==='brand'&&<span>Kasb yo‘li</span>}</div></div>;
}
export function CinematicHero({onAdvice}){
  const [paused,setPaused]=useState(false);
  return <section className="cinematic-hero" id="discover"><div className="particle-stage"><div className="scene-side-note"><span>QIZIQISHDAN IMKONIYAT SARI</span><span>01 / KASHF ETING</span></div><ParticleField paused={paused}/><span className="scene-label">BIR QADAM. MING IMKONIYAT.</span><button className="motion-button" onClick={()=>setPaused(!paused)} aria-pressed={paused}>{paused?<Play size={13}/>:<Pause size={13}/>}<span>{paused?'Harakatni yoqish':'Harakatni to‘xtatish'}</span></button></div><div className="cinematic-copy"><div><span className="eyebrow"><span className="status-dot"/> KELAJAK TAYYOR YO‘L EMAS. UNI SIZ YARATASIZ.</span><h1>Qiziqishingiz —<br/>kelajagingizga <em>yo‘l.</em></h1></div><div className="cinematic-aside"><p>Qobiliyatingizga bir imkon bering. Zamonaviy kasblarni kashf eting, o‘zingizga mos yo‘nalishni toping va o‘rganishni bugundan boshlang.</p><a className="button primary" href="#catalog">O‘z yo‘limni topish <ArrowUpRight size={19}/></a><button className="text-link" onClick={onAdvice}><Sparkles size={15}/> Tanlashda yordam bering</button></div></div><div className="cinematic-baseline"><span>O‘ZBEK TILIDA · YOSHLAR UCHUN</span><a href="#catalog">Imkoniyatlarni kashf eting <ArrowDown size={15}/></a><span>HAR BIR KATTA YO‘L BIR QADAMDAN.</span></div></section>;
}
export function ParticleSignature(){
  const [paused,setPaused]=useState(false);
  return <section className="particle-signature" aria-label="Nuqtalardan yig‘ilgan Kasb yo‘li brendi"><div className="signature-heading"><span className="eyebrow">BIR NUQTA — BIR IMKONIYAT.</span><h2>Kelajagingizni<br/><em>o‘zingiz yarating.</em></h2><p>Har bir qiziqish, har bir urinish, har bir kichik qadam.<br/>Birgalikda — sizning katta yo‘lingiz.</p></div><div className="signature-art"><ParticleField variant="brand" paused={paused}/><button className="motion-button" onClick={()=>setPaused(!paused)} aria-pressed={paused}>{paused?<Play size={13}/>:<Pause size={13}/>}<span>{paused?'Harakatni yoqish':'Harakatni to‘xtatish'}</span></button></div><div className="signature-bottom"><span>SIZDAN BOSHLANADI.</span><a href="#catalog">Birinchi qadamni qo‘yish <MoveUpRight size={19}/></a><span>KASB YO‘LI / 2026</span></div></section>;
}
