# Kasb yo‘li — davom ettirish qaydi

## Tayyor natijalar

Oxirgi audit: texnik kabinet belgisi olib tashlandi; login davomiyligi (favorite/apply/advice), noyob form IDsi, mobil dialog/menu, o‘qiluvchanlik/kontrast, eski tavsiya/status va fokus/qoralama muammolari tuzatildi. `src/usability.css` yakuniy o‘qiluvchanlik qatlami. Davomida sessiya tugashidan tiklanish, offline ariza retry, kabinet 503/401 va sekin Telegram ajratilishi tekshirildi. Hozir **18 UI + 11 unit/API** test o‘tgan, Axe 7 ekran/holatda tekshirilgan. Telegram saqlash javobidan keyin yuboriladi; xabar holati kabinet yangilanganda ko‘rinadi. Batafsil yakuniy qayd VERIFICATION.md oxirida.

- Jonli sayt: https://kasb-yoli-portal.onrender.com
- Source: https://github.com/AzizbekSafarov/kasb-yoli-portal
- Render: https://dashboard.render.com/web/srv-dbaotomq1p3s73ch6qt0
- Supabase: https://supabase.com/dashboard/project/xjorenzcapvlccuzdqld
- Monitoring: https://dashboard.uptimerobot.com/monitors/804329890
- Google Cloud loyihasi: `nifty-time-462408-s6`, OAuth Web Client “Kasb yo‘li — Supabase Google login”. Secret Supabase provider’ida; server DB secret Render Environment’da. Kalitlarni log yoki source’ga chiqarmang.

2026-10-19: 8 kasb/kurs, qidiruv/filtr, tafsilot, real Google/Supabase login, xatcho‘p, ariza va kabinet ishlaydi. Sun’iy real ariza KY-66DC8A47 reload’dan keyin saqlangan. Real RLS testi PASS (tranzaksiya rollback). 9 unit/API va 4 UI test o‘tdi. To‘liq dalil `docs/VERIFICATION.md` da.

## Foydalanuvchining qabul qilingan yangi yo‘nalishi

Landing SI.GOV’dagi nuqtali mexanikadan ilhomlandi. `.io`dagi Yuksal/SI konteksti va motion source’i o‘qildi; React uchun mustaqil `ParticleField.jsx` va `particles.js` yozildi. Hero nuqtalari orbita/logo orasida o‘tadi; pastki nuqtalar o‘z logomiz + Kasb yo‘li nomini hosil qiladi. Pointer/tap to‘lqini, pause, reduced-motion, offscreen/hidden-tab pause bor. Katalog, kabinet va ariza oqimi saqlandi.

Logo yumaloq kitob va oltin yo‘l belgisi. Foydalanuvchi aniqlashtirdi: rasm atrofi oq to‘rtburchak bo‘lmasin. Shuning uchun yakuniy PNG’lar haqiqiy alpha bilan shaffof. Logo asl nusxasi `public/logo-original.png`, 192/120/64 px eksportlar ham shu papkada. Sayt va Google Auth bir xil versiyani ishlatadi.

## Tashqi holat

AI/Telegram uchun foydalanuvchi hozircha fake/ulanmagan rejimni buyurdi. Real yuborish qilinmadi; fallback hamda xato holatlari aniq belgilangan. Kalit qo‘shilgach outbox pending arizalarni sinov chatiga yuboradi — faqat synthetic yozuvlar saqlangan.

Google Auth ishladi. App name/logo/homepage/privacy/terms saqlangan va Audience In production. Google brend tekshiruvi homepage egaligini tasdiqlashni va tasdiqdan keyin 24 soat kutishni so‘radi. Search Console URL property `https://kasb-yoli-portal.onrender.com/` uchun tasdiq fayli olindi: `google3795099e3c0dfe97.html`; public’da saqlanadi, o‘chirmang. Yakuniy domen tasdiq natijasi quyida yangilanadi.

## Muhim fayllar

- `src/ParticleField.jsx`, `src/cinematic.css` — landing ko‘rinishi va zarrachalar.
- `src/main.jsx`, `src/api.js` — portal oqimi, Supabase PKCE.
- `shared/catalog.js` — tahrirlanadigan namunaviy katalog va qadamlar.
- `server/` — JWT tekshirish, Supabase adapter, AI/Telegram va outbox.
- `supabase/migrations/001_kasb_yoli.sql` va `supabase/verify-rls.sql` — RLS/RPC va real izolyatsiya sinovi.
- `README.md` — ishga tushirish. `docs/PRESENTATION.md` — himoya oqimi.

Yakuniy brend holati: **Search Console’da Ownership verified** muvaffaqiyatli chiqdi (HTML file usuli, 2026-10-19). Fayl Render’da ochilishi va mazmuni smoke scriptda tekshirildi. Google xatodagi ko‘rsatmaga binoan tizimlar yangilanishi uchun 24 soat kutib, keyin Branding → Information and summary → View issues → “I have fixed the issues” → Proceed orqali qayta tekshirish kerak. Hozir Google brend tasdig‘i olinmagan; domen consent oynasida ko‘rinishi mumkin. Navbatdagi ish — 2026-10-20 tasdiq vaqtidan keyin qayta tekshiruv. Hech qanday avtomatik kuzatuv/schedule yaratilmagan.
