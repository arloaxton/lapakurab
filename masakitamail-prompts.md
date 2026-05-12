# 10 Prompt Template MasakitaMail
> Paste tiap prompt ke Claude (Artifacts) untuk generate 1 template lengkap.
> Tiap prompt menghasilkan single React file (.jsx) dengan 4 view: Landing, Inbox, Email Detail, Settings.

---

## 🎨 SHARED REQUIREMENTS (sudah dimasukkan ke setiap prompt)

Semua template wajib punya:
- **Brand**: `[ MasakitaMail ]` dengan kurung siku khas
- **Header**: brand + indikator uptime (`uptime: 99.97%`) + badge LIVE (titik berkedip)
- **Email display besar**: `username@masakita.com` dengan `@` di-highlight beda warna
- **Domain selector**: dropdown `@masakita.com` (siapkan 3 domain dummy: masakita.com, neomail.id, tempbox.io)
- **6 tombol aksi**: SALIN (copy + toast "Tersalin!"), REFRESH (regenerate random), UBAH (expand inline → input username + tombol Buat/Cancel), ACAK (shuffle username), HAPUS (clear inbox)
- **4 stat cards**: MESSAGES, UNREAD, LATEST, NO EXPIRE (∞)
- **Inbox layout**: list kiri + viewer kanan dengan empty state ("KOSONG — pesan akan muncul otomatis" & "PILIH EMAIL")
- **4 view interaktif**: Landing, Inbox, Email Detail, Settings — bisa di-switch via nav
- **Mock data**: 5-7 email dummy (verifikasi OTP, welcome email, newsletter, dll) supaya state interaktif jalan
- **Stack**: React + Tailwind utility classes, single .jsx file, default export, no required props

---

# PROMPT 01 — TERMINAL HACKER (vibe seperti screenshot referensi)

```
Buatkan single React file (.jsx) untuk SaaS bernama "MasakitaMail" — layanan email sementara (tempmail).

TEMA: Terminal Hacker / Retro CRT
- Background: gelap pekat (#0a0e0a) dengan grid pattern halus
- Aksen utama: hijau phosphor neon (#a3e635 / lime-400)
- Font: JetBrains Mono atau Fira Code untuk SEMUA teks
- Estetik: terminal vibes, prompt $ di awal command, scanline halus opsional, kursor berkedip pada email display
- Border: 1px tipis dengan opacity rendah, rounded sedikit (rounded-lg)
- Tombol: outline style dengan teks UPPERCASE, hover glow hijau

KOMPONEN WAJIB:
1. Header: "[ MasakitaMail ]" warna hijau neon di kiri, di kanan ada "uptime: 99.97%" + badge "● LIVE" (titik berkedip)
2. Card utama dengan label "$ neomail --generate" di atas, lalu email besar "onyxnode88@masakita.com" (tulisan @ warna beda, putih), di bawahnya 5 tombol: domain selector dropdown (@masakita.com), SALIN, REFRESH, UBAH, ACAK, HAPUS (HAPUS warna merah)
3. Saat klik UBAH: tombol UBAH/ACAK/HAPUS hilang, muncul input "username" full-width + suffix "@masakita.com" + tombol "Buat" (hijau solid) dan "Cancel" (outline)
4. 4 stat cards grid: MESSAGES (0), UNREAD (0), LATEST (—), NO EXPIRE (∞) — angka besar warna hijau, label kecil uppercase abu-abu
5. Section bawah: 2 kolom — kiri "INBOX" dengan counter "0 msgs", kanan email viewer. Empty state kiri: icon mail + "KOSONG / PESAN AKAN MUNCUL OTOMATIS". Empty state kanan: "PILIH EMAIL"
6. Mock 6 email dummy supaya inbox bisa diisi (klik refresh memunculkan email random)

VIEW (tab switcher di header kanan):
- Landing: hero "Email sementara, anti-spam, anti-tracking" + 3 fitur + CTA "Generate Email"
- Inbox: layout di atas (default view)
- Email Detail: full-screen viewer dengan tombol back, subject besar, sender + timestamp, body email, tombol Reply/Forward/Archive/Delete
- Settings: domain whitelist, auto-refresh interval, theme toggle, notification toggle

INTERAKTIVITAS: useState untuk email aktif, inbox list, view aktif, mode-edit-username. Semua tombol harus berfungsi (klik salin → toast, refresh → regenerate username random, ubah → expand input, acak → shuffle, hapus → clear inbox).

Export default. Import lucide-react untuk icon. No external CSS file.
```

