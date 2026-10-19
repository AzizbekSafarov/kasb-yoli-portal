# Haqiqiy tekshiruv qaydi

Sana: 2026-yil 19-oktabr, Asia/Tashkent. Sun’iy ariza va maqsad matnlari ishlatildi. Google kirish uchun loyiha egasining mavjud hisobidan foydalanildi; uning profil ma’lumotlari bu qaydga kiritilmadi.

## Mahalliy avtomatik tekshiruvlar

`npm test`: **9/9 o‘tdi**.

- 8 ta noyob kasb, to‘liq kurs tafsilotlari va har biriga 3 boshlash qadami.
- Nom/ko‘nikma qidiruvi, apostrof normalizatsiyasi, yo‘nalish va formatning birgalikdagi filtri; bo‘sh va topilmagan qidiruv.
- Login bo‘lmasa shaxsiy API 401; noto‘g‘ri kurs/qisqa maqsad/forged owner maydoni 400.
- Bir kursga 6 parallel yuborishda bitta 201, qolganlari 200 va bir xil ariza IDsi.
- Ikkinchi foydalanuvchi birinchining ariza/xatcho‘plarini ko‘rmaydi; begona ariza bildirishnomasi 404.
- SQLite bazasi yopib qayta ochilganda saqlanish; chiqishdan keyingi sessiya bekor bo‘lishi; begona origin 403.
- AI noto‘g‘ri/mavjud bo‘lmagan kurs yoki timeout qaytarsa katalog tavsiyasi ishlaydi. To‘g‘ri model javobi faqat whitelistdan qabul qilinadi. Bu API javobi sun’iy model bilan sinalgan, haqiqiy Groq chaqiruvi emas.
- Telegram `ok=true` + `message_id` bo‘lsa sent; rad javobi failed; timeout unknown. Takror claim xabarni ikki marta yubormaydi. Bular mock javoblar, real Telegram yetkazilishi dalili emas.
- Nuqta fizikasi katta frame tanaffusida finite qolishi, pointerdan keyin nishonga qaytishi; orbita koordinatalari viewport ichida.

`npx playwright test`: **4/4 o‘tdi**.

1. Qidirish → tafsilot → alohida belgilangan sinov login → validatsiya → ariza → kabinet → reload → xatcho‘p → yordamchi fallback → Escape. JS pageerror yo‘q.
2. Qisqa qiziqish mashqi, kombinatsiyalangan filtr, 320/390/768/1024/1440 px. Gorizontal overflow aniqlanmadi. Shu o‘lchamlardagi screenshotlar `test-results/home-*.png` ga yozildi.
3. Hero va pastki brend canvaslari tayyor, 500+ nuqta, pause’da render o‘zgarmaydi; reduced-motion’da pastki sahna statik. JS pageerror yo‘q.
4. Bekor qilingan OAuth callback tushunarli xabar beradi. Sun’iy 503 config xatosida ham katalogni qidirish va kasb tafsilotini ochish ishlaydi.

`npm run build`: muvaffaqiyatli. Frontend auth-vendor/react-vendor/app chunklariga ajratildi. Lokal fontlar va shaffof PNG logolar ishlatiladi; logo asl faylining burchak alpha qiymati 0.

## Haqiqiy Supabase tekshiruvi

Mavjud `kasb-yoli` loyihasida yangi `ky_courses`, `ky_favorites`, `ky_applications` jadvallari yaratildi. Avvalgi `courses`, `profiles`, `saved_courses`, `applications` jadvallari o‘zgartirilmadi.

Chrome’dagi SQL Editor’da `supabase/verify-rls.sql` mazmuni haqiqiy bazada bajarildi. Natija:

> PASS: unique application, own read/write, foreign read blocked, forged ownership and delivery blocked. All synthetic rows rolled back.

