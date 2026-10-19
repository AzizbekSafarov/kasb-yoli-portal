import {test,expect} from './fixtures.js';
import AxeBuilder from '@axe-core/playwright';
test('asosiy ekranlar va dialoglarda accessibility',async({page})=>{
  await page.goto('/');await expect(page.getByRole('button',{name:'Kirish',exact:true})).toBeEnabled();
  const scan=async(label)=>{const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),label).toEqual([]);};
  await scan('landing');
  await page.getByRole('button',{name:'Frontend dasturchi',exact:true}).click();await scan('detail');await page.keyboard.press('Escape');
  await page.getByRole('link',{name:'Qanday boshlash kerak?',exact:true}).click();await scan('guide');
  await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Menyuni ochish'}).click();await scan('mobile menu');
  await page.getByRole('button',{name:'Kirish',exact:true}).click();await scan('login');await page.getByRole('button',{name:'Sinov hisobida davom etish'}).click();
  await scan('empty cabinet');await page.getByRole('link',{name:'Kurs tanlash',exact:true}).click();
  await page.getByRole('button',{name:'Frontend dasturchi',exact:true}).click();await page.getByRole('button',{name:'Kursga ariza berish',exact:true}).click();await scan('application');
});