---

# PROMPT 02 — GRADIENT MESH MODERN (Stripe / Resend vibe)

```
Buatkan single React file (.jsx) untuk SaaS "MasakitaMail" (tempmail service).

TEMA: Gradient Mesh Modern — premium SaaS aesthetic ala Stripe/Resend/Linear
- Background: light (#fafafa) dengan mesh gradient blur halus (purple #a78bfa → pink #ec4899 → amber #f59e0b) di pojok kanan atas dan kiri bawah, gunakan div absolute dengan blur-3xl
- Card utama: putih solid dengan shadow lembut (shadow-xl shadow-black/5), border tipis #e5e7eb, rounded-2xl
- Aksen: violet-600 (#7c3aed) untuk primary, slate-900 untuk teks
- Font: gunakan font display elegant (cth: kelas font-serif untuk headline, sans-serif untuk body — atau import Geist/Söhne via Google Fonts kalau bisa)
- Estetik: spacious, banyak whitespace, micro-interactions halus

KOMPONEN WAJIB:
1. Header: logo "[ MasakitaMail ]" slate-900 + nav (Beranda, Inbox, Settings) + badge LIVE titik hijau berkedip + uptime kecil
2. Card hero: label kecil "Your temporary inbox" → email besar bold "onyxnode88@masakita.com" (@ warna violet), tombol horizontal: domain dropdown, SALIN (violet primary), REFRESH (outline), UBAH (outline), ACAK (outline), HAPUS (outline merah)
3. Mode UBAH: input full + suffix @masakita.com + Buat/Cancel
4. 4 stat cards minimal dengan icon kecil di pojok, angka besar, label kecil
5. Inbox section: list email kiri (avatar gradient + sender + subject + waktu), viewer kanan
6. 6 mock emails

VIEW (4 view, switch via nav):
- Landing: hero center "Email yang lahir dan mati dalam 10 menit" + gradient text + 3 feature cards (Privasi, Cepat, Tanpa Daftar) dengan icon + CTA besar
- Inbox: layout di atas
- Detail: split view, list tetap kiri sempit, kanan full email
- Settings: card-card pengaturan dengan toggle switch elegan

INTERAKTIVITAS: full state management, semua tombol jalan, klik email → buka detail.

Stack: React + Tailwind, lucide-react. Default export. No required props.
```

---

# PROMPT 03 — CYBERPUNK NEON

```
Buatkan single React file (.jsx) untuk "MasakitaMail" — SaaS tempmail.

TEMA: Cyberpunk Neon 2077
- Background: #0a0a0f (almost black) dengan grid neon halus dan orb gradient blur (electric purple #7000ff + hot pink #ff006e + neon mint #00ff9f)
- Aksen: kombinasi 3 warna neon (mint untuk success/primary, pink untuk accent, purple untuk secondary)
- Font: display futuristic (Orbitron atau JetBrains Mono untuk monospace), tracking-wider, beberapa text dengan effect glitch halus (CSS)
- Estetik: glow effects (drop-shadow neon), corner cuts (clip-path), border gradient, scanline overlay opsional, glow pada hover

KOMPONEN WAJIB:
1. Header: "[ MasakitaMail ]" dengan glow mint, di kanan: uptime + LIVE badge pink berkedip
2. Card email: bg semi-transparan, border 1px gradient pink→purple, glow halus. Email besar dengan @ warna pink, sisanya mint. 6 tombol (domain dropdown + SALIN + REFRESH + UBAH + ACAK + HAPUS) dengan border neon dan glow on hover
3. Mode UBAH: input bg gelap dengan caret pink berkedip + Buat (mint solid glow) / Cancel (outline)
4. 4 stat cards dengan border gradient berbeda tiap card, angka besar glow
5. Inbox: kiri list dengan border accent neon, kanan viewer
6. 6 mock emails

VIEW:
- Landing: hero gigantis "DISPOSABLE.SECURE.UNTRACEABLE" dengan glitch text effect + grid features + tombol CTA glow
- Inbox: layout di atas
- Detail: full neon header bar, email body dalam card glass
- Settings: toggles dengan track gradient

INTERAKTIVITAS: full functional, animasi glow pulse pada elemen aktif.

React + Tailwind + lucide-react. Default export.
```

---

# PROMPT 04 — MINIMAL SWISS (Linear / Vercel vibe)