Ikki sun’iy auth foydalanuvchisi va yozuvlar tranzaksiya ichida yaratilib rollback qilindi. Authenticated rol bilan o‘z yozuvini o‘qish, begona yozuvlarni ko‘rmaslik, begona user_id bilan xatcho‘p qo‘sholmaslik va telegram_status’ni o‘zgartira olmaslik tekshirildi.

## Jonli Render oqimi

Manzil: https://kasb-yoli-portal.onrender.com

- Chrome’da Frontend qidirildi, tafsilotdan ariza amali bosildi.
- Haqiqiy Google OAuth → Supabase → `/auth/callback` oqimi ishladi; tanlangan kurs ariza formasi qayta ochildi.
- Sun’iy maqsad bilan ariza saqlandi: **KY-66DC8A47**. Kabinetda holati “Qabul qilindi”. Reload’dan so‘ng ayni yozuv saqlandi.
- Frontend xatcho‘pi haqiqiy Supabase’ga yozildi va kabinetda ko‘rindi.
- AI kaliti yo‘qligida “AI hali ulanmagan” deb belgilangan tavsiya Ma’lumotlar tahlilchisi va Python yo‘nalishlarini amaliy qadamlar bilan ko‘rsatdi.
- `node scripts/smoke.mjs`: health=ok, demo=false, authReady=true, katalog=8, login bo‘lmagan dashboard=401, `/auth/callback`, privacy/terms va logo fayllari=200. Config’da server secrets topilmadi.
- Telegram kaliti foydalanuvchi topshirig‘iga ko‘ra ulanmagan. Haqiqiy Telegram xabari yuborilmadi va “yetkazildi” deb ko‘rsatilmadi. Yangi interfeys “Telegram: ulanmagan” deydi, yozuv keyingi ulanish uchun pending turadi.

## Hosting va monitoring

Render Free Web Service: `srv-dbaotomq1p3s73ch6qt0`. Health: `/health`. Build `npm ci --include=dev && npm run build`; start `npm start`; Node 24.22.0; production’da demo o‘chiq.

Birinchi build’da production npm devDependencies’ni tashlab ketgani sabab `vite: not found` chiqdi. Build buyrug‘i tuzatildi, keyingi build va deploy muvaffaqiyatli bo‘ldi. Bu xato yashirilmadi.

UptimeRobot monitor: `804329890`, `https://kasb-yoli-portal.onrender.com/health`, har 5 daqiqa, Free rejimdagi HEAD so‘rovi. Panelda **Up** tasdiqlandi. Dastlabki deploy paytidagi 502 hodisasi 5 daqiqa 5 soniyadan keyin Resolved bo‘lgan; yangi monitorning qisqa tarixidagi foiz SLA deb ko‘rsatilmaydi.

## Google Auth brending holati

App name “Kasb yo‘li”, logo, homepage, privacy va terms havolalari saqlandi. OAuth faqat openid/email/profile ma’lumotlarini so‘raydi, nonce tekshiruvi o‘chirilmagan. Audience In production holatiga o‘tkazildi.

Google Verify branding urinishida homepage egaligi tasdiqlanmaganligi qaytdi. Ko‘rsatilgan talab: Search Console’da egalikni tasdiqlab, tizimlar yangilanishi uchun 24 soat kutish. Tasdiq fayli `public/google3795099e3c0dfe97.html` deploy qilindi; sayt mazmuni tekshirildi; Google Search Console’da **Ownership verified** chiqdi. Google brend tasdig‘i bo‘lmaguncha consent oynasida Supabase domeni ko‘rinishi mumkin; “nom allaqachon almashdi” deb da’vo qilinmaydi. 24 soatdan keyingi qayta tekshiruv hali bajarilmagan.

Mahalliy ko‘rinish dalillari: [desktop](screenshots/landing-desktop.png), [telefon](screenshots/landing-mobile.png). Ular yangi SI/GOV ruhidagi landing, shaffof logo va pastki nuqtali brendni ko‘rsatadi. Bu suratlar mahalliy mashq rejimida olingan; real Google/RLS natijalarining o‘rnini bosmaydi.

