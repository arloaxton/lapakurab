# 10 Prompt Template MasakitaMail — BATCH 2
> Tema & layout baru, tidak ada overlap dengan batch 1.
> Tiap template = 3 halaman: **Lockscreen** (password-only) → **Inbox** → **API Docs**.
> Password global hardcoded: **`masakita2025`**

---

## ✅ FITUR WAJIB (sama seperti batch 1)

**Lockscreen:** hanya input password, hardcoded `masakita2025`, salah → shake + error bertema, benar → unlock ke Inbox.

**Inbox wajib ada:** email display besar (@ highlight), domain selector dropdown (masakita.com / neomail.id / tempbox.io), 5 tombol (SALIN, REFRESH, UBAH expand→input+Buat/Cancel, ACAK, HAPUS), uptime+LIVE, 4 stats (Messages/Unread/Latest/NoExpire ∞), inbox list 6 mock emails + viewer, empty state, tombol Lock/Logout.

**API Docs wajib ada:** API key + show/hide + Regenerate + Copy, 4 endpoint CRUD (POST generate / GET inbox / GET inbox/:id / DELETE inbox), code tabs (cURL/JS/Python), rate limit + base URL info.

---

# PROMPT 11 — VAPORWAVE 80s

```
Buatkan single React file (.jsx) untuk SaaS tempmail "MasakitaMail" vibe VAPORWAVE 80s.

PUNYA 3 HALAMAN: Lockscreen → Inbox → API Docs.

═══ LOCKSCREEN ═══
- Background full-screen: gradient pink #ff71ce → cyan #01cdfe → purple #b967ff dengan grid floor 3D perspective di bawah (pseudo retrowave style pakai CSS)
- Sun retro setengah-lingkaran horizon line dengan stripe gradient pink-orange di tengah
- Center floating card: chrome metallic gradient, border 2px chrome, rounded sharp:
  * Heading "ＡＣＣＥＳＳ ＤＥＮＩＥＤ" (full-width characters Japanese-style spacing)
  * Sub italic "未来 - enter the void"
  * INPUT PASSWORD SAJA: chrome bordered, font Italic Times-style besar, neon pink glow on focus
  * Tombol "ＣＯＮＮＥＣＴ" gradient pink→cyan dengan chrome inset
- Hardcoded "masakita2025"
- Salah: card glitch CRT roll + teks "Ｓ Ｙ Ｓ Ｔ Ｅ Ｍ   Ｅ Ｒ Ｒ Ｏ Ｒ" pink
- Benar: VHS rewind transition → Inbox

═══ INBOX — Layout: HORIZONTAL TIMELINE SCROLL ═══
Layout berbeda dari batch 1: konten utama scroll HORIZONTAL (kiri ke kanan) bukan vertikal!
- Top bar fixed: logo "Ｍａｓａｋｉｔａ Ｍａｉｌ" full-width chars + uptime LCD palsu + LIVE neon + Lock icon
- Body horizontal scroll dengan snap:
  * Section 1 (snap kiri): hero email display besar font Times Italic dengan chrome border (@ pink #ff71ce, sisanya cyan), 5 tombol vertikal di sisi kanan (chrome buttons dengan icon retro), domain selector dropdown style cassette label
  * Section 2 (snap tengah): 4 stats sebagai "CRT screens" — 4 monitor retro berjajar dengan angka di "layar"-nya, label dot-matrix
  * Section 3 (snap kanan): inbox list sebagai DECK CARD STACK horizontal — tiap email = card "VHS tape" cover horizontal dengan title sticker, hover → tape "eject" effect
- Indicator dots scroll bawah + arrow ◀ ▶ navigation
- Empty state: "ＮＯ ＳＩＧＮＡＬ" + static noise SVG

═══ API DOCS — Layout: CASSETTE TAPE PLAYLIST ═══
- Background sama vaporwave gradient
- Layout sebagai "mixtape track list":
  * Top: chrome card "API Key" sebagai "cassette label" — handwritten font palsu + tombol [REWIND] [PLAY▶] [REC●] sebagai Regenerate/Copy/Show-hide
  * 4 endpoint sebagai TRACK LIST vertikal:
    * Track 01 — POST generate
    * Track 02 — GET inbox
    * Track 03 — GET inbox/:id
    * Track 04 — DELETE inbox
    * Tiap track expand seperti playlist item: METHOD label + path + duration palsu + saat klik expand show parameters/response/code tabs
  * Code block style "tape spool" decorative

═══ GAYA VISUAL ═══
- Palette: pink #ff71ce, cyan #01cdfe, purple #b967ff, chrome silver gradient
- Font: Times Italic untuk display, dot-matrix/LCD font untuk stats, monospace code
- Effects: chrome gradient borders, scanlines opsional, CRT vignette, palm tree silhouette SVG decorative

INTERAKSI: full functional, horizontal snap scroll, VHS transitions, dropdown chrome, mode UBAH cassette label.

React + Tailwind + lucide-react. Default export.
```

---

# PROMPT 12 — JAPANESE ZEN MINIMALIST