```
Buatkan single React file (.jsx) untuk SaaS tempmail "MasakitaMail".

TEMA: Minimal Swiss — Linear/Vercel inspired
- Background: putih murni #ffffff (atau #fafafa)
- Aksen: hitam #0a0a0a untuk teks utama, biru #2563eb untuk primary action SAJA, abu-abu #e5e5e5 untuk border
- Font: sans-serif tegas (Geist atau Söhne style — fallback ke font-sans dengan tracking-tight)
- Estetik: super minimal, tipografi tegas, generous whitespace, border 1px, rounded-md (tidak terlalu bulat), NO shadow berlebihan, animasi subtle

KOMPONEN WAJIB (struktur sama, eksekusi minimal):
1. Header: "[ MasakitaMail ]" bold + nav text-only abu di kanan + LIVE badge minimalis titik kecil + uptime tiny
2. Card email outline tipis: label "Your inbox" abu kecil → email besar "onyxnode88@masakita.com" tracking-tight (@ abu-abu medium), tombol-tombol minimalis text-button dengan icon kecil (SALIN biru solid, sisanya outline atau ghost)
3. Mode UBAH: input minimal underline-only style + suffix abu + Buat (biru) / Cancel (text)
4. Stats: 4 card flat tanpa border, hanya divider vertikal — angka besar bold hitam
5. Inbox: divider tipis horizontal antar email (no card), hover bg-gray-50
6. 6 mock emails

VIEW:
- Landing: hero text-only besar kiri "The email that disappears." + sub + CTA + subtle gradient line
- Inbox, Detail, Settings: minimal seragam

INTERAKTIVITAS: full functional, transisi halus.

React + Tailwind + lucide-react. Default export.
```

---

# PROMPT 05 — AURORA GLASSMORPHISM

```
Buatkan single React file (.jsx) untuk "MasakitaMail" tempmail SaaS.

TEMA: Aurora Glassmorphism
- Background: gradient aurora besar (violet #667eea → purple #764ba2 → pink #f093fb) full screen, animasi pelan (CSS keyframes shifting position)
- Cards: glass effect (bg-white/10, backdrop-blur-xl, border border-white/20), inner glow
- Aksen: putih translusen, accent magenta dan cyan
- Font: display modern lembut + body sans clean
- Estetik: floating cards, depth, soft shadows, rounded-3xl, semua terasa airy

KOMPONEN WAJIB:
1. Header dalam glass nav-bar: "[ MasakitaMail ]" putih + LIVE badge glow + uptime
2. Card hero glass: email besar putih (@ pink magenta), 6 tombol glass-pill style
3. Mode UBAH: input glass + Buat solid pink / Cancel ghost
4. 4 stat cards glass dengan icon di pojok kanan atas
5. Inbox: list cards glass dengan blur, viewer card glass besar
6. 6 mock emails

VIEW:
- Landing: hero teks putih besar di tengah dengan halo glow + 3 floating glass cards features + CTA glass button glow
- Inbox: layout di atas
- Detail: glass viewer full-width dengan sender avatar gradient
- Settings: glass cards dengan toggle bling

INTERAKTIVITAS: full + hover lift effect (translate-y kecil).

React + Tailwind + lucide-react. Default export.
```

---

# PROMPT 06 — DARK PRO DEVELOPER (GitHub Dark / Raycast vibe)

```
Buatkan single React file (.jsx) untuk "MasakitaMail" tempmail.

TEMA: Dark Pro Developer — GitHub Dark / Raycast inspired
- Background: #0d1117 (GitHub dark canvas)
- Panel: #161b22 dengan border #30363d
- Aksen: biru link #58a6ff, hijau success #3fb950, merah danger #f85149
- Font: Inter atau system-ui untuk UI, JetBrains Mono untuk email/code
- Estetik: padat informasi tapi bersih, sidebar kiri, command palette feel, keyboard shortcut hints (kbd kecil), icon konsisten

KOMPONEN WAJIB:
1. Sidebar kiri sempit (icon-only): logo, Inbox, Settings, di bawah avatar
2. Top bar: search global + LIVE badge + uptime + bell icon
3. Konten utama:
   - Card panel dengan email besar mono (@ biru), 6 tombol style GitHub button (subtle bg, border, hover lift)
   - Mode UBAH: input panel-style + Buat hijau / Cancel
4. 4 stat cards style panel dengan trend indicator kecil
5. Inbox: 2-column dalam panel, list kiri dengan unread bullet biru, viewer kanan
6. 6 mock emails (subjek-subjek developer-ish: "Vercel deployment ready", "GitHub: New PR", "Stripe receipt")

VIEW:
- Landing: hero dengan code block ASCII art di belakang + CTA
- Inbox: layout di atas (default)
- Detail: panel viewer dengan header sender + meta data table-like
- Settings: form GitHub-style dengan section headers

INTERAKTIVITAS: full + keyboard shortcut hints (⌘K, ⌘R).

React + Tailwind + lucide-react. Default export.
```

