export const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export const seeded=index=>{const value=Math.sin(index*127.1+311.7)*43758.5453;return value-Math.floor(value);};
export function spherePoint(index,count,time,width,height){
  const y=1-2*(index+.5)/count,r=Math.sqrt(Math.max(0,1-y*y)),angle=index*2.399963229728653;
  const x=Math.cos(angle)*r,z=Math.sin(angle)*r,turn=time*.12;
  const rx=x*Math.cos(turn)-z*Math.sin(turn),rz=x*Math.sin(turn)+z*Math.cos(turn);
  const scale=Math.min(width*.32,height*.43)/(1.5-rz*.28);
  return{x:width*.5+rx*scale,y:height*.5+y*scale,depth:(rz+1)*.5};
}
export function advance(p,target,pointer,waves,dt){
  const step=clamp(dt,0,2),dx=p.x-pointer.x,dy=p.y-pointer.y,d=Math.hypot(dx,dy),radius=105;
  let ax=(target.x-p.x)*.031,ay=(target.y-p.y)*.031;
  if(d>0.1&&d<radius){const force=(1-d/radius)*3.8;ax+=dx/d*force;ay+=dy/d*force;}
  for(const wave of waves){const wx=p.x-wave.x,wy=p.y-wave.y,dist=Math.hypot(wx,wy);if(dist>.1&&Math.abs(dist-wave.radius)<25){ax+=wx/dist*5.5;ay+=wy/dist*5.5;}}
  const damp=Math.pow(.85,step);p.vx=(p.vx+ax*step)*damp;p.vy=(p.vy+ay*step)*damp;p.x+=p.vx*step;p.y+=p.vy*step;
}