```
Buatkan single React file (.jsx) untuk "MasakitaMail" vibe JAPANESE ZEN MINIMALIST.

PUNYA 3 HALAMAN: Lockscreen → Inbox → API Docs.

═══ LOCKSCREEN ═══
- Background washi paper texture warm white #faf6ef + ink wash splash sumi-e style di pojok
- Center: vertical layout (orientasi tall):
  * Calligraphy character besar 鍵 (kunci) brush-stroke style di top
  * Heading vertical writing-mode "ま さ き た" + tagline horizontal kecil "tempmail · 仮メール"
  * INPUT PASSWORD SAJA: hairline 1px ink underline only, no border, font serif Japanese-friendly, placeholder "・・・・"
  * Tombol "入る" (masuk) minimal text-button ink color underline on hover
- Hardcoded "masakita2025"
- Salah: ink splash drop animation merah subtle + helper "違います" italic
- Benar: paper fade with brush-wipe horizontal → Inbox

═══ INBOX — Layout: VERTICAL ASYMMETRIC MINIMAL ═══
Layout berbeda: TALL vertical container max-w-2xl, asymmetric balance ala ikebana.
- Top: logo small ink + LIVE dot tiny + uptime ink hairline + Lock kanji 錠
- Section 1 (asymmetric kiri): label vertikal small-caps "ADDRESS" + email display besar font serif elegant (@ ink dark, username ink medium) — generous whitespace di sekitarnya
- Section 2 (asymmetric kanan): 5 tombol vertical stacked di sisi kanan, masing-masing minimal hairline border + label kanji+latin:
  * 写 (Salin) | 新 (Refresh) | 編 (Ubah, expand inline minimal underline input + Buat/Batal) | 乱 (Acak) | 削 (Hapus, ink red)
  * Domain selector: text-button minimal "@masakita.com ▾"
- Section 3 (centered): 4 stats sebagai vertical stack dengan kanji label:
  * 文 6 messages | 未 2 unread | 新 2分前 | ∞ 永遠
  * Hairline divider antar stats
- Section 4 (full width): inbox list sebagai HAIKU-STYLE CARDS — tiap email card minimal dengan judul serif besar 1 baris + sender italic 1 baris + waktu kanan tiny, hairline divider antar
- Empty state: "・・・" tiny dots center + "静か" italic
- Email detail: replace section dengan reading mode max-w-prose ink elegant

═══ API DOCS — Layout: SCROLL TANZAKU (Wishing Tree) ═══
- Background washi sama dengan ink wash subtle
- Layout vertikal tall scroll, tiap section seperti "tanzaku" (paper strip):
  * Top: kanji 鍵 + heading "API · 開発者" 
  * API Key sebagai "scroll" horizontal: hairline rectangle dengan key mono di tengah + tombol minimal text [再生成] [複写]
  * 4 endpoint sebagai vertical tanzaku strips:
    * Tiap strip: kanji method label (送/取/詳/削) + METHOD latin small-caps + path serif + deskripsi prose ink
    * Expand: parameters table hairline + response code block bg paper darker + tabs cURL/JS/Python minimal text-tabs
  * Footer: rate limit info hairline tiny

═══ GAYA VISUAL ═══
- Palette: paper warm white #faf6ef, ink black #1a1a1a, ink red #b8001f (sparse), gold accent #c89b3c (very sparse)
- Font: serif elegant Japanese-friendly (Noto Serif JP fallback font-serif), hairline weight body
- Effects: ink wash SVG splashes pojok, hairline 1px borders only, NO shadows, NO rounded
- Generous whitespace, asymmetric balance

INTERAKSI: minimal smooth fades, dropdown minimal, mode UBAH inline underline, code tabs hairline.

React + Tailwind + lucide-react. Default export.
```

---

# PROMPT 13 — CLAYMORPHISM 3D

```
Buatkan single React file (.jsx) untuk "MasakitaMail" vibe CLAYMORPHISM 3D.

PUNYA 3 HALAMAN: Lockscreen → Inbox → API Docs.

═══ LOCKSCREEN ═══
- Background: solid pastel lavender #d8c4f5 atau sky blue #c4d8f5
- Center: card claymorphic gigantis (rounded-3xl, shadow-inner soft + shadow-outer kuat double layer untuk efek 3D clay):
  * Lock icon 3D besar di top (clay-render style dengan highlight + shadow inner)
  * Heading rounded "Welcome 👋"
  * Sub "Type your password"
  * INPUT PASSWORD SAJA: clay style inset (inner shadow strong), rounded-2xl, no border outline
  * Tombol "Unlock" full-width clay button (rounded-2xl, gradient-soft + outer shadow + inner highlight) hover press-down (shadow reduce + translate-y)
- Hardcoded "masakita2025"
- Salah: card wobble 3D + clay button color flash merah
- Benar: card press-and-pop scale → Inbox

═══ INBOX — Layout: HEX/HONEYCOMB GRID ═══
Layout berbeda: HEXAGONAL TILE GRID, bukan rectangle layout!
- Top: nav clay strip horizontal (logo + uptime + LIVE dot + Lock icon, semua clay button)
- Body: HEXAGON GRID besar di tengah (pakai clip-path hexagon atau SVG):
  * Hex CENTER besar (3x size): email display gigantis di dalamnya (@ pink clay, username dark)
  * 6 hex MEDIUM sekelilingnya (pattern honeycomb), masing-masing 1 fungsi:
    * Hex 1: DOMAIN SELECTOR (klik → expand dropdown 3 hex domain pop)
    * Hex 2: SALIN (icon copy clay 3D)
    * Hex 3: REFRESH (icon arrow clay 3D)
    * Hex 4: UBAH (klik → seluruh hex group transform jadi input form claymorphic + Buat/Cancel hex buttons)
    * Hex 5: ACAK (icon shuffle clay 3D)
    * Hex 6: HAPUS (icon trash clay 3D merah, klik → modal claymorphic konfirmasi)
- Bawah honeycomb: row 4 hex KECIL untuk stats (MESSAGES, UNREAD, LATEST, NO EXPIRE)
- Inbox list: SEBAGAI 6 HEX CARDS terpisah dalam grid honeycomb di bawah, klik hex → pop-out detail panel
- Empty state: hex tengah kosong dengan icon abu

═══ API DOCS — Layout: CLAY DASHBOARD CARDS ═══
- Background sama claymorphic
- Layout grid 2-col claymorphic:
  * Top full-width: card clay BESAR "API Key" — input inset + tombol clay [Regen] [Copy]
  * 4 endpoint sebagai 2x2 grid card clay (pakai claymorphism strong):
    * Tiap card: METHOD pill 3D rounded warna pastel (POST mint, GET sky, GET-detail lavender, DELETE rose) + path mono dalam inset bubble + deskripsi
    * Expand: parameters table dalam inset slot + response JSON dalam clay code block + tabs cURL/JS/Python sebagai mini clay buttons
  * Bottom: 2 small clay cards untuk "Rate Limit" dan "Base URL"

═══ GAYA VISUAL ═══
- Palette: pastel lavender #d8c4f5, sky #c4d8f5, mint #c4f5d8, peach #f5d8c4 — semua soft pastel
- Claymorphism technique: combine outer shadow (soft+lifted) + inner shadow (subtle highlight) + rounded-3xl
- Font: rounded sans (Nunito/Quicksand fallback)
- 3D feel: gradient subtle pada permukaan untuk illusion volume

INTERAKSI: hex tap → bounce 3D, clay buttons press-down hover, dropdown hex pop, mode UBAH morph honeycomb, smooth springy transitions.

React + Tailwind + lucide-react. Default export.
```