---

# PROMPT 07 — BRUTALIST Y2K

```
Buatkan single React file (.jsx) untuk "MasakitaMail" tempmail SaaS.

TEMA: Neo-Brutalist Y2K
- Background: cream #fef3c7 atau kuning pastel #fffacd
- Border: 3px solid hitam #000000 di SEMUA elemen
- Shadow: hard offset shadow style "8px 8px 0 #000" (no blur)
- Aksen: blok-blok warna berani: merah #ff4d4d, biru #4d96ff, kuning #ffd93d, ungu #a855f7
- Font: display tebal (Space Grotesk Bold atau Archivo Black) untuk heading, mono untuk email
- Estetik: chunky, asymmetric layout, elemen sengaja "miring" sedikit (rotate-1, -rotate-2), sticker vibe

KOMPONEN WAJIB:
1. Header: "[ MasakitaMail ]" dalam box border tebal warna kuning + LIVE badge box hijau + uptime stiker
2. Card email: bg putih border 3px shadow keras, email besar (@ warna merah). 6 tombol BRUTALIST style: setiap tombol warna beda (SALIN biru, REFRESH kuning, UBAH ungu, ACAK pink, HAPUS merah, dropdown hitam) — semua border 3px shadow keras, hover translate diagonal
3. Mode UBAH: input border 3px hitam tebal + suffix sticker + Buat (hijau brutal) / Cancel (putih brutal)
4. 4 stat cards berwarna beda-beda asymmetric (sedikit rotate)
5. Inbox: cards email tumpuk-tumpuk style sticker, viewer big bold
6. 6 mock emails

VIEW:
- Landing: hero chunky "EMAIL. SEKALI PAKAI. ANTI-RIBET." + ilustrasi geometric simple + CTA tombol gigantis
- Inbox, Detail, Settings: tetap brutalist

INTERAKTIVITAS: full + hover effect tombol shadow geser.

React + Tailwind + lucide-react. Default export.
```

---

# PROMPT 08 — EDITORIAL MAGAZINE

```
Buatkan single React file (.jsx) untuk "MasakitaMail" tempmail.

TEMA: Editorial Magazine — premium publikasi cetak
- Background: paper warm #f8f5f0
- Aksen: ink hitam #1a1a1a, gold #c89b3c, deep red #8b0000
- Font: serif elegant untuk display (font-serif kelas Tailwind, target Playfair Display atau GT Sectra), sans elegant untuk body, italic untuk emphasis
- Estetik: layout kolom seperti majalah, drop cap besar, divider ornamental, asymmetric, generous margins

KOMPONEN WAJIB:
1. Header masthead: "[ MasakitaMail ]" serif italic besar + tagline kecil "vol. 01 — disposable mail journal" + LIVE badge minimal + tanggal/uptime
2. Section utama gaya artikel: label uppercase tracking-widest "your address" → email gigantis serif (@ warna gold italic), 6 tombol pill style elegan dengan border tipis dan teks small-caps
3. Mode UBAH: input minimal borderless underline + suffix italic + Buat (filled deep-red) / Cancel
4. 4 stat dalam bentuk tabel data magazine (no cards, hanya divider vertikal + label small-caps)
5. Inbox: layout 2 kolom seperti TOC majalah (judul email besar serif, sender italic abu, hairline divider)
6. 6 mock emails

VIEW:
- Landing: cover-style hero "An ephemeral correspondence." dengan drop cap besar gold + paragraf intro + CTA elegant
- Inbox: layout di atas
- Detail: full reading mode style article (max-w-prose, leading relax, drop cap)
- Settings: form layout magazine dengan section uppercase

INTERAKTIVITAS: full functional.

React + Tailwind + lucide-react. Default export.
```

---

# PROMPT 09 — SOFT PASTEL FRIENDLY (Notion vibe)

