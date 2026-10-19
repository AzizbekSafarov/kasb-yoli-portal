# Kasb yo‘li

[Jonli portal](https://kasb-yoli-portal.onrender.com) · [Tahrirlanadigan source](https://github.com/AzizbekSafarov/kasb-yoli-portal) · [Tekshiruv qaydi](docs/VERIFICATION.md)

O‘zbek tilidagi zamonaviy kasblar va ta’lim portali. MASHQ BILETI №1 uchun mustaqil loyiha; rasmiy tanlov mavzusi deb da’vo qilinmaydi. Katalogdagi 8 kasb va barcha kurslar **namunaviy**.

## Ishga tushirish

Node.js 24 kerak. Yangi checkout’da:

```powershell
npm ci
Copy-Item .env.example .env
npm run build
npm start
```

Mahalliy manzil: http://localhost:3001. `.env` ichida `DEMO_MODE=true` bo‘lsa, faqat sun’iy hisob bilan SQLite mashq rejimi ishlaydi. Sinov hisobi Google autentifikatsiyasi emas. SQLite `.data/practice.sqlite` ichida ariza va xatcho‘plarni sahifa/server qayta ishga tushganda saqlaydi. Chiqib, yangi sinov hisobi ochish yangi foydalanuvchi yaratadi. Haqiqiy ma’lumot kiritmang.

Tahrirlash uchun `npm run dev`: Vite http://localhost:5173, API 3001. `npm test` — server va model sinovlari; `npm run test:ui` — Playwright oqimi va responsive tekshiruvlar. Chromium bo‘lmasa `npx playwright install chromium`.

## Supabase va Google

1. SQL Editor’da `supabase/migrations/001_kasb_yoli.sql` ni bajaring. `ky_` prefiksi boshqa loyihadagi jadvallarni o‘zgartirmaydi. Migratsiya qayta bajarilishi mumkin.
2. Supabase Google provider’ini yoqing. Google Cloud OAuth Web Client’da redirect: `https://PROJECT_REF.supabase.co/auth/v1/callback`. Client ID/secret **Supabase provider sozlamasida** qoladi.
3. Supabase URL Configuration’da Site URL — Render domeni; redirect allowlist — `https://DOMEN.onrender.com/auth/callback`, mahalliy tekshiruv uchun `http://localhost:3001/auth/callback`, `http://localhost:5173/auth/callback`.
4. Server `.env`: `DEMO_MODE=false`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` (publishable/anon), `SUPABASE_SERVICE_ROLE_KEY` (mavjud server secret/service_role).
5. Frontend faqat public URL/anon key oladi. Server JWT’ni `auth.getUser` bilan tekshiradi; shaxsiy CRUD foydalanuvchining JWT’si bilan RLS orqali bajariladi. Server secret faqat bildirishnoma outbox’ini boshqaradi.

Google login’ni tugatmay qaytish xatosi ko‘rsatiladi. PKCE sessiya Supabase SDK orqali tiklanadi. Ariza matni OAuth davomida shu tabning sessionStorage’ida qoralama sifatida qoladi; yuborilgach o‘chiriladi.

## Render

`render.yaml` tayyor. GitHub reposini Render Web Service’ga ulang yoki Blueprint qo‘llang:

- Node 24, build: `npm ci --include=dev && npm run build`, start: `npm start`, health: `/health`.
- `NODE_ENV=production`, `DEMO_MODE=false`, `APP_ORIGIN=https://ANIQ_DOMEN.onrender.com`.
- Yuqoridagi Supabase o‘zgaruvchilarini Environment’ga kiriting. Server secrets’ni `VITE_` bilan boshlamang.
- `GROQ_API_KEY`, `GROQ_MODEL` (standart `openai/gpt-oss-120b`), `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` keyin ulanadi.
- Production’da demo hisobi ochilmaydi. Kalit yetishmasa server aniq sozlash xatosi bilan to‘xtaydi.

## AI va Telegram

AI rasmiy Groq HTTPS API’siga serverdan murojaat qiladi. Model foydalanuvchi qiziqishi/tajribasi va katalogdan yo‘nalish tanlaydi. Natija Zod’da mavjud kurs IDlari va cheklangan sabab turlari bo‘yicha tekshiriladi. Ko‘rsatiladigan vazifalar, ko‘nikmalar va uchta qadam katalogdan olinadi. Ixtiyoriy model matni HTML sifatida chiqarilmaydi. Noto‘g‘ri JSON, mavjud bo‘lmagan kurs, timeout, 429/5xx bo‘lsa, “katalog bo‘yicha tavsiya” deb aniq belgilangan oddiy yo‘riqnoma ishlaydi. U haqiqiy AI javobi deb ko‘rsatilmaydi.

Ariza tranzaksiyada saqlanadi; `(user_id,course_id)` unique qoidasi parallel bosishda ham takror ariza yaratmaydi. Ariza — doimiy notification outbox yozuvi ham. Telegram’ga faqat ariza UUID’si va namunaviy kurs nomi yuboriladi; maqsad, ism va email yuborilmaydi. `ok=true` hamda `message_id` bo‘lsagina `sent`; rad javobi — `failed`; noaniq timeout — `unknown`. Xabar xatosi arizani bekor qilmaydi.

Server 30 soniyada `pending` yozuvlarni ko‘radi. Atomik claim bir vaqtdagi ikki yuborishdan himoyalaydi. Restart’da bir daqiqadan eski `sending` yozuvlar `unknown` bo‘ladi. Telegram API’da idempotency kaliti yo‘qligi uchun noaniq yetkazilishni avtomatik takrorlamaymiz. `failed` xabar kabinetdan qayta yuboriladi. Bot ulanmaganida yozuv `pending` turadi; sozlangach navbat ishlaydi. Foydalanuvchi xabar holatini o‘zi o‘zgartira olmaydi.

## UptimeRobot

HTTP(s) monitor URL: `https://DOMEN.onrender.com/health`, interval 5 daqiqa. `/health` process ishlashini tekshiradi, AI yoki bazaga yozmaydi. Uptime monitor login/ariza oqimi ishlashining isboti emas. Render Free sovuq ishga tushishi va xizmat kvotalari mavjud.

## Tuzilma va tahrirlash

- `src/main.jsx` — barcha ekranlar, dialoglar, kabinet va OAuth oqimi.
- `src/styles.css` — Ziyo uslubi, responsive, fokus va reduced-motion.
- `shared/catalog.js` — kasblar, kurslar, qidiruv, filtr va amaliy qadamlar.
- `server/app.js` — API, sessiya, validatsiya va limitlar.
- `server/repository.js` — Supabase/RLS va mahalliy sinov bazasi adapterlari.
- `server/services.js` — AI va Telegram, timeout va holat tekshiruvi.
- `docs/VERIFICATION.md` — haqiqiy tekshiruv qaydi.
- `docs/PRESENTATION.md` — taqdimot oqimi.
- `HANDOFF.md` — joriy holat va keyingi ishlar.

## Dizayn va manbalar

Foydalanuvchining yakuniy tanlovi bilan landing [Yuksal / SI](https://azizbeksafarov.github.io/design/si/) va SI.GOV’dagi nuqtali mexanikadan ilhomlanib yangilandi. Katta Instrument Serif tipografikasi, orbita → logo, pointer/tap to‘lqini va pastda nuqtalardan yig‘ilgan o‘z brendimiz bor. React Canvas implementatsiyasi mustaqil; davlat tashkilotlariga aloqadorlik da’vosi yo‘q. Pause va reduced-motion ishlaydi, ko‘rinmayotgan sahnalarda requestAnimationFrame to‘xtaydi. Shaffof logo header, favicon va Google Auth uchun bir xil. Katalog/kabinet dastlabki Ziyo uslubidagi qulay komponentlarni saqlaydi.

[Azizbek Safarov kutubxonasidagi Ziyo](https://azizbeksafarov.github.io/design/ziyo/) uslubi moslashtirildi: shaftoli qog‘oz, oq mazmun maydoni, olcha rangli mashq paneli, yumshoq asimmetrik burchaklar. Bree Serif sarlavhalari va Nunito Sans matni lokal saqlanadi; OFL litsenziyalari `public/fonts/` ichida. Illustratsiyalar ushbu loyiha uchun CSS va Lucide ikonalarida chizildi. Dizayn bahosi: impact 4, fit 5, feasibility 5, performance 5, consistency risk 4 → DFII 15. Bo‘sh joy 4/8px ritmida, qisqa hover va reduced-motion qo‘llanadi.

Texnik manbalar: [Supabase Google](https://supabase.com/docs/guides/auth/social-login/auth-google), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Groq structured outputs](https://console.groq.com/docs/structured-outputs), [Telegram Bot API](https://core.telegram.org/bots/api#sendmessage), [Render Web Services](https://render.com/docs/web-services).

