import {test,expect} from './fixtures.js';
async function loginAndApply(page){
  await page.goto('/');await page.getByRole('button',{name:'Frontend dasturchi',exact:true}).click();await page.getByRole('button',{name:'Kursga ariza berish',exact:true}).click();await page.getByRole('button',{name:'Sinov hisobida davom etish'}).click();
  await page.getByLabel('Bu kasbni nima uchun o‘rganmoqchisiz?').fill('Sun’iy sinov: portfolio sayti yaratishni o‘rganmoqchiman.');
}
test('sessiya tugaganda qayta kirish va yozilgan maqsadni tiklash',async({page})=>{
  await loginAndApply(page);
  await page.route('**/api/applications',route=>route.fulfill({status:401,json:{error:'Davom etish uchun hisobingizga kiring.'}}));
  await page.getByRole('button',{name:'Arizani yuborish',exact:true}).click();
  await expect(page.getByRole('button',{name:'Sinov hisobida davom etish'})).toBeVisible();await expect(page.getByRole('alert')).toContainText('Sessiyangiz tugadi');
  await page.getByRole('button',{name:'Sinov hisobida davom etish'}).click();await expect(page.getByLabel('Bu kasbni nima uchun o‘rganmoqchisiz?')).toHaveValue('Sun’iy sinov: portfolio sayti yaratishni o‘rganmoqchiman.');
});
test('ariza yuborishda tarmoq xatosi matnni yo‘qotmaydi va qayta yuborish ishlaydi',async({page})=>{
  await loginAndApply(page);await page.route('**/api/applications',route=>route.abort('failed'));
  await page.getByRole('button',{name:'Arizani yuborish',exact:true}).click();await expect(page.getByRole('alert')).toContainText('aloqa uzildi');
  await expect(page.getByLabel('Bu kasbni nima uchun o‘rganmoqchisiz?')).toHaveValue(/Sun’iy sinov/);
  await page.unroute('**/api/applications');await page.getByRole('button',{name:'Arizani yuborish',exact:true}).click();await expect(page.getByRole('heading',{name:'Arizangiz saqlandi',exact:true})).toBeVisible();
});
test('kabinetda xizmat xatosidan keyin qayta urinish ma’lumotni tiklaydi',async({page})=>{
  await loginAndApply(page);await page.getByRole('button',{name:'Arizani yuborish',exact:true}).click();await expect(page.getByRole('heading',{name:'Arizangiz saqlandi',exact:true})).toBeVisible();await page.getByRole('button',{name:'Kabinetda ko‘rish',exact:true}).click();
  await page.route('**/api/dashboard',route=>route.fulfill({status:503,json:{error:'Xizmatga ulanishda muammo.'}}));
  await page.getByRole('button',{name:'Yangilash',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Xizmatga ulanishda muammo');await expect(page.locator('.application-card')).toHaveCount(1);
  await page.unroute('**/api/dashboard');await page.getByRole('button',{name:'Qayta urinish',exact:true}).click();await expect(page.getByRole('alert')).toHaveCount(0);await expect(page.locator('.application-card')).toHaveCount(1);
});
test('yuborishni tez ikki marta bosish bitta so‘rov va ariza hosil qiladi',async({page})=>{
  await loginAndApply(page);let calls=0;await page.route('**/api/applications',async route=>{calls++;await new Promise(resolve=>setTimeout(resolve,200));await route.continue();});
  await page.getByRole('button',{name:'Arizani yuborish',exact:true}).dblclick();await expect(page.getByRole('heading',{name:'Arizangiz saqlandi',exact:true})).toBeVisible();expect(calls).toBe(1);
  await page.getByRole('button',{name:'Kabinetda ko‘rish',exact:true}).click();await expect(page.locator('.application-card')).toHaveCount(1);
});
test('kabinet sessiyasi tugaganda eski shaxsiy ma’lumot yashiriladi',async({page})=>{
  await loginAndApply(page);await page.getByRole('button',{name:'Arizani yuborish',exact:true}).click();await expect(page.getByRole('heading',{name:'Arizangiz saqlandi',exact:true})).toBeVisible();await page.getByRole('button',{name:'Kabinetda ko‘rish',exact:true}).click();
  await page.route('**/api/dashboard',route=>route.fulfill({status:401,json:{error:'Kirish muddati tugadi.'}}));await page.getByRole('button',{name:'Yangilash',exact:true}).click();
  await expect(page.locator('.application-card')).toHaveCount(0);await expect(page.getByRole('button',{name:'Hisobga kirish',exact:true})).toBeVisible();
});
test('mobil menyu Escape va tashqarini bosish bilan yopiladi',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/');
  await page.getByRole('button',{name:'Menyuni ochish'}).click();await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Menyuni ochish'})).toBeFocused();
  await page.getByRole('button',{name:'Menyuni ochish'}).click();await page.getByRole('heading',{name:/Qiziqishingiz/}).click();await expect(page.locator('.nav')).not.toHaveClass(/is-open/);
});

