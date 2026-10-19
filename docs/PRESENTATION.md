# Taqdimot ssenariysi

1. Bosh sahifa: portal yoshga qiziqishidan kasb va kursga o‘tishda yordam beradi. “Ziyo” kutubxona uslubi: o‘quv ustaxonasi, uch bosqichli yo‘l, olcha rangli qiziqish mashqi.
2. Katalogda “Frontend” qidiring, o‘qish shakli filtrini ko‘rsating. Kasbni ochib vazifa, ko‘nikma, davomiylik va namunaviy kursni ko‘rsating.
3. “Kursga ariza berish” → Google orqali kirish. Mahalliy mashqda alohida belgilangan sinov hisobidan foydalanish mumkin, uni Google dalili deb aytmang.
4. Sun’iy maqsad: “Sinov uchun shaxsiy portfolio yaratishni o‘rganmoqchiman.” Arizani yuboring, raqamini ko‘rsating.
5. Kabinetga o‘ting, sahifani yangilang. Ariza va holati saqlanadi. Shu kursga qayta yuborishda yangi ariza yaratilmaydi.
6. Telegram sozlangan bo‘lsa sinov chatidagi UUID/kurs va kabinetdagi `yetkazildi` holatini solishtiring. Sozlanmagan yoki xato bo‘lsa, aynan shu holatni ko‘rsating; yuborildi deb aytmang.
7. AI yordamchiga “raqamlar va Excel yoqadi, tajribam kam” deb yozing. U faqat katalogdagi yo‘nalishlar va amaliy boshlash qadamlarini beradi. Kalit fake bo‘lsa oddiy katalog tavsiyasi ekanini ko‘rsating.

Texnologiyalar: React/Vite interfeys uchun, Express bir origin’dagi API va secrets uchun, Supabase Auth/PostgreSQL/RLS doimiy shaxsiy ma’lumot uchun, Render hosting uchun, UptimeRobot process monitoringi uchun. Unique constraint va atomik RPC — takror arizadan himoya. Telegram xatosi saqlangan arizani bekor qilmaydi.

Chegaralar: kurslar haqiqiy ta’lim taklifi emas. Google login uchun tashqi provider sozlamasi kerak. Fake AI/Telegram kalitlari real integratsiya dalili emas. Xizmat kvotalari va Telegram timeout’ida noaniq yetkazilish mumkin. Tekshiruvlarning mahalliy yoki real provayderda ekanini VERIFICATION.md bo‘yicha ajrating.