```
Buatkan single React file (.jsx) untuk "MasakitaMail" tempmail SaaS.

TEMA: Soft Pastel Friendly — Notion/Linear lite vibe
- Background: cream #fdf6f0
- Cards: putih dengan shadow super lembut, rounded-2xl
- Aksen: pastel pink #ffd6e0, sky #c8e6f5, mint #d4f0c8, lavender #e0d4f5
- Font: rounded-friendly sans (target Nunito atau Quicksand fallback font-sans), playful tapi clean
- Estetik: friendly, soft, ada emoji-style icon kecil, banyak rounded, animasi bouncy halus

KOMPONEN WAJIB:
1. Header: "[ MasakitaMail ]" warm dark + LIVE bubble pink + uptime
2. Card hero pastel: label "Your fresh inbox 💌" + email besar dengan @ pink, 6 tombol pill rounded-full warna pastel berbeda
3. Mode UBAH: input rounded soft + suffix pill + Buat (mint solid) / Cancel
4. 4 stat cards pastel berbeda warna dengan icon emoji-style besar
5. Inbox: cards rounded soft dengan avatar gradient pastel, hover scale halus
6. 6 mock emails

VIEW:
- Landing: hero ramah "Email yang lucu, sementara, dan aman 🌸" + 3 feature cards bouncy + CTA pink rounded
- Inbox, Detail, Settings: konsisten pastel

INTERAKTIVITAS: full + transitions ease-out dengan slight scale hover.

React + Tailwind + lucide-react. Default export.
```

---

# PROMPT 10 — RETRO 90s WEB (BBS / Geocities revival)

```
Buatkan single React file (.jsx) untuk "MasakitaMail" tempmail.

TEMA: Retro 90s Web Revival — BBS / early internet aesthetic
- Background: #008080 teal classic Windows 95 ATAU pattern bintang/grid retro
- Window/panel style: border 2px outset/inset (Win95 style 3D border via box-shadow trick: inset white top-left + dark gray bottom-right)
- Aksen: kuning #ffff00, magenta #ff00ff, cyan #00ffff (tapi pakai dengan selera)
- Font: Pixel font (Press Start 2P) untuk title atau VT323 untuk body, fallback monospace
- Estetik: window dialog box, marquee opsional, ASCII border, "Under Construction" GIF feel

KOMPONEN WAJIB:
1. Title bar window klasik: "[ MasakitaMail.exe ]" bg biru #000080 teks putih + tombol _□✕ palsu + LIVE indicator + uptime di status bar bawah
2. Konten: panel inset → label "* GENERATE *" → email besar mono (@ magenta), 6 tombol Win95 style (border outset, hover inset)
3. Mode UBAH: input field inset border + Buat (button outset) / Cancel
4. 4 stat dalam group-box (fieldset Win95 style dengan label di top-left)
5. Inbox: panel kiri dengan list seperti Outlook 97, viewer kanan
6. 6 mock emails (subjek lucu retro: "FW:FW:FW: PENTING!!!", "Anda pemenang!!1!")

VIEW:
- Landing: window besar tengah layar dengan animated title text, marquee tipis "Welcome to MasakitaMail!", tombol CTA Win95 button
- Inbox, Detail, Settings: tetap retro window vibe

INTERAKTIVITAS: full + click sound feel via animasi border (active state).

React + Tailwind + lucide-react. Default export. Pakai inline style untuk efek 3D border kalau Tailwind tidak cukup.
```

---

## 📋 CARA PAKAI

1. **Buka Claude.ai** (atau interface yang support Artifacts)
2. **Copy salah satu prompt** di atas (mulai dari `Buatkan single React file...` sampai akhir blok)
3. **Paste ke Claude**, tunggu artifact .jsx jadi
4. **Preview & download** dari panel artifact
5. **Iterasi**: kalau ada bagian yang mau diubah, kasih feedback langsung di chat yang sama

## 💡 TIPS

- Generate 1 template dulu, review hasilnya, baru lanjut ke template berikutnya — biar bisa adjust gaya prompt kalau perlu
- Kalau mau warna/icon spesifik, tambahkan di akhir prompt: `"Pakai icon X dari lucide-react untuk Y"`
- Untuk konsistensi mock data antar template, tambahkan: `"Gunakan 6 email dummy berikut: [list email]"`
- Kalau hasil terlalu generic, tambah: `"JANGAN pakai font Inter atau warna purple gradient on white. Buat benar-benar distinctive."`
