import test from 'node:test';
import assert from 'node:assert/strict';
import {advance,spherePoint} from '../src/particles.js';
test('pointer itargan nuqta nishonga qaytadi; katta frame tanaffusi fizikani buzmaydi',()=>{
  const point={x:100,y:100,vx:0,vy:0},target={x:100,y:100};
  for(let i=0;i<30;i++)advance(point,target,{x:99,y:100},[{x:50,y:50,radius:i*5}],i===2?1000:1);
  assert.ok(Number.isFinite(point.x)&&Number.isFinite(point.y));assert.ok(Math.hypot(point.x-100,point.y-100)>1);
  for(let i=0;i<500;i++)advance(point,target,{x:-10000,y:-10000},[],1);
  assert.ok(Math.hypot(point.x-100,point.y-100)<.01);
});
test('orbita nishonlari ekran chegarasida va rang chuqurligi haqiqiy',()=>{
  for(const width of [320,1440])for(let i=0;i<1000;i++){const p=spherePoint(i,1000,45,width,350);assert.ok(p.x>=0&&p.x<=width);assert.ok(p.y>=0&&p.y<=350);assert.ok(p.depth>=0&&p.depth<=1);}
});