---

# PROMPT 14 — NEUMORPHISM SOFT UI

```
Buatkan single React file (.jsx) untuk "MasakitaMail" vibe NEUMORPHISM SOFT UI.

PUNYA 3 HALAMAN: Lockscreen → Inbox → API Docs.

═══ LOCKSCREEN ═══
- Background: solid soft gray #e0e5ec (signature neumorphism background)
- Center: NO card — semua elemen soft-extruded dari background:
  * Heading "MasakitaMail" embossed (engraved style dengan subtle inner shadow)
  * Sub "Enter password to continue" muted
  * INPUT PASSWORD SAJA: deep inset shadow (debossed) ke dalam background, no border, font medium
  * Tombol "Unlock": soft extruded (raised) dengan dual shadow (light top-left, dark bottom-right), hover → transform jadi inset (pressed-in)
- Hardcoded "masakita2025"
- Salah: input flash inner shadow merah subtle + shake gentle + helper merah muted
- Benar: button press-in animation → fade ke Inbox

═══ INBOX — Layout: DASHBOARD CARDS GRID ═══
Layout berbeda: 4-COLUMN DASHBOARD GRID neumorphic, semua elemen extruded.
- Top bar: extruded panel horizontal dengan logo embossed + LIVE dot extruded + uptime + Lock button
- Section 1: Email panel BESAR full-width extruded:
  * Email display dalam inset slot (debossed) — angka & teks float di dalam slot
  * Tombol-tombol (DOMAIN SELECTOR + SALIN + REFRESH + UBAH + ACAK + HAPUS) sebagai PILL EXTRUDED row di bawah email, masing-masing icon + label, hover press-in
  * Mode UBAH: tombol ACAK/HAPUS/UBAH disappear, expand input inset slot "username" + suffix label + tombol Buat/Cancel extruded
- Section 2: 4-COL GRID untuk stats — tiap stat dalam circle/rounded-square extruded dengan angka inset di tengah
- Section 3: 2-COL GRID:
  * Kiri (col-2 dari 3): inbox list sebagai stacked rows, tiap email = panel extruded subtle dengan unread bullet inset, hover lift
  * Kanan (col-1 dari 3): viewer panel extruded — email content dalam inset frame
- Empty state viewer: icon mail extruded center + "select an email" embossed muted

═══ API DOCS — Layout: PANEL ACCORDION ═══
- Background sama neumorphic gray
- Top: extruded panel BESAR "API Key" — input inset + tombol bulat extruded [Regenerate] [Copy] [Show/Hide eye]
- 4 endpoint sebagai ACCORDION STACK panels (tiap panel extruded, klik → expand dengan animasi soft):
  * Header panel: METHOD pill (extruded soft warna pastel-ish per method) + path mono + chevron
  * Expanded body: inset slot untuk parameters table + inset slot untuk response JSON + tabs cURL/JS/Python sebagai pill buttons row extruded
- Sidebar kiri sticky: TOC sebagai vertical pill buttons extruded (klik → scroll ke endpoint)
- Footer: rate limit + base URL sebagai 2 pills extruded

═══ GAYA VISUAL ═══
- Background: solid #e0e5ec (jangan diganti, ini signature neumorphism)
- Shadow technique: dual shadow `shadow-[12px_12px_24px_#bec3c9,-12px_-12px_24px_#ffffff]` untuk extruded, inverse untuk inset
- Aksen warna ringan: soft blue #6d7fcc untuk active state, NO bold colors
- Font: sans medium tegas (font-sans), no italic
- Rounded: rounded-2xl konsisten
- NO solid borders, semua depth dari shadow

INTERAKSI: hover press-in on buttons, accordion smooth expand, dropdown extruded pop, mode UBAH inset transform, semua transitions smooth ease-in-out.

React + Tailwind + lucide-react. Default export.
```

---

# PROMPT 15 — NEWSPAPER 1920s VINTAGE

```
Buatkan single React file (.jsx) untuk "MasakitaMail" vibe NEWSPAPER 1920s VINTAGE.

PUNYA 3 HALAMAN: Lockscreen → Inbox → API Docs.

═══ LOCKSCREEN ═══
- Background: aged newspaper texture sepia #ede0c8 dengan stains palsu corner
- Center: "TELEGRAPH NOTICE" full-width banner sepia:
  * Top: ornament double-line border vintage
  * Heading blackletter serif "RESTRICTED CABLE"
  * Sub all-caps tracking-widest "AUTHORIZED PERSONNEL ONLY · EST. 1923"
  * Decoration: pointing-finger icon ☞ vintage style
  * INPUT PASSWORD SAJA: typewriter font, hairline ink underline, no fill — terlihat seperti diisi pakai mesin tik
  * Tombol "TRANSMIT →" ink-stamp style (rotated -2deg, hard-pressed look)
- Hardcoded "masakita2025"
- Salah: ink-blot splat animasi muncul + teks "TRANSMISSION FAILED" stamp merah
- Benar: paper crumple flash → Inbox

═══ INBOX — Layout: BROADSHEET 5-COLUMN NEWSPAPER ═══
Layout berbeda dari Editorial Magazine batch 1: ini broadsheet 1920s style, lebih dense dengan column rules dan ornament.
- Top: MASTHEAD newspaper 1920s:
  * "The Masakita Daily" blackletter gigantis CENTER
  * Sub serif "FOUNDED 1923 · VOL XXIV · NO 7,892 · «PRICE: ONE COIN»"
  * Date row + uptime + LIVE dot tiny + "[Sign Off]" italic
  * Triple ornamental rule divider
- Body 5-COLUMN ASYMMETRIC newspaper (column rules vertical hairline antar):
  * KOL 1 (col-2): "TELEGRAPHS RECEIVED" — 6 mock emails sebagai mini news entries (stub headline serif + dateline italic + 1 line preview)
  * KOL 2 (col-2): vertical ad palsu "KEEP YOUR INBOX SECRET — Use MasakitaMail today!" with vintage illustration palsu
  * KOL 3-4 (col-6, kolom utama): "DAILY DISPATCH" — main feature:
    - Headline 3-deck serif: "YOUR EPHEMERAL ADDRESS, REPRINTED:"
    - Email gigantis serif italic dengan drop cap besar (@ ink-red ornament)
    - Byline: 6 fungsi sebagai inline-elements pisah em-dash:
      "Domain: @masakita.com ▾ — Copy — Refresh — Edit — Random — Erase"
      (tiap text-link clickable, dropdown domain serif elegant 3 pilihan)
    - Mode UBAH: expand inline replace byline dengan input typewriter underline + "Set" / "Cancel" italic
  * KOL 5 (col-2): "BUREAU OF STATISTICS" — 4 stats sebagai mini-table newspaper style:
    - "MESSAGES.....6"
    - "UNREAD.......2"
    - "LATEST.......2 MIN."
    - "EXPIRY.......NEVER"
- Footer ornament: triple rule + "PRINTED ON DIGITAL PRESS · MASAKITA & CO."
- Email detail: full-page reading mode dengan headline serif + body multi-paragraph + drop caps

═══ API DOCS — Layout: TELEGRAPH MANUAL ═══
- Background sama sepia
- Top masthead: "DEVELOPER'S MANUAL · MASAKITA TELEGRAPHS"
- Body 2-column:
  * KIRI (col-3): "INDEX" sticky — daftar endpoint dengan halaman palsu (p. I, II, III, IV) blackletter style
  * KANAN (col-9): konten manual:
    - "SECTION I: AUTHENTICATION" heading serif + ornament
    - API Key dalam frame ornament double-border + tombol [REGENERATE] [COPY] ink-stamp style
    - Tiap endpoint sebagai "ARTICLE":
      * Roman numeral heading "ARTICLE I — TRANSMIT NEW CABLE (POST)"
      * Drop cap di paragraph deskripsi
      * Parameters dalam table style 1920s (border double-line + headers serif)
      * Response sebagai "SAMPLE TRANSCRIPT" dalam fieldset ornament
      * Code example tabs cURL/JS/Python sebagai "DIALECT" tabs ornamental
- Footer: ornament + "RATE LIMIT: 1000 PER MINUTE · ALL RIGHTS RESERVED · 1923"

═══ GAYA VISUAL ═══
- Palette: sepia paper #ede0c8, ink black, ink red ornament #8b0000, gold flourish #c89b3c
- Font: blackletter (Old English Text fallback serif) untuk masthead, serif Didone-style headings, Courier/typewriter body, italic small-caps captions
- Ornaments: double-rule borders, fleurons ❦, pointing fingers ☞, em-dashes —, drop caps elaborate
- NO rounded, NO shadows, hairline+ornament dividers only
- Texture: subtle paper grain bg

INTERAKSI: ink-stamp button press, page-flip transitions, dropdown elegant serif, mode UBAH typewriter inline.

React + Tailwind + lucide-react. Default export.
```

---

# PROMPT 16 — NATURE FOREST ORGANIC

```
Buatkan single React file (.jsx) untuk "MasakitaMail" vibe NATURE FOREST ORGANIC.

PUNYA 3 HALAMAN: Lockscreen → Inbox → API Docs.

═══ LOCKSCREEN ═══
- Background: deep forest gradient #0d2818 → #1a3d2a + leaf silhouettes SVG floating + soft mist overlay
- Center: floating "leaf card" — bentuk organic blob (border-radius asymmetric: 60%-40%-50%-50%/40%-50%-60%-50%):
  * Logo "🌿 MasakitaMail" sage green
  * Heading serif natural "Welcome, traveler"
  * Sub italic moss "speak the secret word"
  * INPUT PASSWORD SAJA: organic shaped (asymmetric border-radius), bg semi-transparent dark forest, glow subtle moss-green on focus, leaf decoration corner
  * Tombol "Enter the Grove 🍃" full-width organic-shape sage gradient hover sway gentle
- Hardcoded "masakita2025"
- Salah: leaf shake + petal-fall animation merah subtle + helper "the forest does not recognize you"
- Benar: leaves swirl transition → Inbox

═══ INBOX — Layout: BRANCHING TREE FLOW ═══
Layout berbeda: konten mengalir seperti CABANG POHON dari atas ke bawah dengan koneksi SVG curve organic.
- Top: nav organic strip — logo leaf + LIVE firefly dot + uptime kanan + Lock acorn icon
- Trunk pusat (vertikal center column):
  * Node 1 (top trunk): email display besar dalam organic blob shape sage (@ moss-green, sisanya cream)
    - Branches keluar dari node 1 ke 5 fungsi (SVG curve lines connecting):
      * Branch kiri-atas → DOMAIN SELECTOR (leaf-shaped pill "@masakita.com 🍃") dropdown leaf-stack
      * Branch kanan-atas → SALIN (mushroom icon button)
      * Branch kiri-tengah → REFRESH (sprout icon button)
      * Branch kanan-tengah → UBAH (flower icon button, klik → blob expand jadi input organic + "Plant" Buat / "Cancel" buttons)
      * Branch kiri-bawah → ACAK (dice acorn button)
      * Branch kanan-bawah → HAPUS (withered leaf button merah autumn, klik → konfirmasi blob)
  * Node 2 (mid trunk): 4 stats sebagai "fruit cluster" — 4 organic blob fruits berbeda warna (berry, leaf, mushroom, infinity flower) dengan angka di dalamnya
  * Node 3 (bottom trunk): inbox list sebagai LEAVES STACK — tiap email = leaf shape dengan teks di dalam, angled berbeda-beda (rotasi -10 sampai +10deg), klik = leaf flip-open detail
- Empty state node bottom: "the trees are quiet today 🌲" italic moss

═══ API DOCS — Layout: HERBARIUM PAGE ═══
- Background parchment-green #f0ebd8 dengan pressed-leaf decorations corner
- Layout sebagai "halaman herbarium" — 4 endpoint sebagai SPESIMEN cards:
  * Top: "API Specimens — Field Guide" serif italic + sub sage
  * API Key card sebagai "label specimen": kotak parchment dengan key handwritten-style + tombol "regenerate seed" / "copy" minimal
  * 4 endpoint sebagai 2x2 grid SPESIMEN cards organic blob shape parchment:
    * Tiap card: gambar leaf SVG dekoratif + METHOD label sebagai "species name" italic Latin-style + path sebagai "scientific notation" mono + deskripsi naturalist prose + parameters table hairline + response JSON dalam wood-frame box + code tabs cURL/JS/Python sebagai "habitat tags"
  * Bottom: footer "Field Notes — Rate Limit 1000/min — Base: api.masakita.com"

═══ GAYA VISUAL ═══
- Palette: deep forest #0d2818, sage #87a96b, moss #4a7c59, cream parchment #f0ebd8, accent autumn-orange #d97757 (sparse)
- Font: serif natural (Lora/Crimson fallback font-serif), italic untuk emphasis, NO mono di body (mono hanya untuk path API)
- Shapes: organic blob border-radius asymmetric, SVG leaves & branches decorative curves
- Texture: subtle paper/leaf grain
- NO sharp corners, NO hard shadows — soft glow only

INTERAKSI: organic sway hover, branch SVG draw-in animation on load, dropdown leaf-stack, mode UBAH blob morph, smooth nature transitions.

React + Tailwind + lucide-react. Default export.
```

---

# PROMPT 17 — SCI-FI HOLOGRAPHIC HUD

```
Buatkan single React file (.jsx) untuk "MasakitaMail" vibe SCI-FI HOLOGRAPHIC HUD.

PUNYA 3 HALAMAN: Lockscreen → Inbox → API Docs.

═══ LOCKSCREEN ═══
- Background: deep space dark #050818 dengan starfield SVG dots + subtle nebula gradient + grid horizon perspective
- Center: holographic projection hexagon ring (3 concentric rings rotating slow, SVG):
  * Inside center: brand "MASAKITA::MAIL" mono futuristic + version tag "v3.1.7-alpha"
  * "BIOMETRIC ID :: REQUIRED" pulsing teks
  * INPUT PASSWORD SAJA: holographic teal #00d4ff border (full-width karakter brackets), fingerprint scan icon di samping, dot indicator besar pulse
  * Tombol "// VERIFY IDENTITY" gradient teal→amber dengan scan-line animation
  * Bottom: "TRANSMISSION ENCRYPTED · QUANTUM-SAFE" mono small
- Hardcoded "masakita2025"
- Salah: hologram glitch + "ID REJECTED // RETRY" red flash + ring rotates faster shaking
- Benar: hologram dissipate + "WELCOME, OPERATOR" → Inbox

═══ INBOX — Layout: SPACECRAFT CONTROL PANEL ═══
Layout berbeda: panel control pesawat luar angkasa, dengan radial menus dan circular gauges.
- Top: status bar full-width dengan multiple readouts mono (UPTIME 99.97% / SIGNAL ●●●● / ENC ON / LIVE ▲ / OPERATOR: GUEST / [DISCONNECT])
- Layout 3-zone:
  * ZONE LEFT (col-3): vertical status panel — 4 stats sebagai CIRCULAR GAUGES (rings dengan angka di tengah, label outside ring) dengan animated needle:
    * Ring 1: MESSAGES (full ring teal)
    * Ring 2: UNREAD (partial ring amber)
    * Ring 3: LATEST_RX (digital readout teal)
    * Ring 4: EXPIRE (∞ icon center)
  * ZONE CENTER (col-6, main control): hexagonal frame berisi:
    * Email display besar mono futuristic (@ amber, username teal) — dengan "BROADCASTING ON FREQUENCY" label tiny
    * Domain selector sebagai ROTARY DIAL (klik → rotates dial to next domain, atau dropdown holographic)
    * 5 tombol sebagai RADIAL MENU around hexagon (HUD-style, masing-masing ada icon + glow):
      * SALIN (NW position)
      * REFRESH (NE)
      * UBAH (S, klik → hexagon transforms ke input mode + Buat/Cancel buttons hexagonal)
      * ACAK (SW)
      * HAPUS (SE, red glow, klik → modal "DELETE ALL TRANSMISSIONS? CONFIRM/ABORT")
  * ZONE RIGHT (col-3): vertical scroll panel — inbox list sebagai INCOMING TRANSMISSIONS log:
    * Header "::INCOMING_LOG::" mono
    * 6 mock emails sebagai data rows: timestamp + freq + sender + subject preview, hover → highlight + side-arrow indicator
    * Auto-scroll feel (ticker style)
- Email detail: HUD overlay full-screen dengan diagonal frame, content scrollable di middle frame
- Empty state log: "::AWAITING_TRANSMISSION::" pulsing mono

═══ API DOCS — Layout: SHIP COMPUTER TERMINAL ═══
- Background sama deep space
- Layout: holographic 2-pane:
  * LEFT panel: directory tree scifi-style:
    "::ARCHIVE/AUTH"
    "::ARCHIVE/PROTOCOLS/"
    "  ↳ generate.proto"
    "  ↳ list.proto"
    "  ↳ detail.proto"
    "  ↳ purge.proto"
  * RIGHT panel: holographic content frame dengan:
    * API Key sebagai "ENCRYPTION KEY" display: kotak holographic frame + key partial visible + scan-line + tombol [::REGEN::] [::COPY::] [::REVEAL::]
    * Tiap endpoint protocol:
      - Heading "PROTOCOL :: GENERATE_NEW_FREQ" mono futuristic
      - METHOD pill holographic neon (POST teal, GET cyan, DELETE red-amber)
      - Path mono dengan glow
      - "PARAMETERS://" dalam frame holographic table
      - "RESPONSE://" dalam scan-line frame JSON
      - Code tabs sebagai "DIALECT://" buttons (cURL/JS/Python)
- Footer: "::RATE_LIMIT 1000/MIN :: BASE_URL api.masakita.com :: STATUS NOMINAL::"

═══ GAYA VISUAL ═══
- Palette: deep space #050818, holo teal #00d4ff, amber alert #ffb800, red-warning #ff3860, white-glow #e0f7ff
- Font: futuristic mono (Major Mono Display fallback ke Space Mono / JetBrains Mono), all-caps display
- Effects: scan lines moving, hexagon SVG frames, glow blur, dot indicators, brackets [ ] :: separators, animated rings rotating slow
- Decorative: starfield bg, grid horizon perspective, hex patterns

INTERAKSI: radial menu hover glow expand, gauge animasi smooth, scan-line moving on input focus, dropdown holo, mode UBAH hexagon transform, code copy "//TRANSFER COMPLETE" toast.

React + Tailwind + lucide-react. Default export.
```

---

# PROMPT 18 — KIDS PLAYFUL CARTOON

```
Buatkan single React file (.jsx) untuk "MasakitaMail" vibe KIDS PLAYFUL CARTOON.

PUNYA 3 HALAMAN: Lockscreen → Inbox → API Docs.

═══ LOCKSCREEN ═══
- Background: bright sky blue #87ceeb dengan awan SVG bergerak slow + matahari emoji ☀️ pojok dengan rays
- Center: BIG PLAYFUL DOOR illustration SVG di background
- Floating speech-bubble card center:
  * Heading comic-style "PSST! 🤫"
  * Sub bouncy "Tau passwordnya?"
  * INPUT PASSWORD SAJA: bubble-shaped (asymmetric border-radius) dengan border thick comic style, font playful (Fredoka/Baloo fallback), dot indicator gigantis pengganti karakter
  * Tombol "BUKA! 🚪" gigantis bouncy rainbow gradient hover bouncy bigger
  * Bottom decoration: 3 stars ⭐⭐⭐ animated wiggle
- Hardcoded "masakita2025"
- Salah: door shake "NO NO NO! 🙅" + helper bubble pink rotate
- Benar: door swing-open animation + sparkles ✨ → Inbox

═══ INBOX — Layout: COMIC BOOK PANELS ═══
Layout berbeda: COMIC BOOK PAGE dengan multiple panels (rectangles dengan border tebal hitam comic-style).
- Top header: comic title bar "MASAKITA-MAIL #1!" Bangers/Bungee font + LIVE star ⭐ + uptime cloud + Lock kunci
- Comic page grid dengan 6 panels berbeda ukuran (asymmetric comic layout):
  * PANEL 1 (top-wide, span-2): "YOUR SECRET EMAIL!" — speech bubble pointing ke email display besar bouncy (@ rainbow gradient text, sisanya bold dark)
  * PANEL 2 (top-right): DOMAIN SELECTOR sebagai "PICK YOUR PLANET 🌍" — dropdown bubble dengan 3 domain (masakita.com 🌎 / neomail.id 🌍 / tempbox.io 🌏)
  * PANEL 3 (mid-left): 5 BIG CARTOON BUTTONS dalam panel — masing-masing icon emoji besar + label bouncy:
    * 📋 SALIN! (klik → konfeti emoji burst)
    * 🎲 ACAK!
    * 🔄 REFRESH!
    * ✏️ UBAH! (klik → speech bubble expand input besar bouncy + 2 buttons "BUAT! ✨" dan "BATAL ❌")
    * 🗑️ HAPUS! (klik → speech bubble warning "HAPUS SEMUANYA?? 😱" + 2 buttons)
  * PANEL 4 (mid-right): 4 STATS sebagai SUPERHERO POWER METERS — 4 mini panels comic dengan icon emoji besar + angka bouncy:
    * 💌 MESSAGES POWER: 6
    * 📬 UNREAD POWER: 2
    * ⏰ LATEST: 2 MIN
    * ♾️ FOREVER MODE
  * PANEL 5 (bottom-wide, span-2): "INCOMING MAIL!" — inbox list sebagai 6 SPEECH BUBBLES bertumpuk dari karakter cartoon kecil berbeda (avatar bulat warna cerah), hover bubble zoom + tail wag
- Empty state PANEL 5: cartoon character sad dengan bubble "Belum ada surat... 😢"

═══ API DOCS — Layout: ADVENTURE MAP ═══
- Background: treasure map texture parchment kuning + path dotted SVG
- Layout sebagai PETA PETUALANGAN:
  * Top: heading comic "DEVELOPER QUEST! 🗺️"
  * API Key sebagai TREASURE CHEST card: chest illustration SVG + key dalam scroll banner + tombol [✨ REGENERATE] [📋 COPY] cartoon buttons
  * 4 endpoint sebagai 4 CHECKPOINT NODES di peta (connected by dotted path):
    * Node 1: ⚔️ POST GENERATE — "buat email baru!"
    * Node 2: 🗺️ GET INBOX — "lihat semua suratmu!"
    * Node 3: 🔍 GET DETAIL — "baca satu surat!"
    * Node 4: 💥 DELETE ALL — "hapus semuaa!"
  * Tiap node klik → expand modal cartoon panel berisi: METHOD pill bouncy rainbow + path mono cute + deskripsi friendly + parameters list emoji bullet + response code block bg awan + code tabs cURL/JS/Python sebagai 3 character avatar tabs
- Footer: treasure box "RATE LIMIT 1000/MIN — BASE: api.masakita.com" comic banner

═══ GAYA VISUAL ═══
- Palette: bright primary (sky #87ceeb, sun-yellow #ffd93d, grass-green #6bcf7f, candy-pink #ff6b9d, blueberry #4d96ff, treat-purple #b967ff)
- Font: comic playful (Fredoka, Baloo, Bangers fallback), thick border-4 hitam pada elements (comic style), bouncy hover scales
- Decorations: emoji everywhere (💌📬🌟✨🎈), speech-bubble shapes, wiggle animations, rainbow gradients sparingly
- Border 3-4px solid hitam (comic outline), rounded-2xl/3xl mostly

INTERAKSI: bouncy spring transitions on EVERYTHING, emoji confetti bursts, dropdown bubble pop, mode UBAH speech bubble morph, sound-effect text "POW!" "ZAP!" optional CSS animations.

React + Tailwind + lucide-react. Default export.
```

---

# PROMPT 19 — LUXURY GOLD BLACK PREMIUM

```
Buatkan single React file (.jsx) untuk "MasakitaMail" vibe LUXURY GOLD BLACK PREMIUM (Rolex/Bvlgari brand vibe).

PUNYA 3 HALAMAN: Lockscreen → Inbox → API Docs.

═══ LOCKSCREEN ═══
- Background: deep matte black #0a0a0a dengan subtle gold particle SVG floating + gold radial gradient pojok
- Center: thin gold-foil rectangle frame (border 1px gold #d4af37, padding generous):
  * Logo monogram "M" gold serif elaborate gigantis di top
  * Sub small-caps tracking-[0.4em] "MASAKITA · MAISON · EST. MMXXIV"
  * Heading thin serif italic "Private Access"
  * Decoration: hairline gold divider dengan diamond center ◆
  * INPUT PASSWORD SAJA: hairline gold border-bottom only, no fill, font serif elegant ivory color, placeholder italic "passphrase"
  * Tombol "ENTER" small-caps tracking-widest gold serif outline, hover → fill gold-black
- Hardcoded "masakita2025"
- Salah: subtle gold→red shimmer on input + hairline red replace gold + helper italic ivory "Access not granted"
- Benar: gold dissolve frame outward → Inbox

═══ INBOX — Layout: GALLERY PRESENTATION ═══
Layout berbeda: gallery presentation dengan generous whitespace dan asymmetric balance.
- Top: thin gold strip dengan logo monogram "M" kiri + LIVE diamond ◆ + uptime hairline + Lock icon ivory + "Sign Out" small-caps
- Section ATAS (centered): "YOUR PRIVATE ADDRESS" small-caps tracking-[0.4em] gold tiny → email display GIGANTIS serif elegant italic (@ gold, username ivory) — dengan generous whitespace di sekitar
- Section MIDDLE (asymmetric):
  * KIRI (col-7): "INSTRUMENTS" — 6 fungsi sebagai vertical list elegant:
    * Tiap baris: hairline gold divider + label small-caps tracking-wider + value text-button italic
    * "DOMAIN ............... @masakita.com ▾" (klik → dropdown elegant gold border 3 domain serif)
    * "COPY ADDRESS"
    * "REGENERATE"
    * "MODIFY USERNAME" (klik → expand inline hairline input + "Apply" / "Discard" italic text-buttons)
    * "RANDOMIZE"
    * "CLEAR INBOX" (red-burgundy accent, klik → konfirmasi elegant overlay)
  * KANAN (col-5): "DOSSIER" — 4 stats sebagai serif numbered list elegant:
    * "MESSAGES — VI" (Roman numerals!)
    * "UNREAD — II"
    * "LATEST — 2'"
    * "EXPIRY — ∞"
    * Hairline gold dividers
- Section BOTTOM: "CORRESPONDENCE" — inbox list 6 mock emails sebagai elegant single-line entries:
  * Tiap baris: hairline gold divider + sender italic small-caps + judul email serif + waktu Roman/digital + "Read" text-link gold
- Empty state: italic ivory "No correspondence at this time. — M"

═══ API DOCS — Layout: COURTYARD CATALOG ═══
- Background sama matte black + gold particles
- Top: monogram + "DEVELOPER · CATALOGUE · MMXXIV"
- Layout 2-col elegant:
  * KIRI (col-3, sticky): TOC sebagai elegant numbered Roman list (I. Authentication / II. Generate / III. Inquiry / IV. Detail / V. Purge) dengan hairline gold + page numbers
  * KANAN (col-9): konten endpoint sebagai "ARTICLE":
    - "I. AUTHENTICATION" heading serif italic gigantis gold
    - Hairline gold double-rule divider
    - API Key dalam thin gold frame: key serif dengan partial mask + tombol "REGENERATE" / "COPY" small-caps gold underline-on-hover
    - Tiap endpoint:
      * "II. PROTOCOL — GENERATE NEW ADDRESS" heading
      * METHOD label small-caps elegant warna gold (POST), ivory (GET), burgundy (DELETE)
      * Path serif dalam blockquote thin gold frame
      * "PARAMETERS." section dengan hairline table elegant
      * "RESPONSE." section dengan code dalam matte-black frame thin-gold-border
      * "DIALECT." tabs cURL/JS/Python sebagai small-caps text-tabs gold-underline
- Footer: "RATE LIMIT — M PER MIN · BASE — api.masakita.com" hairline gold

═══ GAYA VISUAL ═══
- Palette: matte black #0a0a0a, gold #d4af37, ivory #f5f0e6, burgundy accent #722f37
- Font: serif elegant Didone-style high-contrast (Bodoni/Didot fallback ke font-serif), italic emphasis, small-caps tracking-widest captions
- Spacing: generous, golden-ratio-ish whitespace
- Decorations: hairline gold borders, diamond ◆ separators, monogram, Roman numerals, em-dashes
- NO rounded, NO shadows, hairlines+gold-foil only

INTERAKSI: subtle elegant fades, dropdown gold-frame elegant, mode UBAH inline hairline, code copy "Transcribed" small-caps toast.

React + Tailwind + lucide-react. Default export.
```

---

# PROMPT 20 — DUOTONE RISOGRAPH PRINT

```
Buatkan single React file (.jsx) untuk "MasakitaMail" vibe DUOTONE RISOGRAPH PRINT (zine print aesthetic).

PUNYA 3 HALAMAN: Lockscreen → Inbox → API Docs.

═══ LOCKSCREEN ═══
- Background: kertas riso warm cream #f5ecd6 dengan grain heavy texture + dot screen pattern (CSS dots)
- Hanya 2 warna ink dipakai: HOT PINK #ff5577 + ELECTRIC BLUE #1144cc (mix → ungu/maroon kalau overlap)
- Center: chunky heading "ACCESS." gigantis hot pink ink dengan slight registration offset (shadow blue offset 4px untuk efek misprint)
- Sub blue ink: "tap your secret →"
- INPUT PASSWORD SAJA: chunky 3px solid pink border, no fill, font heavy display sans, blue ink on focus border
- Tombol "GO." chunky slab — bg pink ink + offset shadow blue 6px (misregistration effect), hover → offset reduce ke 2px (press-down feel)
- Decorations: SVG halftone dots scattered, mini riso illustrations (stars, squiggles) hot pink + blue overlap
- Hardcoded "masakita2025"
- Salah: register-offset mistake makin kacau + teks "MISPRINT! TRY AGAIN." pink dengan blue underline
- Benar: paper flip transition with riso grain → Inbox

═══ INBOX — Layout: ZINE FOLD-OUT MULTI-PANEL ═══
Layout berbeda: ZINE/POSTER style — multi-panel block layout dengan mixed alignment, very printed-piece feel.
- Top: full-width strip pink dengan teks blue overlay "MASAKITA.MAIL — ISSUE 04 — RIS0 RUN OF 100" + LIVE dot blue + uptime tiny + Lock icon
- Body: COLLAGE LAYOUT (mix grid asymmetric + offset elements):
  * BLOK A (top-left, hot pink bg): "YOUR ADDRESS." chunky display + email gigantis (@ blue ink offset, username pink ink solid, registration shifty)
  * BLOK B (top-right, blue bg): 4 stats sebagai chunky number cards:
    * "06" PINK ink huge / "MESSAGES" small caps blue
    * "02" / "UNREAD"
    * "2'" / "LATEST"
    * "∞" / "FOREVER"
    Tiap angka grain-textured, label tiny offset
  * BLOK C (mid-strip horizontal pink): 6 fungsi sebagai HORIZONTAL CHUNKY BUTTONS (tiap button blok warna kontras, register offset shadow, font display heavy):
    * "@MASAKITA.COM ▾" (DOMAIN SELECTOR, klik → dropdown chunky 3 domain blok stacked)
    * "COPY"
    * "REFRESH"
    * "EDIT" (klik → BLOK A transform jadi input mode chunky pink + Buat/Cancel chunky)
    * "RANDOM"
    * "DELETE" (chunky merah-pink + offset blue)
  * BLOK D (bottom-full): "MAIL CALL." heading display + inbox list sebagai 6 ZINE TICKER ENTRIES horizontal scroll-snap atau stacked rows:
    * Tiap entry: nomor besar grain-pink + sender chunky display + subject offset blue ink + waktu tiny → mimic risograph print misregistration on hover
- Empty state BLOK D: "NO SIGNAL." chunky pink + grain texture
- Decorations: dot patterns, squiggle SVG, scribble lines ink-bleed effect

═══ API DOCS — Layout: ZINE INSTRUCTION MANUAL ═══
- Background sama riso paper
- Layout sebagai zine spread pages:
  * Top header: "DEV ZINE · vol 04 · RIS0 EDITION" mixed pink+blue ink offset
  * API Key sebagai chunky ZINE STICKER blok pink: "API KEY ↓" heading + key display dalam kotak blue-bordered + tombol [REGEN.] [COPY.] chunky offset
  * 4 endpoint sebagai 4 ZINE PAGE blocks asymmetric (mix layout):
    * Tiap blok dimensi beda (ada yang span-2, ada yang span-1):
      - Heading "ENDPOINT 01 ⌖ POST GENERATE." chunky pink dengan offset blue
      - METHOD label sebagai SLAB STICKER warna kontras
      - Path mono dalam blue-bordered kotak
      - Parameters table chunky border + headers display caps
      - Response JSON dalam pink-tinted code block dengan grain
      - Code tabs cURL/JS/Python sebagai BIG SLAB BUTTONS (tab aktif = pink fill, tab inactive = blue outline)
  * Footer ZINE: pink+blue striped border + "RATE: 1k/MIN ⌖ BASE: api.masakita.com ⌖ © RIS0 PRINT 2024"

═══ GAYA VISUAL ═══
- Palette: HANYA 2 warna ink — hot pink #ff5577 + electric blue #1144cc, paper cream #f5ecd6 (overlap area = maroon-ish via mix-blend-multiply)
- Font: chunky display sans heavy (Druk/Inter Black fallback ke font-sans extra-bold), small-caps captions
- Effects: registration-offset (intentional 2-4px misalignment shadow), grain noise SVG/CSS, halftone dots, ink-bleed edges, slight rotation -1 to +1 deg pada elements
- Decorations: squiggles, stars, ticker stripes, dot screens
- Limited palette is HARD RULE: hanya pink + blue + paper

INTERAKSI: registration-shift on hover, dropdown chunky stack, mode UBAH blok transform, code copy "PRINTED!" toast misregistered, animations slight wobble.

React + Tailwind + lucide-react. Default export.
```

---

## 🎨 RINGKASAN KEUNIKAN BATCH 2

| # | Tema | Layout Inbox | Layout API Docs |
|---|------|--------------|-----------------|
| 11 | Vaporwave 80s | Horizontal scroll snap timeline | Cassette tape playlist |
| 12 | Japanese Zen | Vertical asymmetric ikebana | Tanzaku scroll strips |
| 13 | Claymorphism 3D | Hexagon honeycomb grid | Clay 2x2 dashboard cards |
| 14 | Neumorphism Soft | 4-col extruded dashboard | Accordion panel stack |
| 15 | Newspaper 1920s | Broadsheet 5-col vintage | Telegraph manual 2-pane |
| 16 | Nature Forest | Branching tree flow w/ SVG curves | Herbarium specimen pages |
| 17 | Sci-Fi Hologram | Spacecraft control panel + radial menu | Ship computer terminal |
| 18 | Kids Cartoon | Comic book panels asymmetric | Adventure treasure map |
| 19 | Luxury Gold Black | Gallery presentation asymmetric | Courtyard catalog elegant |
| 20 | Riso Duotone Print | Zine collage multi-block | Zine instruction spread |

## 📋 CARA PAKAI

Sama seperti batch 1: copy 1 prompt utuh → paste di Claude.ai (chat baru) → tunggu artifact jadi → test password `masakita2025` → cek checklist fitur → iterasi kalau perlu.

## 💡 TIPS BATCH 2

- Beberapa tema (Hologram, Riso Print, Vaporwave) butuh effect CSS yang complex — kalau hasil tidak persis, tambah: `"Pertahankan effect [scan-line / registration-offset / chrome gradient] persis seperti deskripsi prompt."`
- Tema Neumorphism dan Claymorphism harus pakai background warna spesifik (gray #e0e5ec untuk neuro, pastel solid untuk clay) — JANGAN biarkan Claude ganti ke putih biasa.
- Tema Japanese Zen dan Luxury Gold Black butuh whitespace generous — tambah: `"JANGAN padatkan layout, whitespace adalah fitur utama tema ini."`
