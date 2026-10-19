import {test,expect} from '@playwright/test';
test('qidirish → tafsilot → kirish → ariza → reload → kabinet',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page.getByRole('heading',{name:/Qiziqishingizni/})).toBeVisible();
  await page.getByRole('searchbox',{name:'Kasb yoki kurs qidirish'}).fill('mavjudemas');await expect(page.getByRole('heading',{name:'Hozircha topilmadi'})).toBeVisible();
  await page.getByRole('button',{name:'Barcha yo‘nalishlarni ko‘rish'}).click();
  await page.getByRole('searchbox',{name:'Kasb yoki kurs qidirish'}).fill('frontend');
  await page.getByRole('button',{name:'Frontend dasturchi',exact:true}).click();
  await expect(page.getByRole('dialog')).toContainText('Veb dasturlash asoslari');
  await page.getByRole('button',{name:'Kursga ariza berish',exact:true}).click();
  await page.getByRole('button',{name:'Sinov hisobida davom etish'}).click();
  await page.getByRole('button',{name:'Arizani yuborish'}).click();await expect(page.getByRole('alert')).toContainText('kamida 15');
  await page.getByLabel('Bu kasbni nima uchun o‘rganmoqchisiz?').fill('Sun’iy sinov: o‘z portfolio saytimni yaratishni o‘rganmoqchiman.');
  await page.getByRole('button',{name:'Arizani yuborish'}).click();await expect(page.getByRole('heading',{name:'Arizangiz saqlandi'})).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('Telegram: ulanmagan');
  await page.getByRole('button',{name:'Kabinetda ko‘rish'}).click();await expect(page.locator('.application-card')).toHaveCount(1);
  await page.reload();await expect(page.locator('.application-card')).toHaveCount(1);await expect(page.locator('.application-card')).toContainText('Sun’iy sinov');
  await page.getByRole('link',{name:'Kasblar va kurslar',exact:true}).click();
  await page.getByRole('button',{name:'Frontend dasturchi — saqlash',exact:true}).click();
  await page.getByRole('button',{name:'Shaxsiy kabinet',exact:true}).click();
  await expect(page.locator('.course-card')).toHaveCount(1);await page.reload();await expect(page.locator('.course-card')).toHaveCount(1);
  await page.getByRole('button',{name:'AI yordamchi',exact:true}).click();
  await page.getByLabel('Nimalarga qiziqasiz?').fill('Excel, matematika va raqamlarni tahlil qilish');
  await page.getByRole('button',{name:'Tavsiyalarni ko‘rish',exact:true}).click();await expect(page.locator('.advice-results')).toContainText('Ma’lumotlar tahlilchisi');
  await expect(page.locator('.advice-results')).toContainText('AI hali ulanmagan');
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(errors).toEqual([]);
});
test('filtrlar, qisqa mashq va 320–1440 px kengliklar',async({page})=>{
  await page.goto('/');
  await page.getByRole('radio',{name:'Dizayn va ijod'}).check();await page.getByRole('button',{name:'Menga mos yo‘lni topish'}).click();await expect(page.locator('.quiz-result')).toContainText('UI/UX dizayner');
  await page.getByRole('button',{name:'Dasturlash',exact:true}).click();await page.getByLabel('O‘qish shakli').selectOption('Gibrid');await expect(page.locator('.course-card')).toHaveCount(1);await expect(page.locator('.course-card')).toContainText('Python dasturchi');
  await page.getByRole('button',{name:'Barchasi',exact:true}).click();await page.getByLabel('O‘qish shakli').selectOption('Barchasi');
  for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:900});await expect(page.getByRole('heading',{name:/Qiziqishingizni/})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width}`).toBe(true);await page.screenshot({path:`test-results/home-${width}.png`,fullPage:true});}
});