## Ochiq cheklovlar

Haqiqiy Groq javobi va real Telegram yetkazilishi hozir tekshirilmagan — foydalanuvchi maxfiy kalitlar o‘rniga vaqtincha fake/ulanmagan rejimni tanlagan. Haqiqiy ikkinchi Google hisobida login va RLS browser oqimi o‘tkazilmagan; izolyatsiya real PostgreSQL rollarida va lokal API’da sinalgan. Sovuq start, uzoq muddatli uptime va yuqori yuklama bo‘yicha kafolat berilmaydi.

## Foydalanuvchi qaydidan keyingi kengaytirilgan audit — 2026-10-19

Faqat texnik yozuvni olib tashlash bilan cheklanilmadi. Avvalgi 4 ta UI testi qo‘shimcha oqimlarni qamramagan edi. Auditda topilgan va tuzatilgan muammolar:

- Mehmon xatcho‘pdan login qilganda saqlash amali yo‘qolgan. Endi tekshirilgan kurs IDsi bilan amal tiklanadi.
- Mehmon yordamchidan login qilganda yordamchi va savol yo‘qolgan. Savol/tajriba OAuth qaytishida ham tiklanadi.
- Oldin ko‘rilgan kasb oddiy kirishda keraksiz ariza ochishiga sabab bo‘lgan. Login maqsadi alohida saqlanadi; oddiy kirish kabinetga olib boradi.
- Landing bo‘limi va yordamchi textarea’si bir xil `interest` ID ishlatgan. Endi IDlar noyob va label to‘g‘ri formaga bog‘langan.
- Savol yoki tajriba o‘zgartirilganda oldingi tavsiya ko‘rinishda qolgan. Endi eskirgan natija tozalanadi; so‘rov vaqtida forma tahriri cheklanadi.
- Telegram o‘chirilganda avval yetkazilgan xabar holati ham “ulanmagan” deb chiqishi mumkin bo‘lgan. Saqlangan `sent` holati ustuvor; takror arizada ham haqiqiy ariza statusi ko‘rsatiladi.
- Mobil menyu yordamchi/login ochilganda ochiq qolgan. Endi yopiladi.
- Pastga aylantirilgan sahifadan ochilgan mobil dialog ekrandan chiqishi mumkin bo‘lgan. Dialog viewport’ga mahkamlandi; yangilangan mazmun tepadan boshlanadi.
- Xatcho‘p saqlashda karta qayta montajlanishi va tugmaning vaqtincha disabled bo‘lishi klaviatura fokusini yo‘qotgan. Kartaning identity’si barqaror, takror amal bloklanadi va fokus saqlanadi.
- Logout’dan keyin shu tabdagi qoralama boshqa hisobga qolishi mumkin bo‘lgan. Logout’da ariza qoralamalari o‘chiriladi. Kabinetning kechikkan javoblari eski holatni qayta yozmasligi uchun so‘rov versiyasi tekshiriladi.
- Muhim matnlar 8–11px bo‘lgan; `#806f65` rangi shaftoli fonda 4.45:1 kontrast bergan. Matn/tugmalar kattalashtirildi, muted rang qoraytirildi, bosish maydonlari kengaytirildi.

Yakuniy tekshiruv: **12/12 Playwright**, **9/9 unit/API** va production build o‘tdi. Axe avtomatik WCAG A/AA tekshiruvida landing, tafsilot, qo‘llanma, mobil menyu, login, bo‘sh kabinet va ariza formasida aniqlangan qoidabuzarlik qolmadi. Bu to‘liq qo‘lda accessibility auditi yoki barcha ehtimoliy xatolar yo‘qligiga kafolat emas. Sun’iy Telegram `sent` statusi UI testi haqiqiy xabar yuborilgani dalili emas.
