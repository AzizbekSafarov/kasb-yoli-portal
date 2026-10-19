import {test,expect} from './fixtures.js';

test('kasbni ko‘rib yopgandan keyin oddiy kirish ariza formasini ochmaydi',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Frontend dasturchi',exact:true}).click();
  await page.getByRole('button',{name:'Oynani yopish',exact:true}).click();
  await page.getByRole('button',{name:'Kirish',exact:true}).click();await page.getByRole('button',{name:'Sinov hisobida davom etish'}).click();
  await expect(page.locator('.toast')).toContainText('hisobiga kirildi');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('mehmon xatcho‘pni bosib kirsa tanlangan kasb saqlanadi',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'UI/UX dizayner — saqlash',exact:true}).click();
  await page.getByRole('button',{name:'Sinov hisobida davom etish'}).click();
  await page.getByRole('button',{name:'Shaxsiy kabinet',exact:true}).click();
  await expect(page.locator('.course-card')).toHaveCount(1);await expect(page.locator('.course-card')).toContainText('UI/UX dizayner');
});
test('mehmon yordamchiga yozib kirsa savoli va yordamchi tiklanadi',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'AI yordamchi',exact:true}).click();
  await page.getByLabel('Nimalarga qiziqasiz?').fill('Sinov: raqamlar va Excel bilan ishlashga qiziqaman.');
  await page.getByRole('button',{name:'Kirish va tavsiya olish'}).click();await page.getByRole('button',{name:'Sinov hisobida davom etish'}).click();
  await expect(page.getByRole('dialog')).toBeVisible();await expect(page.getByLabel('Nimalarga qiziqasiz?')).toHaveValue('Sinov: raqamlar va Excel bilan ishlashga qiziqaman.');
});
test('butun sahifa va dialoglarda idlar takrorlanmaydi, savol tahririda eski tavsiya qolmaydi',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Kirish',exact:true}).click();await page.getByRole('button',{name:'Sinov hisobida davom etish'}).click();
  await page.getByRole('button',{name:'AI yordamchi',exact:true}).click();
  await page.getByLabel('Nimalarga qiziqasiz?').fill('Sinov: raqamlar va Excel');await page.getByRole('button',{name:'Tavsiyalarni ko‘rish',exact:true}).click();
  await expect(page.locator('.advice-results')).toBeVisible();
  await page.getByLabel('Nimalarga qiziqasiz?').fill('Sinov: dizayn va rasm');await expect(page.locator('.advice-results')).toHaveCount(0);
  const duplicates=await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return ids.filter((id,i)=>ids.indexOf(id)!==i);});expect(duplicates).toEqual([]);
});
test('bildirishnoma avval yetkazilgan bo‘lsa xizmat uzilganda ham haqiqiy holati ko‘rinadi',async({page})=>{
  await page.route('**/api/me',route=>route.fulfill({json:{user:{id:'synthetic',name:'Sinov',email:'test@example.test'}}}));
  await page.route('**/api/dashboard',route=>route.fulfill({json:{favorites:[],applications:[{id:'11111111-2222-4333-8444-555555555555',course_id:'frontend',goal:'Sun’iy ariza matni',status:'reviewing',telegram_status:'sent',created_at:'2026-10-19T03:00:00Z'}]}}));
  await page.goto('/#cabinet');await expect(page.locator('.application-card')).toContainText('Telegram: yetkazildi');await expect(page.locator('.application-card')).toContainText('Ko‘rib chiqilmoqda');
  await expect(page.locator('.profile-strip')).not.toContainText(/Supabase|baza/);
});
test('mobil menyu yordamchi ochilganda yopiladi; uzun tafsilotdan ariza tepasiga qaytiladi',async({page})=>{
  await page.setViewportSize({width:320,height:640});await page.goto('/');
  await page.getByRole('button',{name:'Menyuni ochish'}).click();await page.getByRole('button',{name:'AI yordamchi',exact:true}).click();
  await expect(page.locator('.nav')).not.toHaveClass(/is-open/);await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Kirish',exact:true}).click();await page.getByRole('button',{name:'Sinov hisobida davom etish'}).click();
  await page.getByRole('link',{name:'Kurs tanlash',exact:true}).click();
  await page.getByRole('button',{name:'Kiberxavfsizlik tahlilchisi',exact:true}).click();await page.getByRole('button',{name:'Kursga ariza berish',exact:true}).click();
  await expect(page.getByRole('heading',{name:'O‘rganishga tayyormisiz?'})).toBeVisible();
  const box=await page.getByRole('dialog').boundingBox();expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(641);
  expect(await page.getByRole('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
  await page.screenshot({path:'test-results/audit-mobile-application.png'});
});
test('saqlashda klaviatura fokusi yo‘qolmaydi va chiqishda qoralama tozalanadi',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Kirish',exact:true}).click();await page.getByRole('button',{name:'Sinov hisobida davom etish'}).click();await page.getByRole('link',{name:'Kurs tanlash',exact:true}).click();
  await page.getByRole('button',{name:'Frontend dasturchi — saqlash',exact:true}).click();await expect(page.locator('.toast')).toContainText('Yo‘nalish kabinetga saqlandi');
  await expect(page.getByRole('button',{name:'Frontend dasturchi — saqlanganlardan olib tashlash',exact:true})).toBeFocused();
  await page.getByRole('button',{name:'Frontend dasturchi',exact:true}).click();await page.getByRole('button',{name:'Kursga ariza berish',exact:true}).click();
  await page.getByLabel('Bu kasbni nima uchun o‘rganmoqchisiz?').fill('Sinov uchun tugallanmagan qoralama.');await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Shaxsiy kabinet',exact:true}).click();await page.getByRole('button',{name:'Chiqish',exact:true}).click();await expect(page.locator('.toast')).toContainText('Hisobdan chiqdingiz');
  expect(await page.evaluate(()=>Object.keys(sessionStorage).some(k=>k.startsWith('ky_goal_')))).toBe(false);
});

