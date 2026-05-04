// admin-app.jsx — lapakurab Admin Panel
// Classic SaaS layout (sidebar + topbar + content), Soft Cloud palette synced w/ main app
// Mounted via #admin URL hash; localStorage persists Products/Orders edits

const { useState: useStateA, useEffect: useEffectA, useMemo: useMemoA, useRef: useRefA, createContext: createContextA, useContext: useContextA } = React;

// Shared helpers from lapakurab-shared.jsx
const useModalKey = window.useModalKey;
const useFormValidation = window.useFormValidation;
const usePersistedFilter = window.usePersistedFilter;
const useSelection = window.useSelection;
const Field = window.Field;
const EmptyState = window.EmptyState;
const SkeletonRow = window.SkeletonRow;
const CredentialReveal = window.CredentialReveal;
const CommandPalette = window.CommandPalette;

// ─── Seed data (fallback when no localStorage) ──────────────────────────────
const SEED_PRODUCTS = [
  { id:'p1', name:'Streamflix Premium', cat:'streaming', tagline:'4K UHD · 4 Profil', priceIDR:25000, oldIDR:55000, stock:12, rating:4.9, reviews:1284, durations:['1 Bulan','3 Bulan','6 Bulan','1 Tahun'], hue:340, emoji:'▶', active:true },
  { id:'p2', name:'Tunify Family', cat:'streaming', tagline:'Musik tanpa iklan · 6 akun', priceIDR:18000, oldIDR:42000, stock:8, rating:4.8, reviews:932, durations:['1 Bulan','3 Bulan','6 Bulan'], hue:140, emoji:'♪', active:true },
  { id:'p3', name:'CloudVPN Pro', cat:'vpn', tagline:'80+ negara · No-log', priceIDR:15000, oldIDR:35000, stock:24, rating:4.7, reviews:512, durations:['1 Bulan','6 Bulan','1 Tahun','2 Tahun'], hue:220, emoji:'◈', active:true },
  { id:'p4', name:'Disnia+ Hotstart', cat:'streaming', tagline:'Marvel · Star Wars · Pixar', priceIDR:22000, oldIDR:49000, stock:5, rating:4.9, reviews:2104, durations:['1 Bulan','3 Bulan','1 Tahun'], hue:265, emoji:'✦', active:true },
  { id:'p5', name:'YouTune Premium', cat:'streaming', tagline:'No ads · Background play', priceIDR:12000, oldIDR:28000, stock:31, rating:4.8, reviews:1876, durations:['1 Bulan','3 Bulan','6 Bulan','1 Tahun'], hue:10, emoji:'▷', active:true },
  { id:'p6', name:'NordSecure VPN', cat:'vpn', tagline:'5500+ server · Kill switch', priceIDR:20000, oldIDR:48000, stock:17, rating:4.6, reviews:743, durations:['1 Bulan','1 Tahun','2 Tahun'], hue:200, emoji:'◇', active:true },
  { id:'p7', name:'HBO Mix', cat:'streaming', tagline:'Series premium · Original', priceIDR:28000, oldIDR:60000, stock:3, rating:4.9, reviews:654, durations:['1 Bulan','3 Bulan'], hue:285, emoji:'◉', active:true },
  { id:'p8', name:'Surfly VPN Lite', cat:'vpn', tagline:'Ringan & cepat · 1 device', priceIDR:9000, oldIDR:22000, stock:42, rating:4.5, reviews:298, durations:['1 Bulan','3 Bulan','6 Bulan'], hue:170, emoji:'≈', active:false },
];

const SEED_ORDERS = [
  { id:'TKA-2841', date:'2026-05-02', customer:'Rina Adhianti', email:'rina@mail.com', product:'Streamflix Premium', duration:'3 Bulan', total:75000, status:'paid', payment:'QRIS' },
  { id:'TKA-2840', date:'2026-05-02', customer:'Dimas Pratama', email:'dimas.p@mail.com', product:'CloudVPN Pro', duration:'1 Tahun', total:180000, status:'paid', payment:'GoPay' },
  { id:'TKA-2839', date:'2026-05-01', customer:'Anita K.', email:'anita.k@mail.com', product:'Tunify Family', duration:'1 Bulan', total:18000, status:'pending', payment:'OVO' },
  { id:'TKA-2838', date:'2026-05-01', customer:'Bagas W.', email:'bagas@mail.com', product:'YouTune Premium', duration:'6 Bulan', total:72000, status:'delivered', payment:'DANA' },
  { id:'TKA-2837', date:'2026-04-30', customer:'Sari M.', email:'sari@mail.com', product:'Disnia+ Hotstart', duration:'3 Bulan', total:66000, status:'paid', payment:'QRIS' },
  { id:'TKA-2836', date:'2026-04-30', customer:'Yoga T.', email:'yoga@mail.com', product:'HBO Mix', duration:'1 Bulan', total:28000, status:'refunded', payment:'GoPay' },
  { id:'TKA-2835', date:'2026-04-29', customer:'Mira F.', email:'mira@mail.com', product:'NordSecure VPN', duration:'1 Tahun', total:240000, status:'delivered', payment:'ShopeePay' },
  { id:'TKA-2834', date:'2026-04-29', customer:'Adit S.', email:'adit@mail.com', product:'Streamflix Premium', duration:'1 Tahun', total:300000, status:'paid', payment:'QRIS' },
];

const SEED_STOCK = [
  { id:'s1', productId:'p1', email:'sf.user01@mail.id', password:'X9k#mPq2', status:'available', addedAt:'2026-04-20' },
  { id:'s2', productId:'p1', email:'sf.user02@mail.id', password:'L4n!vBt8', status:'available', addedAt:'2026-04-22' },
  { id:'s3', productId:'p1', email:'sf.user03@mail.id', password:'R2x@hYm5', status:'sold', addedAt:'2026-04-15' },
  { id:'s4', productId:'p3', email:'vpn.acc01@mail.id', password:'P7w&kZc1', status:'available', addedAt:'2026-04-25' },
  { id:'s5', productId:'p2', email:'tun.fam01@mail.id', password:'M3q*sWb6', status:'available', addedAt:'2026-04-28' },
];

const SEED_USERS = [
  { id:'u1', name:'Rina Adhianti', email:'rina@mail.com', joined:'2026-02-14', orders:3, spent:225000, status:'active' },
  { id:'u2', name:'Dimas Pratama', email:'dimas.p@mail.com', joined:'2026-01-22', orders:5, spent:540000, status:'active' },
  { id:'u3', name:'Anita K.', email:'anita.k@mail.com', joined:'2026-03-08', orders:1, spent:18000, status:'active' },
  { id:'u4', name:'Bagas W.', email:'bagas@mail.com', joined:'2026-03-15', orders:2, spent:120000, status:'active' },
  { id:'u5', name:'Sari M.', email:'sari@mail.com', joined:'2026-04-01', orders:2, spent:138000, status:'active' },
  { id:'u6', name:'Yoga T.', email:'yoga@mail.com', joined:'2026-04-12', orders:1, spent:28000, status:'banned' },
];

const SEED_VOUCHERS = [
  { id:'v1', code:'WELCOME10', type:'percent', value:10, minOrder:50000, used:34, limit:100, expires:'2026-12-31', active:true },
  { id:'v2', code:'GAJIAN50K', type:'fixed', value:50000, minOrder:200000, used:12, limit:50, expires:'2026-05-31', active:true },
  { id:'v3', code:'NEWBIE5', type:'percent', value:5, minOrder:0, used:201, limit:0, expires:'2026-12-31', active:true },
  { id:'v4', code:'EXPIRED2025', type:'percent', value:20, minOrder:100000, used:88, limit:88, expires:'2025-12-31', active:false },
];

const SEED_GATEWAYS = [
  { id:'qris', name:'QRIS', enabled:true, fee:0.7, key:'qr_live_xxxxxxxxx' },
  { id:'gopay', name:'GoPay', enabled:true, fee:2.0, key:'gp_live_xxxxxxxxx' },
  { id:'ovo', name:'OVO', enabled:true, fee:2.0, key:'ovo_live_xxxxxxxx' },
  { id:'dana', name:'DANA', enabled:true, fee:1.5, key:'dn_live_xxxxxxxxx' },
  { id:'shopeepay', name:'ShopeePay', enabled:false, fee:2.0, key:'' },
];

const SEED_SETTINGS = {
  storeName: 'lapakurab',
  storeTagline: 'Digital goods marketplace · Premium subscriptions',
  logo: '', // base64 dataURL
  csWA: '+62 812-3456-7890',
  csEmail: 'cs@lapakurab.id',
  notifEmail: 'admin@lapakurab.id',
  notifyOnOrder: true,
  notifyOnLowStock: true,
  notifyOnRefund: true,
  autoDelivery: true,
  autoPauseOutOfStock: true,
  lowStockThreshold: 5,
  invoicePrefix: 'TKA',
  taxPercent: 0,
};

const SEED_AUDIT = [
  { id:'a1', at:'2026-05-02T10:24:00', actor:'admin@lapakurab.id', action:'product.update', target:'Streamflix Premium', detail:'Stok diubah 10 → 12' },
  { id:'a2', at:'2026-05-02T09:18:00', actor:'admin@lapakurab.id', action:'order.delivered', target:'#TKA-2841', detail:'Auto-delivery: kredensial dikirim ke rina@mail.com' },
  { id:'a3', at:'2026-05-01T16:42:00', actor:'admin@lapakurab.id', action:'voucher.create', target:'GAJIAN50K', detail:'Diskon Rp50.000, min order Rp200.000' },
  { id:'a4', at:'2026-05-01T14:05:00', actor:'admin@lapakurab.id', action:'gateway.update', target:'GoPay', detail:'API key diperbarui' },
  { id:'a5', at:'2026-04-30T11:30:00', actor:'admin@lapakurab.id', action:'user.ban', target:'yoga@mail.com', detail:'Indikasi fraud — chargeback berulang' },
];

const SEED_NOTIFICATIONS = [
  { id:'n1', at:'2026-05-02T10:30:00', kind:'order', title:'Pesanan baru #TKA-2841', body:'Streamflix Premium · Rp75.000', read:false },
  { id:'n2', at:'2026-05-02T09:18:00', kind:'success', title:'Auto-delivery sukses', body:'Kredensial dikirim ke rina@mail.com', read:false },
  { id:'n3', at:'2026-05-01T22:12:00', kind:'warn', title:'Stok HBO Mix menipis', body:'Tersisa 3 akun · threshold 5', read:false },
  { id:'n4', at:'2026-05-01T18:00:00', kind:'order', title:'Pesanan baru #TKA-2839', body:'Tunify Family · menunggu pembayaran', read:true },
  { id:'n5', at:'2026-04-30T11:30:00', kind:'danger', title:'Refund diproses', body:'#TKA-2836 · Rp28.000 dikembalikan', read:true },
];

const SEED_NOTES = []; // member notes [{ userId, at, actor, text }]

// ─── localStorage helpers ───────────────────────────────────────────────────
const LS_KEY = 'lapakurab_admin_v1';
const LS_KEY_LEGACY = 'nodestore_admin_v1';

function loadState() {
  try {
    let raw = localStorage.getItem(LS_KEY);
    // Auto-migrate from legacy nodestore key (rename brand)
    if (!raw) {
      const legacy = localStorage.getItem(LS_KEY_LEGACY);
      if (legacy) {
        // Replace any leftover brand strings inside the cached state
        raw = legacy
          .replace(/nodestore/g, 'lapakurab')
          .replace(/Nodestore/g, 'Lapakurab')
          .replace(/NODESTORE/g, 'LAPAKURAB');
        localStorage.setItem(LS_KEY, raw);
        localStorage.removeItem(LS_KEY_LEGACY);
      }
    }
    if (!raw) throw 0;
    const parsed = JSON.parse(raw);
    // Normalize legacy storeName even if migration already ran before
    if (parsed.settings && /nodestore/i.test(parsed.settings.storeName || '')) {
      parsed.settings.storeName = 'lapakurab';
    }
    return {
      products: parsed.products || SEED_PRODUCTS,
      orders: parsed.orders || SEED_ORDERS,
      stock: parsed.stock || SEED_STOCK,
      users: parsed.users || SEED_USERS,
      vouchers: parsed.vouchers || SEED_VOUCHERS,
      gateways: parsed.gateways || SEED_GATEWAYS,
      settings: parsed.settings || SEED_SETTINGS,
      audit: parsed.audit || SEED_AUDIT,
      notifications: parsed.notifications || SEED_NOTIFICATIONS,
      notes: parsed.notes || SEED_NOTES,
    };
  } catch (e) {
    return {
      products: SEED_PRODUCTS, orders: SEED_ORDERS, stock: SEED_STOCK,
      users: SEED_USERS, vouchers: SEED_VOUCHERS, gateways: SEED_GATEWAYS,
      settings: SEED_SETTINGS, audit: SEED_AUDIT, notifications: SEED_NOTIFICATIONS, notes: SEED_NOTES,
    };
  }
}

function saveState(state) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
}

const fmtIDRA = (n) => 'Rp' + (n||0).toLocaleString('id-ID');
const adminFmtDate = (s) => {
  const d = new Date(s);
  return d.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' });
};
const adminFmtDateTime = (s) => {
  const d = new Date(s);
  return d.toLocaleDateString('id-ID', { day:'numeric', month:'short' }) + ' · ' + d.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' });
};
const relTime = (iso) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'baru saja';
  if (diff < 3600) return Math.floor(diff/60) + ' menit lalu';
  if (diff < 86400) return Math.floor(diff/3600) + ' jam lalu';
  if (diff < 86400*7) return Math.floor(diff/86400) + ' hari lalu';
  return adminFmtDate(iso);
};
function downloadCSV(filename, rows) {
  const csv = rows.map(r => r.map(c => {
    const s = String(c == null ? '' : c);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s;
  }).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type:'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─── Admin Context ──────────────────────────────────────────────────────────
const AdminCtx = createContextA(null);

function AdminProvider({ children }) {
  const [authed, setAuthed] = useStateA(() => sessionStorage.getItem('lapakurab_admin_session') === '1');
  const [page, setPage] = useStateA('dashboard');
  const [pageParam, setPageParam] = useStateA(null); // for detail pages
  const [data, setData] = useStateA(loadState);
  const [darkMode, setDarkMode] = useStateA(() => localStorage.getItem('lapakurab_admin_dark') === '1');

  useEffectA(() => { saveState(data); }, [data]);
  useEffectA(() => { localStorage.setItem('lapakurab_admin_dark', darkMode ? '1' : '0'); }, [darkMode]);
  const toggleDark = () => setDarkMode(d => !d);

  // Audit log helper
  const logAudit = (action, target, detail) => {
    setData(d => ({
      ...d,
      audit: [{
        id: 'a' + Date.now(),
        at: new Date().toISOString(),
        actor: 'admin@lapakurab.id',
        action, target, detail,
      }, ...d.audit].slice(0, 200),
    }));
  };
  const pushNotif = (kind, title, body) => {
    setData(d => ({
      ...d,
      notifications: [{ id:'n'+Date.now(), at: new Date().toISOString(), kind, title, body, read: false }, ...d.notifications].slice(0, 100),
    }));
  };

  const updateProducts = (fn) => setData(d => ({...d, products: typeof fn === 'function' ? fn(d.products) : fn }));
  const updateOrders = (fn) => setData(d => ({...d, orders: typeof fn === 'function' ? fn(d.orders) : fn }));
  const updateStock = (fn) => setData(d => ({...d, stock: typeof fn === 'function' ? fn(d.stock) : fn }));
  const updateUsers = (fn) => setData(d => ({...d, users: typeof fn === 'function' ? fn(d.users) : fn }));
  const updateVouchers = (fn) => setData(d => ({...d, vouchers: typeof fn === 'function' ? fn(d.vouchers) : fn }));
  const updateGateways = (fn) => setData(d => ({...d, gateways: typeof fn === 'function' ? fn(d.gateways) : fn }));
  const updateSettings = (fn) => setData(d => ({...d, settings: typeof fn === 'function' ? fn(d.settings) : fn }));
  const updateNotifications = (fn) => setData(d => ({...d, notifications: typeof fn === 'function' ? fn(d.notifications) : fn }));
  const updateNotes = (fn) => setData(d => ({...d, notes: typeof fn === 'function' ? fn(d.notes) : fn }));

  // Auto-pause produk yang stoknya 0 (kalau setting aktif)
  useEffectA(() => {
    if (!data.settings?.autoPauseOutOfStock) return;
    const toToggle = data.products.filter(p => p.stock === 0 && p.active);
    if (toToggle.length > 0) {
      setData(d => ({ ...d, products: d.products.map(p => (p.stock === 0 && p.active) ? { ...p, active:false } : p) }));
      toToggle.forEach(p => pushNotif('warn', `Auto-pause: ${p.name}`, 'Produk dinonaktifkan otomatis karena stok habis.'));
    }
  }, [data.products, data.settings?.autoPauseOutOfStock]);

  const resetData = () => setData({
    products: SEED_PRODUCTS, orders: SEED_ORDERS, stock: SEED_STOCK, users: SEED_USERS,
    vouchers: SEED_VOUCHERS, gateways: SEED_GATEWAYS, settings: SEED_SETTINGS,
    audit: SEED_AUDIT, notifications: SEED_NOTIFICATIONS, notes: SEED_NOTES,
  });

  const login = () => { sessionStorage.setItem('lapakurab_admin_session','1'); setAuthed(true); };
  const logout = () => { sessionStorage.removeItem('lapakurab_admin_session'); setAuthed(false); };

  const navigate = (p, param=null) => { setPage(p); setPageParam(param); window.scrollTo(0,0); };

  return (
    <AdminCtx.Provider value={{
      authed, login, logout, page, setPage, pageParam, setPageParam, navigate,
      ...data,
      updateProducts, updateOrders, updateStock, updateUsers, updateVouchers, updateGateways,
      updateSettings, updateNotifications, updateNotes,
      logAudit, pushNotif, resetData,
      darkMode, toggleDark,
    }}>{children}</AdminCtx.Provider>
  );
}
const useAdmin = () => useContextA(AdminCtx);

// ─── Theme tokens (Soft Cloud, synced with main app) ───────────────────────
const ADMIN_THEME_LIGHT = {
  '--bg':'#F4F1EC',
  '--surface':'#FFFFFF',
  '--surface-2':'#FAF7F1',
  '--ink':'#22304A',
  '--ink-soft':'#7A8499',
  '--primary':'#5B8DEF',
  '--mint':'#9DD9C5',
  '--peach':'#F7C39A',
  '--lilac':'#B8A5E3',
  '--border':'#E6E0D6',
  '--border-strong':'#D7CFC1',
  '--success':'#0F8B5C',
  '--warn':'#D97706',
  '--danger':'#DC2626',
  '--font-display':'"Plus Jakarta Sans", system-ui, sans-serif',
};

const ADMIN_THEME_DARK = {
  '--bg':'#0F1219',
  '--surface':'#161A24',
  '--surface-2':'#1D2230',
  '--ink':'#E8EBF0',
  '--ink-soft':'#8993A8',
  '--primary':'#6B97F5',
  '--mint':'#7BC4AC',
  '--peach':'#E5A975',
  '--lilac':'#A28BD4',
  '--border':'#2A3142',
  '--border-strong':'#374058',
  '--success':'#3DBE85',
  '--warn':'#E89846',
  '--danger':'#E85555',
  '--font-display':'"Plus Jakarta Sans", system-ui, sans-serif',
};

const getAdminTheme = (dark) => dark ? ADMIN_THEME_DARK : ADMIN_THEME_LIGHT;

// Backward compat (used in modalCard merge etc.)
const ADMIN_THEME = ADMIN_THEME_LIGHT;

// ─── Login screen ───────────────────────────────────────────────────────────
function AdminLogin() {
  const { login, darkMode } = useAdmin();
  const [email, setEmail] = useStateA('admin@lapakurab.id');
  const [pw, setPw] = useStateA('');
  const [err, setErr] = useStateA('');
  const [show, setShow] = useStateA(false);

  const submit = (e) => {
    e.preventDefault();
    if (pw === 'admin123' || pw === 'demo') { setErr(''); login(); }
    else setErr('Email atau password salah. (Demo: password = "admin123")');
  };

  return (
    <div style={{ ...getAdminTheme(darkMode), minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:'"DM Sans", system-ui, sans-serif' }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, justifyContent:'center', marginBottom:32 }}>
          <div style={{
            width:40, height:40, borderRadius:10,
            background:'linear-gradient(135deg, var(--primary), var(--lilac))',
            display:'flex', alignItems:'center', justifyContent:'center', color:'white',
            fontWeight:800, fontSize:18, fontFamily:'var(--font-display)',
          }}>L</div>
          <div style={{ fontWeight:700, fontSize:20, fontFamily:'var(--font-display)', color:'var(--ink)', letterSpacing:'-0.02em' }}>
            lapakurab<span style={{ color:'var(--ink-soft)', fontWeight:500, marginLeft:4 }}>· admin</span>
          </div>
        </div>

        <form onSubmit={submit} style={{
          background:'var(--surface)', borderRadius:16, padding:'32px 28px',
          border:'1px solid var(--border)', boxShadow:'0 1px 2px rgba(0,0,0,0.04), 0 24px 60px rgba(0,0,0,0.06)',
        }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 6px', color:'var(--ink)' }}>
            Masuk ke admin panel
          </h1>
          <p style={{ color:'var(--ink-soft)', fontSize:13, margin:'0 0 24px' }}>
            Kelola produk, order, dan stok akun lapakurab.
          </p>

          <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--ink)', marginBottom:6 }}>Email admin</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" style={inpStyle} />

          <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--ink)', marginBottom:6, marginTop:14 }}>Password</label>
          <div style={{ position:'relative' }}>
            <input value={pw} onChange={e=>setPw(e.target.value)} type={show?'text':'password'} placeholder="••••••••" style={{ ...inpStyle, paddingRight:62 }} />
            <button type="button" onClick={()=>setShow(s=>!s)} style={{
              position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
              background:'none', border:0, cursor:'pointer', color:'var(--ink-soft)',
              fontSize:11, fontWeight:600, padding:'4px 8px', fontFamily:'inherit',
            }}>{show?'Sembunyi':'Tampil'}</button>
          </div>

          {err && (
            <div style={{ marginTop:12, padding:'8px 12px', background:'rgba(220,38,38,0.08)', borderRadius:8, fontSize:12, color:'var(--danger)' }}>
              {err}
            </div>
          )}

          <button type="submit" style={{
            marginTop:20, width:'100%', padding:'12px', borderRadius:10, border:0, cursor:'pointer',
            background:'var(--ink)', color:'white', fontWeight:600, fontSize:14, fontFamily:'inherit',
          }}>Masuk →</button>

          <div style={{ marginTop:18, padding:12, background:'var(--surface-2)', borderRadius:8, border:'1px solid var(--border)', fontSize:11, color:'var(--ink-soft)', lineHeight:1.6 }}>
            <strong style={{ color:'var(--ink)' }}>Demo credentials:</strong><br/>
            Email: <code>admin@lapakurab.id</code><br/>
            Password: <code>admin123</code>
          </div>

          <button type="button" onClick={() => { window.location.hash = ''; }} style={{
            marginTop:14, width:'100%', padding:'8px', background:'none', border:0, cursor:'pointer',
            color:'var(--ink-soft)', fontSize:12, fontFamily:'inherit',
          }}>← Kembali ke toko</button>
        </form>

        <div style={{ textAlign:'center', marginTop:16, fontSize:11, color:'var(--ink-soft)' }}>
          🔒 Akses internal staff lapakurab.id
        </div>
      </div>
    </div>
  );
}

const inpStyle = {
  width:'100%', padding:'10px 12px', borderRadius:8,
  border:'1.5px solid var(--border)', background:'var(--surface)',
  fontSize:13, fontFamily:'inherit', color:'var(--ink)', outline:'none',
};

// ─── Layout shell ───────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id:'dashboard', label:'Dashboard', icon:'M3 12l2-2 4 4 8-8 2 2-10 10-6-6z' },
  { id:'products', label:'Produk', icon:'M20 7L12 3 4 7v10l8 4 8-4V7zM12 12L4 8m8 4l8-4m-8 4v9' },
  { id:'orders', label:'Pesanan', icon:'M9 11l3 3 8-8M3 12c0 5 4 9 9 9s9-4 9-9-4-9-9-9' },
  { id:'stock', label:'Stok akun', icon:'M21 8v13H3V8M1 3h22v5H1zM10 12h4' },
  { id:'users', label:'Member', icon:'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
  { id:'vouchers', label:'Voucher', icon:'M2 9V7a2 2 0 012-2h16a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 000-4zm7 0v6' },
  { id:'gateways', label:'Pembayaran', icon:'M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2zM1 10h22' },
  { id:'audit', label:'Activity log', icon:'M12 8v4l3 3M3 12a9 9 0 1018 0 9 9 0 00-18 0z' },
  { id:'settings', label:'Settings', icon:'M12 15a3 3 0 100-6 3 3 0 000 6zm7.4-3a7.5 7.5 0 00-.1-1.4l2-1.6-2-3.4-2.4.9a7.4 7.4 0 00-2.4-1.4L14 2h-4l-.5 2.6a7.4 7.4 0 00-2.4 1.4l-2.4-.9-2 3.4 2 1.6a7.5 7.5 0 000 2.8l-2 1.6 2 3.4 2.4-.9a7.4 7.4 0 002.4 1.4L10 22h4l.5-2.6a7.4 7.4 0 002.4-1.4l2.4.9 2-3.4-2-1.6c.07-.46.1-.93.1-1.4z' },
];

function AdminShell({ children }) {
  const { page, navigate, logout, resetData, notifications, updateNotifications, darkMode, toggleDark } = useAdmin();
  const current = NAV_ITEMS.find(n => n.id === page) || NAV_ITEMS[0];
  const [notifOpen, setNotifOpen] = useStateA(false);
  const unread = notifications.filter(n => !n.read).length;
  const theme = getAdminTheme(darkMode);

  useEffectA(() => {
    if (!notifOpen) return;
    const close = (e) => { if (!e.target.closest('[data-notif-bell]')) setNotifOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [notifOpen]);

  return (
    <div style={{ ...theme, minHeight:'100vh', background:'var(--bg)', display:'flex', fontFamily:'"DM Sans", system-ui, sans-serif', color:'var(--ink)' }}>
      {/* Sidebar */}
      <aside style={{
        width:240, flexShrink:0, background:'var(--surface)', borderRight:'1px solid var(--border)',
        display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh',
      }}>
        <div style={{ padding:'18px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:32, height:32, borderRadius:8,
            background:'linear-gradient(135deg, var(--primary), var(--lilac))',
            display:'flex', alignItems:'center', justifyContent:'center', color:'white',
            fontWeight:800, fontSize:14, fontFamily:'var(--font-display)',
          }}>L</div>
          <div>
            <div style={{ fontWeight:700, fontSize:14, fontFamily:'var(--font-display)', letterSpacing:'-0.01em' }}>lapakurab</div>
            <div style={{ fontSize:10, color:'var(--ink-soft)', fontWeight:500, letterSpacing:'0.04em', textTransform:'uppercase' }}>Admin Panel</div>
          </div>
        </div>

        <nav style={{ flex:1, padding:'12px 12px', overflowY:'auto' }}>
          <div style={{ fontSize:10, fontWeight:600, color:'var(--ink-soft)', letterSpacing:'0.06em', textTransform:'uppercase', padding:'8px 8px 6px' }}>Menu</div>
          {NAV_ITEMS.map(n => (
            <button key={n.id} onClick={() => navigate(n.id)} style={{
              width:'100%', display:'flex', alignItems:'center', gap:10,
              padding:'9px 10px', borderRadius:8, border:0, cursor:'pointer',
              background: page === n.id ? 'var(--surface-2)' : 'transparent',
              color: page === n.id ? 'var(--ink)' : 'var(--ink-soft)',
              fontWeight: page === n.id ? 600 : 500, fontSize:13, fontFamily:'inherit',
              textAlign:'left', marginBottom:2,
              borderLeft: page === n.id ? '2px solid var(--primary)' : '2px solid transparent',
              transition:'all 0.12s',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={n.icon}/>
              </svg>
              {n.label}
            </button>
          ))}
        </nav>

        <div style={{ padding:12, borderTop:'1px solid var(--border)' }}>
          <button onClick={resetData} style={{
            width:'100%', padding:'7px 10px', borderRadius:6, border:'1px solid var(--border)', cursor:'pointer',
            background:'var(--surface)', color:'var(--ink-soft)', fontSize:11, fontWeight:500, fontFamily:'inherit', marginBottom:6,
          }}>Reset data demo</button>
          <button onClick={logout} style={{
            width:'100%', padding:'7px 10px', borderRadius:6, border:'1px solid var(--border)', cursor:'pointer',
            background:'var(--surface)', color:'var(--ink)', fontSize:12, fontWeight:600, fontFamily:'inherit',
            display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>
        {/* Topbar */}
        <header style={{
          height:56, padding:'0 24px', borderBottom:'1px solid var(--border)',
          background:'var(--surface)', display:'flex', alignItems:'center', justifyContent:'space-between',
          position:'sticky', top:0, zIndex:10,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--ink-soft)' }}>
            <span>Admin</span>
            <span>›</span>
            <span style={{ color:'var(--ink)', fontWeight:600 }}>{current.label}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <a href="" onClick={(e)=>{e.preventDefault(); window.location.hash=''}} style={{
              fontSize:12, color:'var(--ink-soft)', textDecoration:'none', display:'flex', alignItems:'center', gap:5,
              padding:'5px 10px', borderRadius:6, border:'1px solid var(--border)',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Lihat toko
            </a>
            <button
              onClick={toggleDark}
              title={darkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
              aria-label={darkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
              style={{
                width:34, height:34, borderRadius:8,
                border:'1px solid var(--border)', background:'var(--surface)', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ink)',
                transition:'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e)=>{ e.currentTarget.style.background='var(--surface-2)'; }}
              onMouseLeave={(e)=>{ e.currentTarget.style.background='var(--surface)'; }}
            >
              {darkMode ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
            <div data-notif-bell style={{ position:'relative' }}>
              <button onClick={(e)=>{ e.stopPropagation(); setNotifOpen(o=>!o); }} style={{
                position:'relative', width:34, height:34, borderRadius:8,
                border:'1px solid var(--border)', background:'var(--surface)', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ink)',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"/></svg>
                {unread > 0 && (
                  <span style={{
                    position:'absolute', top:-4, right:-4, minWidth:16, height:16, padding:'0 4px',
                    borderRadius:8, background:'var(--danger)', color:'white',
                    fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center',
                  }}>{unread}</span>
                )}
              </button>
              {notifOpen && (
                <div style={{
                  position:'absolute', top:'calc(100% + 8px)', right:0, width:340, maxHeight:440,
                  background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10,
                  boxShadow:'0 16px 40px rgba(0,0,0,0.12)', overflow:'hidden', display:'flex', flexDirection:'column', zIndex:50,
                }}>
                  <div style={{ padding:'12px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ fontWeight:600, fontSize:13 }}>Notifikasi <span style={{ color:'var(--ink-soft)', fontWeight:500 }}>· {unread} baru</span></div>
                    <button onClick={()=>updateNotifications(list => list.map(n => ({...n, read:true})))} style={{
                      fontSize:11, color:'var(--primary)', background:'none', border:0, cursor:'pointer', fontFamily:'inherit', fontWeight:500,
                    }}>Tandai semua dibaca</button>
                  </div>
                  <div style={{ flex:1, overflowY:'auto' }}>
                    {notifications.length === 0 && (
                      <div style={{ padding:24, textAlign:'center', fontSize:12, color:'var(--ink-soft)' }}>Belum ada notifikasi.</div>
                    )}
                    {notifications.map(n => {
                      const palette = { order:'var(--primary)', success:'var(--success)', warn:'var(--warn)', danger:'var(--danger)' }[n.kind] || 'var(--ink-soft)';
                      return (
                        <div key={n.id} onClick={()=>updateNotifications(list => list.map(x => x.id === n.id ? {...x, read:true} : x))} style={{
                          padding:'11px 14px', borderBottom:'1px solid var(--border)',
                          background: n.read ? 'transparent' : 'rgba(91,141,239,0.04)',
                          display:'flex', gap:10, cursor:'pointer',
                        }}>
                          <div style={{ width:6, alignSelf:'stretch', borderRadius:3, background: palette, flexShrink:0 }} />
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:12, fontWeight: n.read ? 500 : 600, marginBottom:2 }}>{n.title}</div>
                            <div style={{ fontSize:11, color:'var(--ink-soft)', marginBottom:3 }}>{n.body}</div>
                            <div style={{ fontSize:10, color:'var(--ink-soft)' }}>{relTime(n.at)}</div>
                          </div>
                          {!n.read && <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--primary)', marginTop:5, flexShrink:0 }} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div style={{ width:1, height:20, background:'var(--border)' }} />
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--primary)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 }}>A</div>
              <div style={{ fontSize:12 }}>
                <div style={{ fontWeight:600 }}>Admin</div>
                <div style={{ color:'var(--ink-soft)', fontSize:10 }}>admin@lapakurab.id</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding:'28px 32px', flex:1, overflowY:'auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}

// ─── Reusable bits ──────────────────────────────────────────────────────────
function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:24, gap:16 }}>
      <div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:600, letterSpacing:'-0.02em', margin:'0 0 4px' }}>{title}</h1>
        {subtitle && <p style={{ color:'var(--ink-soft)', fontSize:13, margin:0 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function StatCard({ label, value, delta, accent }) {
  const pos = delta && delta.startsWith('+');
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:16 }}>
      <div style={{ fontSize:11, fontWeight:600, color:'var(--ink-soft)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:8 }}>{label}</div>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:8 }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:600, letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums' }}>{value}</div>
        {delta && (
          <div style={{
            fontSize:11, fontWeight:600,
            color: pos ? 'var(--success)' : 'var(--danger)',
            background: pos ? 'rgba(15,139,92,0.08)' : 'rgba(220,38,38,0.08)',
            padding:'2px 7px', borderRadius:5,
          }}>{delta}</div>
        )}
      </div>
      {accent && <div style={{ marginTop:10, height:3, borderRadius:2, background: accent, opacity:0.7 }} />}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    paid:        { bg:'rgba(91,141,239,0.1)', color:'#3567C8', label:'Dibayar' },
    pending:     { bg:'rgba(217,119,6,0.1)', color:'#B45309', label:'Menunggu' },
    delivered:   { bg:'rgba(15,139,92,0.1)', color:'#0F8B5C', label:'Terkirim' },
    refunded:    { bg:'rgba(122,132,153,0.12)', color:'#7A8499', label:'Refund' },
    available:   { bg:'rgba(15,139,92,0.1)', color:'#0F8B5C', label:'Tersedia' },
    sold:        { bg:'rgba(122,132,153,0.12)', color:'#7A8499', label:'Terjual' },
    active:      { bg:'rgba(15,139,92,0.1)', color:'#0F8B5C', label:'Aktif' },
    banned:      { bg:'rgba(220,38,38,0.08)', color:'#DC2626', label:'Banned' },
    inactive:    { bg:'rgba(122,132,153,0.12)', color:'#7A8499', label:'Nonaktif' },
  };
  const s = map[status] || { bg:'var(--surface-2)', color:'var(--ink-soft)', label: status };
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'2px 8px', borderRadius:5, fontSize:11, fontWeight:600,
      background: s.bg, color: s.color,
    }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background: s.color }} />
      {s.label}
    </span>
  );
}

function TableShell({ columns, rows, ids=null, selection=null, empty='Tidak ada data.', emptyIcon='📭', emptyDesc='', emptyCta=null, loading=false, skeletonRows=4 }) {
  const hasSel = !!selection;
  const checkboxStyle = {
    width:14, height:14, cursor:'pointer', accentColor:'var(--primary, #5B7CFA)',
  };
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden' }}>
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:720 }}>
          <thead>
            <tr style={{ background:'var(--surface-2)', borderBottom:'1px solid var(--border)' }}>
              {hasSel && (
                <th style={{ padding:'11px 12px 11px 16px', width:36, textAlign:'left' }}>
                  <input type="checkbox" style={checkboxStyle}
                    checked={selection.allSelected}
                    ref={el => { if (el) el.indeterminate = !selection.allSelected && selection.someSelected; }}
                    onChange={selection.toggleAll} />
                </th>
              )}
              {columns.map((c,i) => (
                <th key={i} style={{ padding:'11px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--ink-soft)', letterSpacing:'0.04em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({length:skeletonRows}).map((_,i) => (
              <tr key={'sk'+i} style={{ borderBottom: i < skeletonRows - 1 ? '1px solid var(--border)' : 0 }}>
                {hasSel && <td style={{ padding:'14px 12px 14px 16px' }}><Skeleton h={14} w={14} /></td>}
                {columns.map((_,j) => (
                  <td key={j} style={{ padding:'14px 16px' }}>
                    <Skeleton h={12} w={j===0 ? '70%' : '50%'} />
                  </td>
                ))}
              </tr>
            )) : rows.length === 0 ? (
              <tr><td colSpan={columns.length + (hasSel ? 1 : 0)} style={{ padding:'8px' }}>
                <EmptyState icon={emptyIcon} title={empty} desc={emptyDesc} cta={emptyCta} compact />
              </td></tr>
            ) : rows.map((row,i) => {
              const id = ids ? ids[i] : null;
              const isSel = hasSel && id != null && selection.has(id);
              return (
                <tr key={i} style={{
                  borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 0,
                  transition:'background 120ms ease',
                  background: isSel ? 'rgba(91,124,250,0.06)' : 'transparent',
                }}
                  onMouseEnter={(e)=>{ if (!isSel) e.currentTarget.style.background='var(--surface-2)'; }}
                  onMouseLeave={(e)=>{ if (!isSel) e.currentTarget.style.background='transparent'; }}>
                  {hasSel && (
                    <td style={{ padding:'12px 12px 12px 16px' }}>
                      <input type="checkbox" style={checkboxStyle}
                        checked={isSel} onChange={()=>selection.toggle(id)} />
                    </td>
                  )}
                  {row.map((cell,j) => (
                    <td key={j} style={{ padding:'12px 16px', fontSize:13, verticalAlign:'middle' }}>{cell}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── BulkBar — sticky toolbar that appears when items are selected ──────────
function BulkBar({ selection, actions=[] }) {
  if (!selection || selection.count === 0) return null;
  return (
    <div style={{
      position:'sticky', top:0, zIndex:50, marginBottom:12,
      padding:'10px 14px', borderRadius:10,
      background:'var(--ink, #1a1a1a)', color:'#fff',
      display:'flex', alignItems:'center', gap:14,
      animation:'lkFadeIn 160ms ease-out',
      boxShadow:'0 6px 18px rgba(0,0,0,0.18)',
    }}>
      <span style={{ fontSize:13, fontWeight:600 }}>{selection.count} dipilih</span>
      <button onClick={selection.clear} style={{
        background:'rgba(255,255,255,0.14)', border:0, color:'#fff',
        padding:'5px 10px', borderRadius:6, fontSize:12, cursor:'pointer', fontFamily:'inherit',
      }}>Batal</button>
      <div style={{ flex:1 }} />
      {actions.map((a, i) => (
        <button key={i} onClick={()=>{ a.onRun(selection.selectedItems); selection.clear(); }} style={{
          background: a.danger ? '#DC2626' : 'rgba(255,255,255,0.18)',
          border:0, color:'#fff', padding:'6px 12px', borderRadius:6,
          fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
        }}>{a.label}</button>
      ))}
    </div>
  );
}

// ─── Dashboard page ─────────────────────────────────────────────────────────
function DashboardPage() {
  const { orders, products, users, stock } = useAdmin();
  const revenue = orders.filter(o => o.status === 'paid' || o.status === 'delivered').reduce((s,o)=>s+o.total, 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const lowStock = products.filter(p => p.stock <= 5 && p.active).length;
  const availStock = stock.filter(s => s.status === 'available').length;

  // Mock revenue chart 14 days
  const chart = [12,18,15,22,28,24,32,38,35,42,48,44,52,58];
  const maxC = Math.max(...chart);

  // Top products by order count
  const productSales = {};
  orders.forEach(o => { productSales[o.product] = (productSales[o.product]||0) + 1; });
  const topProducts = Object.entries(productSales).sort((a,b)=>b[1]-a[1]).slice(0,5);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Ringkasan performa toko 14 hari terakhir." />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:24 }}>
        <StatCard label="Pendapatan" value={fmtIDRA(revenue)} delta="+18.4%" accent="var(--primary)" />
        <StatCard label="Total Pesanan" value={orders.length} delta="+12.0%" accent="var(--mint)" />
        <StatCard label="Member" value={users.length} delta="+5.2%" accent="var(--lilac)" />
        <StatCard label="Stok tersedia" value={availStock} delta={lowStock > 0 ? `-${lowStock} low` : '+0'} accent="var(--peach)" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14, marginBottom:24 }}>
        {/* Revenue chart */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <div style={{ fontWeight:600, fontSize:14 }}>Pendapatan harian</div>
              <div style={{ fontSize:11, color:'var(--ink-soft)' }}>Per hari, 14 hari terakhir</div>
            </div>
            <select style={{ ...inpStyle, width:'auto', padding:'5px 10px', fontSize:11 }}>
              <option>14 hari</option><option>30 hari</option><option>90 hari</option>
            </select>
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:140, padding:'0 4px' }}>
            {chart.map((v,i) => (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <div style={{
                  width:'100%', height: `${(v/maxC)*100}%`,
                  background:'linear-gradient(180deg, var(--primary), rgba(91,141,239,0.4))',
                  borderRadius:'4px 4px 0 0', minHeight:4,
                }} />
                <div style={{ fontSize:9, color:'var(--ink-soft)', fontVariantNumeric:'tabular-nums' }}>{i+1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:20 }}>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:14 }}>Produk terlaris</div>
          {topProducts.length === 0 && <div style={{ fontSize:12, color:'var(--ink-soft)' }}>Belum ada penjualan.</div>}
          {topProducts.map(([name, count], i) => (
            <div key={name} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom: i < topProducts.length - 1 ? '1px solid var(--border)' : 0 }}>
              <div style={{ width:22, height:22, borderRadius:6, background:'var(--surface-2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'var(--ink-soft)' }}>{i+1}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{name}</div>
              </div>
              <div style={{ fontSize:12, fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Notices */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        <NoticeCard icon="◐" color="var(--warn)" title={`${pendingCount} pesanan menunggu`} desc="Cek tab Pesanan untuk konfirmasi." />
        <NoticeCard icon="◇" color="var(--danger)" title={`${lowStock} produk stok menipis`} desc="Tambah stok akun atau nonaktifkan." />
        <NoticeCard icon="✓" color="var(--success)" title="Sistem normal" desc="Semua gateway pembayaran aktif." />
      </div>
    </div>
  );
}

function NoticeCard({ icon, color, title, desc }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:14, display:'flex', gap:12 }}>
      <div style={{ width:32, height:32, borderRadius:8, background: color, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, flexShrink:0 }}>{icon}</div>
      <div>
        <div style={{ fontWeight:600, fontSize:13, marginBottom:2 }}>{title}</div>
        <div style={{ fontSize:11, color:'var(--ink-soft)' }}>{desc}</div>
      </div>
    </div>
  );
}

// ─── Products page ──────────────────────────────────────────────────────────
function ProductsPage() {
  const { products, updateProducts, navigate, logAudit } = useAdmin();
  const [editing, setEditing] = useStateA(null); // null | 'new' | productObject
  const [search, setSearch] = useStateA('');
  const toast = (window.useToast ? window.useToast() : (window.toast || {}));
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const sel = useSelection(filtered);

  const bulkActions = [
    { label:'Aktifkan', onRun:(items)=>{
      updateProducts(list => list.map(p => items.find(x=>x.id===p.id) ? {...p, active:true} : p));
      toast.success && toast.success(`${items.length} produk diaktifkan`);
    }},
    { label:'Nonaktifkan', onRun:(items)=>{
      updateProducts(list => list.map(p => items.find(x=>x.id===p.id) ? {...p, active:false} : p));
      toast.warn && toast.warn(`${items.length} produk dinonaktifkan`);
    }},
    { label:'Hapus', danger:true, onRun:(items)=>{
      let snapshot = null;
      const ids = new Set(items.map(x=>x.id));
      updateProducts(list => { snapshot = list; return list.filter(p => !ids.has(p.id)); });
      toast.undo && toast.undo(`${items.length} produk dihapus`, () => {
        if (snapshot) updateProducts(() => snapshot);
        toast.success && toast.success('Dipulihkan');
      });
    }},
  ];

  const onSave = (form) => {
    const isUpdate = !!form.id;
    if (isUpdate) {
      updateProducts(list => list.map(p => p.id === form.id ? form : p));
      logAudit('product.update', form.name, 'Produk diperbarui');
      toast.success && toast.success('Tersimpan', 'Produk "' + form.name + '" berhasil diperbarui.');
    } else {
      const newP = { ...form, id:'p' + Date.now(), reviews: 0, rating: 5.0 };
      updateProducts(list => [newP, ...list]);
      logAudit('product.create', form.name, 'Produk baru ditambahkan');
      toast.success && toast.success('Produk ditambahkan', '"' + form.name + '" sekarang aktif di toko.');
    }
    setEditing(null);
  };

  const onDelete = (p) => {
    // Optimistic delete + Undo snackbar (no native confirm)
    let snapshot = null;
    updateProducts(list => { snapshot = list; return list.filter(x => x.id !== p.id); });
    logAudit('product.delete', p.name, 'Produk dihapus');
    toast.undo && toast.undo('Produk "' + p.name + '" dihapus', () => {
      if (snapshot) updateProducts(() => snapshot);
      logAudit('product.restore', p.name, 'Pembatalan hapus produk');
      toast.success && toast.success('Dipulihkan', 'Produk berhasil dikembalikan.');
    }, { desc: 'Klik Undo untuk membatalkan dalam 6 detik.' });
  };

  const onToggle = (p) => {
    updateProducts(list => list.map(x => x.id === p.id ? {...x, active:!x.active} : x));
    logAudit('product.toggle', p.name, p.active ? 'Dinonaktifkan' : 'Diaktifkan');
    toast.info && toast.info(p.active ? 'Produk dinonaktifkan' : 'Produk diaktifkan', '"' + p.name + '" sekarang ' + (p.active ? 'tidak terlihat' : 'terlihat') + ' di toko.');
  };

  return (
    <div>
      <PageHeader
        title="Produk"
        subtitle={`${products.length} produk · ${products.filter(p=>p.active).length} aktif di toko`}
        action={
          <button data-cmd="add-product" onClick={() => setEditing('new')} style={primaryBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tambah produk
          </button>
        }
      />

      <BulkBar selection={sel} actions={bulkActions} />

      <div style={{ display:'flex', gap:10, marginBottom:14 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari nama produk..." style={{ ...inpStyle, maxWidth:300 }} />
      </div>

      <TableShell
        columns={['Produk','Kategori','Harga','Stok','Status','']}
        ids={filtered.map(p=>p.id)}
        selection={sel}
        rows={filtered.map(p => [
          <div key="n" onClick={()=>navigate('product-detail', p.id)} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
            <div style={{ width:36, height:36, borderRadius:8, background:`linear-gradient(135deg, oklch(0.45 0.18 ${p.hue}), oklch(0.32 0.14 ${p.hue}))`, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontFamily:'var(--font-display)', fontSize:14 }}>{p.name[0]}</div>
            <div>
              <div style={{ fontWeight:600, fontSize:13 }}>{p.name}</div>
              <div style={{ fontSize:11, color:'var(--ink-soft)' }}>{p.tagline}</div>
            </div>
          </div>,
          <span key="c" style={{ fontSize:11, fontWeight:600, color:'var(--ink-soft)', textTransform:'uppercase', letterSpacing:'0.04em' }}>{p.cat === 'vpn' ? 'VPN' : 'Streaming'}</span>,
          <div key="p">
            <div style={{ fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{fmtIDRA(p.priceIDR)}</div>
            <div style={{ fontSize:11, color:'var(--ink-soft)', textDecoration:'line-through' }}>{fmtIDRA(p.oldIDR)}</div>
          </div>,
          <span key="s" style={{ fontVariantNumeric:'tabular-nums', fontWeight:600, color: p.stock <= 5 ? 'var(--danger)' : 'var(--ink)' }}>{p.stock}</span>,
          <StatusPill key="st" status={p.active ? 'active' : 'inactive'} />,
          <div key="a" style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
            <button onClick={()=>navigate('product-detail', p.id)} style={miniBtn}>Detail</button>
            <button onClick={()=>onToggle(p)} style={miniBtn}>{p.active ? 'Off' : 'On'}</button>
            <button onClick={()=>setEditing(p)} style={miniBtn}>Edit</button>
            <button onClick={()=>onDelete(p)} style={{...miniBtn, color:'var(--danger)', borderColor:'rgba(220,38,38,0.3)'}}>Hapus</button>
          </div>
        ])}
        empty="Belum ada produk"
        emptyIcon="📦"
        emptyDesc={search ? `Tidak ada produk yang cocok dengan "${search}".` : "Tambahkan produk pertama untuk mulai jualan."}
        emptyCta={!search && <button onClick={()=>setEditing('new')} style={primaryBtn}>+ Tambah produk</button>}
      />

      {editing && <ProductFormModal product={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSave={onSave} />}
    </div>
  );
}

function ProductFormModal({ product, onClose, onSave }) {
  useModalKey(true, onClose);
  const initial = product || {
    name:'', cat:'streaming', tagline:'', priceIDR:0, oldIDR:0, stock:0,
    durations:['1 Bulan'], hue:340, emoji:'▶', active:true,
  };
  const rules = {
    name: (v) => !v || !v.trim() ? 'Nama produk wajib diisi' : v.length < 3 ? 'Minimal 3 karakter' : null,
    tagline: (v) => !v || !v.trim() ? 'Tagline wajib diisi' : null,
    priceIDR: (v) => !v || v <= 0 ? 'Harga harus lebih dari 0' : null,
    oldIDR: (v, all) => v && v > 0 && v <= all.priceIDR ? 'Harga coret harus lebih besar dari harga jual' : null,
    stock: (v) => v < 0 ? 'Stok tidak boleh negatif' : null,
    hue: (v) => v < 0 || v > 360 ? 'Hue harus 0–360' : null,
    durations: (v) => !v || v.length === 0 ? 'Minimal satu durasi' : null,
  };
  const { values: form, errors, touched, setField, blur, validate, touchAll } = useFormValidation(initial, rules);
  const upd = (k, v) => setField(k, v);
  const toast = (window.useToast ? window.useToast() : null);

  const submit = () => {
    if (validate()) {
      onSave(form);
    } else {
      touchAll();
      toast?.error?.('Periksa kembali isian yang ditandai merah.');
    }
  };

  return (
    <div style={modalBg} onClick={onClose}>
      <div style={useModalCard()} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, letterSpacing:'-0.01em' }}>{product ? 'Edit produk' : 'Tambah produk baru'}</div>
            <div style={{ fontSize:12, color:'var(--ink-soft)' }}>Lengkapi detail produk yang akan dijual.</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:0, fontSize:20, color:'var(--ink-soft)', cursor:'pointer', padding:4 }}>✕</button>
        </div>

        <div style={{ padding:22, maxHeight:'70vh', overflowY:'auto', display:'flex', flexDirection:'column', gap:14 }}>
          <Field label="Nama produk" required error={touched.name && errors.name}>
            <input value={form.name} onChange={e=>upd('name', e.target.value)} onBlur={()=>blur('name')} style={inpStyle} placeholder="cth. Streamflix Premium" />
          </Field>
          <Field label="Tagline" required error={touched.tagline && errors.tagline}>
            <input value={form.tagline} onChange={e=>upd('tagline', e.target.value)} onBlur={()=>blur('tagline')} style={inpStyle} placeholder="cth. 4K UHD · 4 Profil" />
          </Field>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="Kategori">
              <select value={form.cat} onChange={e=>upd('cat', e.target.value)} style={inpStyle}>
                <option value="streaming">Streaming</option>
                <option value="vpn">VPN</option>
              </select>
            </Field>
            <Field label="Stok" error={touched.stock && errors.stock}>
              <input type="number" min="0" value={form.stock} onChange={e=>upd('stock', +e.target.value)} onBlur={()=>blur('stock')} style={inpStyle} />
            </Field>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="Harga jual (IDR)" required error={touched.priceIDR && errors.priceIDR}>
              <input type="number" min="0" value={form.priceIDR} onChange={e=>upd('priceIDR', +e.target.value)} onBlur={()=>blur('priceIDR')} style={inpStyle} />
            </Field>
            <Field label="Harga coret (IDR)" error={touched.oldIDR && errors.oldIDR} hint={!touched.oldIDR && 'Untuk menampilkan diskon'}>
              <input type="number" min="0" value={form.oldIDR} onChange={e=>upd('oldIDR', +e.target.value)} onBlur={()=>blur('oldIDR')} style={inpStyle} />
            </Field>
          </div>
          <Field label="Durasi tersedia (pisahkan koma)" error={touched.durations && errors.durations}>
            <input value={form.durations.join(', ')} onChange={e=>upd('durations', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} onBlur={()=>blur('durations')} style={inpStyle} placeholder="1 Bulan, 3 Bulan, 1 Tahun" />
          </Field>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="Warna brand (hue 0-360)" error={touched.hue && errors.hue}>
              <input type="number" min="0" max="360" value={form.hue} onChange={e=>upd('hue', +e.target.value)} onBlur={()=>blur('hue')} style={inpStyle} />
            </Field>
            <Field label="Glyph">
              <input value={form.emoji} onChange={e=>upd('emoji', e.target.value)} style={inpStyle} maxLength={2} />
            </Field>
          </div>
          <Field label="Status di toko">
            <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
              <input type="checkbox" checked={form.active} onChange={e=>upd('active', e.target.checked)} />
              Aktif (tampil di katalog publik)
            </label>
          </Field>
        </div>

        <div style={{ padding:'14px 22px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:8, background:'var(--surface-2)' }}>
          <button onClick={onClose} style={secondaryBtn}>Batal</button>
          <button onClick={submit} style={primaryBtn}>
            {product ? 'Simpan perubahan' : 'Tambah produk'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormRow({ label, required, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--ink)', marginBottom:5 }}>
        {label} {required && <span style={{ color:'var(--danger)' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Orders page ────────────────────────────────────────────────────────────
function OrdersPage() {
  const { orders, updateOrders, logAudit, pushNotif } = useAdmin();
  const [filter, setFilter] = usePersistedFilter('orders.filter', 'all');
  const [search, setSearch] = useStateA('');
  const [viewing, setViewing] = useStateA(null);

  let filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  if (search) filtered = filtered.filter(o => (o.id+o.customer+o.email+o.product).toLowerCase().includes(search.toLowerCase()));

  const counts = {
    all: orders.length,
    pending: orders.filter(o=>o.status==='pending').length,
    paid: orders.filter(o=>o.status==='paid').length,
    delivered: orders.filter(o=>o.status==='delivered').length,
    refunded: orders.filter(o=>o.status==='refunded').length,
  };

  const setStatus = (id, status) => {
    updateOrders(list => list.map(o => o.id === id ? {...o, status} : o));
    logAudit('order.' + status, '#'+id, `Status diubah ke ${status}`);
    if (status === 'refunded') pushNotif('danger', `Refund diproses`, `#${id} dikembalikan ke pelanggan.`);
  };

  const tOrders = window.useToast ? window.useToast() : (window.toast || {});
  const refundOrder = (id) => {
    let snapshot = null;
    updateOrders(list => { snapshot = list; return list.map(o => o.id === id ? {...o, status:'refunded'} : o); });
    logAudit('order.refunded', '#'+id, 'Status diubah ke refunded');
    pushNotif('danger', 'Refund diproses', `#${id} dikembalikan ke pelanggan.`);
    tOrders.undo && tOrders.undo('Refund #' + id, () => {
      if (snapshot) updateOrders(() => snapshot);
      tOrders.success && tOrders.success('Refund dibatalkan');
    });
  };

  const orderSel = useSelection(filtered);
  const orderBulkActions = [
    { label:'Refund', danger:true, onRun:(items)=>{
      let snapshot = null;
      const ids = new Set(items.map(x=>x.id));
      updateOrders(list => { snapshot = list; return list.map(o => ids.has(o.id) ? {...o, status:'refunded'} : o); });
      tOrders.undo && tOrders.undo(`${items.length} pesanan di-refund`, () => { if (snapshot) updateOrders(()=>snapshot); });
    }},
    { label:'Export CSV', onRun:(items)=>{
      const rows = [['Order ID','Tanggal','Pelanggan','Email','Produk','Total','Status']];
      items.forEach(o => rows.push([o.id, o.date, o.customer, o.email, o.product, o.total, o.status]));
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], {type:'text/csv'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'orders-selected.csv'; a.click();
      tOrders.success && tOrders.success(`${items.length} pesanan di-export`);
    }},
  ];

  const exportCSV = () => {
    const rows = [['Order ID','Tanggal','Pelanggan','Email','Produk','Durasi','Total','Status','Pembayaran']];
    filtered.forEach(o => rows.push([o.id, o.date, o.customer, o.email, o.product, o.duration, o.total, o.status, o.payment]));
    downloadCSV('orders-'+new Date().toISOString().slice(0,10)+'.csv', rows);
    logAudit('orders.export', `${filtered.length} rows`, 'Export CSV pesanan');
  };

  return (
    <div>
      <PageHeader
        title="Pesanan"
        subtitle="Auto-delivery aktif · sistem otomatis kirim kredensial setelah pembayaran terverifikasi."
        action={<button onClick={exportCSV} style={secondaryBtn}>↓ Export CSV</button>}
      />

      <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        {[
          {id:'all', l:'Semua'},
          {id:'pending', l:'Menunggu bayar'},
          {id:'paid', l:'Dibayar'},
          {id:'delivered', l:'Terkirim'},
          {id:'refunded', l:'Refund'},
        ].map(t => (
          <button key={t.id} onClick={()=>setFilter(t.id)} style={{
            padding:'7px 12px', borderRadius:6, border:'1px solid var(--border)', cursor:'pointer',
            background: filter === t.id ? 'var(--ink)' : 'var(--surface)',
            color: filter === t.id ? 'white' : 'var(--ink)',
            fontSize:12, fontWeight:500, fontFamily:'inherit',
          }}>{t.l} <span style={{ opacity:0.6, marginLeft:4 }}>{counts[t.id]}</span></button>
        ))}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari order ID, customer, atau produk..." style={{ ...inpStyle, marginLeft:'auto', maxWidth:280 }} />
      </div>

      <div style={{ marginBottom:12, padding:'10px 14px', background:'rgba(15,139,92,0.06)', borderRadius:8, border:'1px solid rgba(15,139,92,0.2)', display:'flex', alignItems:'center', gap:10, fontSize:12 }}>
        <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--success)', boxShadow:'0 0 0 4px rgba(15,139,92,0.15)' }} />
        <span style={{ color:'var(--ink)' }}><strong>Auto-delivery aktif.</strong> Setelah pembayaran terverifikasi, sistem otomatis ambil kredensial dari pool stok dan kirim ke pembeli.</span>
      </div>

      <BulkBar selection={orderSel} actions={orderBulkActions} />

      <TableShell
        columns={['Order ID','Tanggal','Pelanggan','Produk','Total','Status','']}
        ids={filtered.map(o=>o.id)}
        selection={orderSel}
        rows={filtered.map(o => [
          <span key="i" style={{ fontFamily:'ui-monospace,monospace', fontSize:12, fontWeight:600 }}>#{o.id}</span>,
          <span key="d" style={{ fontSize:12, color:'var(--ink-soft)' }}>{adminFmtDate(o.date)}</span>,
          <div key="c">
            <div style={{ fontWeight:500, fontSize:13 }}>{o.customer}</div>
            <div style={{ fontSize:11, color:'var(--ink-soft)' }}>{o.email}</div>
          </div>,
          <div key="p">
            <div style={{ fontSize:13 }}>{o.product}</div>
            <div style={{ fontSize:11, color:'var(--ink-soft)' }}>{o.duration} · {o.payment}</div>
          </div>,
          <span key="t" style={{ fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{fmtIDRA(o.total)}</span>,
          <StatusPill key="s" status={o.status} />,
          <div key="a" style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
            <button onClick={()=>setViewing(o)} style={miniBtn}>Detail</button>
            {(o.status === 'paid' || o.status === 'delivered') && <button onClick={()=>refundOrder(o.id)} style={{...miniBtn, color:'var(--danger)', borderColor:'rgba(220,38,38,0.3)'}}>Refund</button>}
          </div>
        ])}
        empty="Belum ada pesanan"
        emptyIcon="🧾"
        emptyDesc={search ? 'Tidak ada pesanan yang cocok dengan pencarian.' : 'Pesanan masuk akan muncul di sini secara real-time.'}
      />

      {viewing && <OrderDetailModal order={viewing} onClose={()=>setViewing(null)} setStatus={setStatus} />}
    </div>
  );
}

function OrderDetailModal({ order, onClose, setStatus }) {
  return (
    <div style={modalBg} onClick={onClose}>
      <div style={{...useModalCard(), maxWidth:520}} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:'ui-monospace,monospace', fontWeight:700, fontSize:15 }}>#{order.id}</div>
            <div style={{ fontSize:11, color:'var(--ink-soft)' }}>{adminFmtDate(order.date)}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:0, fontSize:20, color:'var(--ink-soft)', cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ padding:22 }}>
          <DetailRow label="Status"><StatusPill status={order.status} /></DetailRow>
          <DetailRow label="Pelanggan">{order.customer}<div style={{ fontSize:11, color:'var(--ink-soft)' }}>{order.email}</div></DetailRow>
          <DetailRow label="Produk">{order.product}<div style={{ fontSize:11, color:'var(--ink-soft)' }}>{order.duration}</div></DetailRow>
          <DetailRow label="Pembayaran">{order.payment}</DetailRow>
          <DetailRow label="Total"><span style={{ fontWeight:700, fontFamily:'var(--font-display)', fontSize:18, fontVariantNumeric:'tabular-nums' }}>{fmtIDRA(order.total)}</span></DetailRow>

          {(order.status === 'paid' || order.status === 'delivered') && (
            <div style={{ marginTop:16, padding:14, background:'var(--surface-2)', borderRadius:8, border:'1px solid var(--border)' }}>
              <div style={{ fontWeight:600, fontSize:12, marginBottom:8 }}>Kredensial yang dikirim ke pembeli</div>
              <div style={{ fontFamily:'ui-monospace,monospace', fontSize:12 }}>
                <div>Email: <span style={{ fontWeight:500 }}>delivered+{order.id.slice(-3)}@lapakurab.id</span></div>
                <div>Pass: <span style={{ fontWeight:500 }}>••••••••• <button style={{...miniBtn, padding:'1px 6px', fontSize:10}}>Tampil</button></span></div>
              </div>
            </div>
          )}
        </div>
        <div style={{ padding:'14px 22px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:8, background:'var(--surface-2)' }}>
          {(order.status === 'paid' || order.status === 'delivered') && (
            <button onClick={()=>{ setStatus(order.id,'refunded'); onClose(); (window.toast||{}).success && window.toast.success('Refund diproses', '#'+order.id+' dikembalikan ke pelanggan.'); }} style={{...secondaryBtn, color:'var(--danger)', borderColor:'rgba(220,38,38,0.3)'}}>Refund</button>
          )}
          <button onClick={onClose} style={primaryBtn}>Tutup</button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, children }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:13 }}>
      <span style={{ color:'var(--ink-soft)' }}>{label}</span>
      <div style={{ textAlign:'right' }}>{children}</div>
    </div>
  );
}

// ─── Stock page ─────────────────────────────────────────────────────────────
function StockPage() {
  const { stock, products, updateStock } = useAdmin();
  const [filter, setFilter] = usePersistedFilter('stock.filter', 'all');
  const [adding, setAdding] = useStateA(false);

  const filtered = filter === 'all' ? stock : stock.filter(s => s.productId === filter);

  const addStock = (form) => {
    const newItems = form.lines.split('\n').filter(Boolean).map((l,i) => {
      const [email, password] = l.split('|').map(s=>s.trim());
      return { id:'s'+Date.now()+i, productId: form.productId, email, password, status:'available', addedAt: new Date().toISOString().slice(0,10) };
    });
    updateStock(list => [...newItems, ...list]);
    setAdding(false);
  };

  const t = window.useToast ? window.useToast() : (window.toast || {});
  const removeItem = (id) => {
    let snapshot = null;
    updateStock(list => { snapshot = list; return list.filter(s => s.id !== id); });
    t.undo && t.undo('Stok akun dihapus', () => {
      if (snapshot) updateStock(() => snapshot);
      t.success && t.success('Dipulihkan');
    });
  };

  const stockSel = useSelection(filtered);
  const stockBulkActions = [
    { label:'Hapus', danger:true, onRun:(items)=>{
      let snapshot = null;
      const ids = new Set(items.map(x=>x.id));
      updateStock(list => { snapshot = list; return list.filter(s => !ids.has(s.id)); });
      t.undo && t.undo(`${items.length} stok dihapus`, () => { if (snapshot) updateStock(()=>snapshot); });
    }},
  ];

  return (
    <div>
      <PageHeader
        title="Stok akun"
        subtitle={`Pool kredensial siap kirim · ${stock.filter(s=>s.status==='available').length} tersedia, ${stock.filter(s=>s.status==='sold').length} terjual`}
        action={<button data-cmd="add-stock" onClick={()=>setAdding(true)} style={primaryBtn}>+ Tambah stok</button>}
      />

      <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
        <button onClick={()=>setFilter('all')} style={chipStyle(filter==='all')}>Semua produk</button>
        {products.filter(p=>p.active).map(p => (
          <button key={p.id} onClick={()=>setFilter(p.id)} style={chipStyle(filter===p.id)}>{p.name}</button>
        ))}
      </div>

      <BulkBar selection={stockSel} actions={stockBulkActions} />

      <TableShell
        columns={['Produk','Email','Password','Status','Ditambahkan','']}
        ids={filtered.map(s=>s.id)}
        selection={stockSel}
        rows={filtered.map(s => {
          const prod = products.find(p => p.id === s.productId);
          return [
            <span key="p" style={{ fontWeight:500, fontSize:13 }}>{prod?.name || '—'}</span>,
            <CredentialReveal key="e" value={s.email} masked={false} />,
            <CredentialReveal key="pw" value={s.password} masked={true} />,
            <StatusPill key="s" status={s.status} />,
            <span key="a" style={{ fontSize:12, color:'var(--ink-soft)' }}>{adminFmtDate(s.addedAt)}</span>,
            <button key="del" onClick={()=>removeItem(s.id)} style={{...miniBtn, color:'var(--danger)', borderColor:'rgba(220,38,38,0.3)'}}>Hapus</button>
          ];
        })}
        empty="Belum ada stok kredensial"
        emptyIcon="🔐"
        emptyDesc="Tambahkan email + password akun yang siap dikirim ke pelanggan saat checkout."
        emptyCta={<button onClick={()=>setAdding(true)} style={primaryBtn}>+ Tambah stok</button>}
      />

      {adding && <AddStockModal products={products} onClose={()=>setAdding(false)} onSave={addStock} />}
    </div>
  );
}

function AddStockModal({ products, onClose, onSave }) {
  useModalKey(true, onClose);
  const [productId, setProductId] = useStateA(products[0]?.id || '');
  const [lines, setLines] = useStateA('');
  const [touched, setTouched] = useStateA(false);
  const linesValid = lines.split('\n').filter(l => l.trim() && l.includes('|')).length;
  const linesError = touched && !lines.trim() ? 'Minimal satu baris akun' : touched && linesValid === 0 ? 'Format harus: email | password (satu per baris)' : null;
  const toast = (window.useToast ? window.useToast() : null);

  const submit = () => {
    setTouched(true);
    if (!productId || !lines.trim() || linesValid === 0) {
      toast?.error?.('Periksa kembali isian.');
      return;
    }
    onSave({ productId, lines });
  };

  return (
    <div style={modalBg} onClick={onClose}>
      <div style={useModalCard()} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18 }}>Tambah stok akun</div>
            <div style={{ fontSize:12, color:'var(--ink-soft)' }}>Bulk import kredensial — satu akun per baris.</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:0, fontSize:20, color:'var(--ink-soft)', cursor:'pointer', padding:4 }}>✕</button>
        </div>
        <div style={{ padding:22, display:'flex', flexDirection:'column', gap:14 }}>
          <Field label="Produk" required>
            <select value={productId} onChange={e=>setProductId(e.target.value)} style={inpStyle}>
              {products.filter(p=>p.active).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Daftar akun" required hint="Format: email | password — satu akun per baris" error={linesError}>
            <textarea value={lines} onChange={e=>setLines(e.target.value)} onBlur={()=>setTouched(true)} rows={8}
              placeholder={"user1@mail.id | Pass#123\nuser2@mail.id | Pass#456"}
              style={{ ...inpStyle, fontFamily:'ui-monospace,monospace', fontSize:12, resize:'vertical' }} />
          </Field>
          {lines.trim() && (
            <div style={{ fontSize:11, color: linesValid > 0 ? 'var(--success)' : 'var(--ink-soft)', display:'flex', alignItems:'center', gap:6 }}>
              {linesValid > 0 ? '✓' : '·'} <span>{linesValid} baris akun valid terdeteksi</span>
            </div>
          )}
        </div>
        <div style={{ padding:'14px 22px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:8, background:'var(--surface-2)' }}>
          <button onClick={onClose} style={secondaryBtn}>Batal</button>
          <button onClick={submit} style={primaryBtn}>Simpan {linesValid > 0 ? `(${linesValid} akun)` : ''}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Users page ─────────────────────────────────────────────────────────────
function UsersPage() {
  const { users, updateUsers, navigate, logAudit } = useAdmin();
  const [search, setSearch] = useStateA('');
  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const toggleBan = (u) => {
    const tu = window.useToast ? window.useToast() : (window.toast || {});
    updateUsers(list => list.map(x => x.id === u.id ? {...x, status: x.status === 'banned' ? 'active' : 'banned'} : x));
    logAudit(u.status === 'banned' ? 'user.unban' : 'user.ban', u.email, u.status === 'banned' ? 'Member di-unban' : 'Member di-ban');
    tu.warn && tu.warn(u.status === 'banned' ? 'Member di-unban' : 'Member di-ban', u.email);
  };

  const exportCSV = () => {
    const rows = [['Nama','Email','Bergabung','Total order','Total belanja','Status']];
    filtered.forEach(u => rows.push([u.name, u.email, u.joined, u.orders, u.spent, u.status]));
    downloadCSV('members-'+new Date().toISOString().slice(0,10)+'.csv', rows);
    logAudit('users.export', `${filtered.length} rows`, 'Export CSV member');
  };

  return (
    <div>
      <PageHeader
        title="Member"
        subtitle={`${users.length} member terdaftar`}
        action={<button onClick={exportCSV} style={secondaryBtn}>↓ Export CSV</button>}
      />

      <div style={{ display:'flex', gap:10, marginBottom:14 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari nama atau email..." style={{ ...inpStyle, maxWidth:320 }} />
      </div>

      <TableShell
        columns={['Nama','Email','Bergabung','Order','Total belanja','Status','']}
        rows={filtered.map(u => [
          <div key="n" onClick={()=>navigate('user-detail', u.id)} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
            <div style={{ width:30, height:30, borderRadius:'50%', background:`oklch(0.78 0.12 ${(u.id.charCodeAt(1)*47)%360})`, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 }}>{u.name[0]}</div>
            <span style={{ fontWeight:500, fontSize:13 }}>{u.name}</span>
          </div>,
          <span key="e" style={{ fontSize:12, color:'var(--ink-soft)' }}>{u.email}</span>,
          <span key="j" style={{ fontSize:12 }}>{adminFmtDate(u.joined)}</span>,
          <span key="o" style={{ fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{u.orders}</span>,
          <span key="s" style={{ fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{fmtIDRA(u.spent)}</span>,
          <StatusPill key="st" status={u.status} />,
          <div key="a" style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
            <button onClick={()=>navigate('user-detail', u.id)} style={miniBtn}>Detail</button>
            <button onClick={()=>toggleBan(u)} style={{...miniBtn, color: u.status === 'banned' ? 'var(--success)' : 'var(--danger)'}}>{u.status === 'banned' ? 'Unban' : 'Ban'}</button>
          </div>
        ])}
        empty="Belum ada pelanggan"
        emptyIcon="👥"
        emptyDesc="Saat ada user yang daftar atau checkout, mereka akan muncul di sini."
      />
    </div>
  );
}

// ─── Vouchers page ──────────────────────────────────────────────────────────
function VouchersPage() {
  const { vouchers, updateVouchers } = useAdmin();
  const [adding, setAdding] = useStateA(false);

  const tt = window.useToast ? window.useToast() : (window.toast || {});
  const remove = (id) => {
    let snapshot = null;
    updateVouchers(list => { snapshot = list; return list.filter(v => v.id !== id); });
    tt.undo && tt.undo('Voucher dihapus', () => { if (snapshot) updateVouchers(() => snapshot); tt.success && tt.success('Dipulihkan'); });
  };
  const toggle = (id) => updateVouchers(list => list.map(v => v.id === id ? {...v, active: !v.active} : v));
  const save = (form) => { updateVouchers(list => [{ ...form, id:'v'+Date.now(), used:0 }, ...list]); setAdding(false); };

  return (
    <div>
      <PageHeader title="Voucher & diskon"
        subtitle={`${vouchers.filter(v=>v.active).length} voucher aktif · ${vouchers.reduce((s,v)=>s+v.used,0)} kali dipakai`}
        action={<button data-cmd="add-voucher" onClick={()=>setAdding(true)} style={primaryBtn}>+ Buat voucher</button>}
      />

      <TableShell
        columns={['Kode','Diskon','Min. order','Pemakaian','Berlaku s/d','Status','']}
        rows={vouchers.map(v => [
          <code key="c" style={{ fontFamily:'ui-monospace,monospace', fontWeight:700, fontSize:13, padding:'2px 8px', background:'var(--surface-2)', borderRadius:5, border:'1px solid var(--border)' }}>{v.code}</code>,
          <span key="d" style={{ fontWeight:600 }}>{v.type === 'percent' ? `${v.value}%` : fmtIDRA(v.value)}</span>,
          <span key="m" style={{ fontVariantNumeric:'tabular-nums' }}>{v.minOrder ? fmtIDRA(v.minOrder) : '—'}</span>,
          <span key="u" style={{ fontVariantNumeric:'tabular-nums', fontSize:12 }}>{v.used} {v.limit > 0 ? `/ ${v.limit}` : ''}</span>,
          <span key="e" style={{ fontSize:12 }}>{adminFmtDate(v.expires)}</span>,
          <StatusPill key="s" status={v.active ? 'active' : 'inactive'} />,
          <div key="a" style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
            <button onClick={()=>toggle(v.id)} style={miniBtn}>{v.active ? 'Off' : 'On'}</button>
            <button onClick={()=>remove(v.id)} style={{...miniBtn, color:'var(--danger)'}}>Hapus</button>
          </div>
        ])}
        empty="Belum ada voucher"
        emptyIcon="🎟️"
        emptyDesc="Buat voucher diskon untuk promo, retensi, atau campaign khusus."
        emptyCta={<button onClick={()=>setAdding(true)} style={primaryBtn}>+ Buat voucher</button>}
      />

      {adding && <VoucherFormModal onClose={()=>setAdding(false)} onSave={save} />}
    </div>
  );
}

function VoucherFormModal({ onClose, onSave }) {
  useModalKey(true, onClose);
  const initial = { code:'', type:'percent', value:10, minOrder:0, limit:0, expires:'2026-12-31', active:true };
  const rules = {
    code: (v) => !v || !v.trim() ? 'Kode voucher wajib diisi' : v.length < 4 ? 'Minimal 4 karakter' : null,
    value: (v) => !v || v <= 0 ? 'Nilai harus lebih dari 0' : null,
    minOrder: (v) => v < 0 ? 'Tidak boleh negatif' : null,
    limit: (v) => v < 0 ? 'Tidak boleh negatif' : null,
    expires: (v) => !v ? 'Tanggal berakhir wajib diisi' : null,
  };
  const { values: form, errors, touched, setField, blur, validate, touchAll } = useFormValidation(initial, rules);
  const upd = (k, v) => setField(k, v);
  const toast = (window.useToast ? window.useToast() : null);

  const submit = () => {
    if (validate()) onSave(form);
    else { touchAll(); toast?.error?.('Periksa kembali isian yang ditandai merah.'); }
  };

  return (
    <div style={modalBg} onClick={onClose}>
      <div style={useModalCard()} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18 }}>Buat voucher baru</div>
            <div style={{ fontSize:12, color:'var(--ink-soft)' }}>Atur kode promo dan ketentuannya.</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:0, fontSize:20, color:'var(--ink-soft)', cursor:'pointer', padding:4 }}>✕</button>
        </div>
        <div style={{ padding:22, display:'flex', flexDirection:'column', gap:14 }}>
          <Field label="Kode voucher" required error={touched.code && errors.code}>
            <input value={form.code} onChange={e=>upd('code', e.target.value.toUpperCase())} onBlur={()=>blur('code')} style={{...inpStyle, fontFamily:'ui-monospace,monospace', textTransform:'uppercase'}} placeholder="GAJIAN10" />
          </Field>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="Tipe diskon">
              <select value={form.type} onChange={e=>upd('type', e.target.value)} style={inpStyle}>
                <option value="percent">Persentase (%)</option>
                <option value="fixed">Potongan tetap (Rp)</option>
              </select>
            </Field>
            <Field label={form.type === 'percent' ? 'Nilai (%)' : 'Nilai (Rp)'} required error={touched.value && errors.value}>
              <input type="number" min="0" value={form.value} onChange={e=>upd('value', +e.target.value)} onBlur={()=>blur('value')} style={inpStyle} />
            </Field>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="Min. order (Rp)" error={touched.minOrder && errors.minOrder}>
              <input type="number" min="0" value={form.minOrder} onChange={e=>upd('minOrder', +e.target.value)} onBlur={()=>blur('minOrder')} style={inpStyle} />
            </Field>
            <Field label="Limit pemakaian" hint="0 = unlimited" error={touched.limit && errors.limit}>
              <input type="number" min="0" value={form.limit} onChange={e=>upd('limit', +e.target.value)} onBlur={()=>blur('limit')} style={inpStyle} />
            </Field>
          </div>
          <Field label="Berlaku sampai" required error={touched.expires && errors.expires}>
            <input type="date" value={form.expires} onChange={e=>upd('expires', e.target.value)} onBlur={()=>blur('expires')} style={inpStyle} />
          </Field>
        </div>
        <div style={{ padding:'14px 22px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:8, background:'var(--surface-2)' }}>
          <button onClick={onClose} style={secondaryBtn}>Batal</button>
          <button onClick={submit} style={primaryBtn}>Buat voucher</button>
        </div>
      </div>
    </div>
  );
}

// ─── Gateways page ──────────────────────────────────────────────────────────
function GatewaysPage() {
  const { gateways, updateGateways } = useAdmin();
  const [editing, setEditing] = useStateA(null);

  const toggle = (id) => updateGateways(list => list.map(g => g.id === id ? {...g, enabled: !g.enabled} : g));
  const save = (g) => { updateGateways(list => list.map(x => x.id === g.id ? g : x)); setEditing(null); };

  return (
    <div>
      <PageHeader title="Pembayaran" subtitle="Aktifkan/nonaktifkan metode pembayaran dan kelola API key gateway." />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
        {gateways.map(g => (
          <div key={g.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:18 }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
              <div>
                <div style={{ fontWeight:600, fontSize:15, marginBottom:2 }}>{g.name}</div>
                <div style={{ fontSize:11, color:'var(--ink-soft)' }}>Fee: {g.fee}% per transaksi</div>
              </div>
              <label style={{ position:'relative', display:'inline-block', width:36, height:20, cursor:'pointer' }}>
                <input type="checkbox" checked={g.enabled} onChange={()=>toggle(g.id)} style={{ opacity:0, width:0, height:0 }} />
                <span style={{
                  position:'absolute', inset:0, borderRadius:999,
                  background: g.enabled ? 'var(--ink)' : 'var(--border)',
                  transition:'0.2s',
                }}>
                  <span style={{
                    position:'absolute', top:2, left: g.enabled ? 18 : 2, width:16, height:16,
                    borderRadius:'50%', background:'white', transition:'0.2s',
                    boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </span>
              </label>
            </div>

            <div style={{ background:'var(--surface-2)', borderRadius:6, padding:'8px 10px', fontFamily:'ui-monospace,monospace', fontSize:11, color:'var(--ink-soft)', marginBottom:10, border:'1px solid var(--border)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {g.key || '— belum diset —'}
            </div>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <StatusPill status={g.enabled ? 'active' : 'inactive'} />
              <button onClick={()=>setEditing(g)} style={miniBtn}>Edit API key</button>
            </div>
          </div>
        ))}
      </div>

      {editing && <GatewayEditModal gateway={editing} onClose={()=>setEditing(null)} onSave={save} />}
    </div>
  );
}

function GatewayEditModal({ gateway, onClose, onSave }) {
  const [form, setForm] = useStateA(gateway);
  return (
    <div style={modalBg} onClick={onClose}>
      <div style={{...useModalCard(), maxWidth:480}} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18 }}>Konfig {gateway.name}</div>
        </div>
        <div style={{ padding:22 }}>
          <FormRow label="API key">
            <input value={form.key} onChange={e=>setForm(f=>({...f, key:e.target.value}))} style={{...inpStyle, fontFamily:'ui-monospace,monospace'}} placeholder="paste key di sini" />
          </FormRow>
          <FormRow label="Fee gateway (%)">
            <input type="number" step="0.1" value={form.fee} onChange={e=>setForm(f=>({...f, fee:+e.target.value}))} style={inpStyle} />
          </FormRow>
        </div>
        <div style={{ padding:'14px 22px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:8, background:'var(--surface-2)' }}>
          <button onClick={onClose} style={secondaryBtn}>Batal</button>
          <button onClick={()=>onSave(form)} style={primaryBtn}>Simpan</button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared button styles ───────────────────────────────────────────────────
const primaryBtn = {
  padding:'8px 14px', borderRadius:8, border:0, cursor:'pointer',
  background:'var(--ink)', color:'white', fontSize:13, fontWeight:600, fontFamily:'inherit',
  display:'inline-flex', alignItems:'center', gap:6,
};
const secondaryBtn = {
  padding:'8px 14px', borderRadius:8, border:'1px solid var(--border)', cursor:'pointer',
  background:'var(--surface)', color:'var(--ink)', fontSize:13, fontWeight:500, fontFamily:'inherit',
};
const miniBtn = {
  padding:'4px 10px', borderRadius:5, border:'1px solid var(--border)', cursor:'pointer',
  background:'var(--surface)', color:'var(--ink)', fontSize:11, fontWeight:500, fontFamily:'inherit',
};
const chipStyle = (active) => ({
  padding:'5px 10px', borderRadius:5, border:'1px solid var(--border)', cursor:'pointer',
  background: active ? 'var(--ink)' : 'var(--surface)',
  color: active ? 'white' : 'var(--ink)',
  fontSize:11, fontWeight:500, fontFamily:'inherit',
});

const modalBg = {
  position:'fixed', inset:0, background:'rgba(34,48,74,0.45)', backdropFilter:'blur(2px)',
  display:'flex', alignItems:'center', justifyContent:'center', padding:20, zIndex:200,
};
const useModalCard = () => {
  const ctx = useContextA(AdminCtx);
  const theme = getAdminTheme(ctx?.darkMode);
  return {
    background:'var(--surface)', borderRadius:14, width:'100%', maxWidth:580, maxHeight:'90vh',
    display:'flex', flexDirection:'column', boxShadow:'0 24px 80px rgba(0,0,0,0.18)',
    color:'var(--ink)',
    ...theme,
  };
};
const modalCard = {
  background:'var(--surface)', borderRadius:14, width:'100%', maxWidth:580, maxHeight:'90vh',
  display:'flex', flexDirection:'column', boxShadow:'0 24px 80px rgba(0,0,0,0.18)',
  ...ADMIN_THEME,
};

// ─── Onboarding checklist (first-time admin) ────────────────────────────────
function OnboardingChecklist() {
  const { products, settings, stock, gateways, vouchers, orders, navigate, darkMode } = useAdmin();
  const [dismissed, setDismissed] = useStateA(() => localStorage.getItem('lapakurab_onboarding_dismissed') === '1');
  const [open, setOpen] = useStateA(true);

  const realProducts = products.filter(p => !SEED_PRODUCTS.find(s => s.id === p.id) || JSON.stringify(p) !== JSON.stringify(SEED_PRODUCTS.find(s => s.id === p.id)));
  // Simpler heuristic: check whether default settings have been touched
  const hasCustomCS = settings?.csWA && settings.csWA !== '+62 812-3456-7890';
  const enabledGateways = gateways.filter(g => g.enabled).length;

  const tasks = [
    { id:'product', label:'Tambah produk pertama', done: products.length > SEED_PRODUCTS.length || products.some(p => !SEED_PRODUCTS.find(s => s.id === p.id)), action:()=>navigate('products') },
    { id:'cs',      label:'Set nomor WhatsApp CS',  done: !!hasCustomCS, action:()=>navigate('settings') },
    { id:'stock',   label:'Tambah stok kredensial', done: stock.length > 0, action:()=>navigate('stock') },
    { id:'gateway', label:'Aktifkan payment gateway', done: enabledGateways > 0, action:()=>navigate('gateways') },
    { id:'voucher', label:'Buat voucher promo (opsional)', done: vouchers.length > 0, action:()=>navigate('vouchers'), optional:true },
    { id:'order',   label:'Terima pesanan pertama', done: orders.some(o => o.status === 'paid' || o.status === 'delivered'), action:()=>navigate('orders') },
  ];

  const completed = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const allDone = completed === total;
  const requiredDone = tasks.filter(t => !t.optional).every(t => t.done);

  if (dismissed || allDone) return null;

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem('lapakurab_onboarding_dismissed', '1');
  };

  const theme = getAdminTheme(darkMode);

  return (
    <div style={{
      ...theme,
      position:'fixed', bottom:20, right:20, width: open ? 320 : 'auto',
      background:'var(--surface)', color:'var(--ink)',
      borderRadius:12, boxShadow:'0 12px 40px rgba(0,0,0,0.18)',
      border:'1px solid var(--border)', zIndex:80,
      fontFamily:'"DM Sans", system-ui, sans-serif',
      overflow:'hidden',
      transition:'width 0.2s ease',
    }}>
      {!open && (
        <button
          onClick={()=>setOpen(true)}
          style={{
            display:'flex', alignItems:'center', gap:8, padding:'10px 14px',
            background:'transparent', border:0, cursor:'pointer', color:'var(--ink)',
            fontFamily:'inherit', fontSize:13, fontWeight:600,
          }}
        >
          <span style={{
            width:24, height:24, borderRadius:'50%', background:'var(--primary)', color:'white',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700,
          }}>{completed}/{total}</span>
          <span>Setup toko</span>
        </button>
      )}

      {open && (
        <>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
            <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, letterSpacing:'-0.01em' }}>Setup toko lo</div>
              <div style={{ fontSize:11, color:'var(--ink-soft)' }}>{completed} dari {total} selesai{requiredDone ? ' · Toko siap jalan' : ''}</div>
            </div>
            <div style={{ display:'flex', gap:4 }}>
              <button
                onClick={()=>setOpen(false)}
                title="Minimize"
                style={{ width:24, height:24, borderRadius:6, border:0, background:'transparent', cursor:'pointer', color:'var(--ink-soft)', display:'flex', alignItems:'center', justifyContent:'center' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <button
                onClick={dismiss}
                title="Tutup permanen"
                style={{ width:24, height:24, borderRadius:6, border:0, background:'transparent', cursor:'pointer', color:'var(--ink-soft)', display:'flex', alignItems:'center', justifyContent:'center' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          <div style={{ height:4, background:'var(--surface-2)' }}>
            <div style={{ height:'100%', width:`${(completed/total)*100}%`, background:'var(--primary)', transition:'width 0.4s ease' }} />
          </div>

          <div style={{ padding:'8px 8px 12px', display:'flex', flexDirection:'column', gap:2 }}>
            {tasks.map(t => (
              <button
                key={t.id}
                onClick={t.done ? undefined : t.action}
                disabled={t.done}
                style={{
                  display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:8,
                  background:'transparent', border:0, cursor: t.done ? 'default' : 'pointer',
                  color:'var(--ink)', fontFamily:'inherit', fontSize:13, textAlign:'left',
                  transition:'background 0.15s',
                  opacity: t.done ? 0.55 : 1,
                }}
                onMouseEnter={(e)=>{ if (!t.done) e.currentTarget.style.background='var(--surface-2)'; }}
                onMouseLeave={(e)=>{ e.currentTarget.style.background='transparent'; }}
              >
                <span style={{
                  width:18, height:18, borderRadius:'50%', flexShrink:0,
                  border: t.done ? 0 : '1.5px solid var(--border-strong)',
                  background: t.done ? 'var(--success)' : 'transparent',
                  display:'flex', alignItems:'center', justifyContent:'center', color:'white',
                }}>
                  {t.done && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </span>
                <span style={{
                  flex:1, fontWeight: t.done ? 400 : 500,
                  textDecoration: t.done ? 'line-through' : 'none',
                }}>
                  {t.label}
                  {t.optional && !t.done && <span style={{ marginLeft:6, fontSize:10, color:'var(--ink-soft)', fontWeight:400 }}>· opsional</span>}
                </span>
                {!t.done && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color:'var(--ink-soft)', flexShrink:0 }}><polyline points="9 18 15 12 9 6"/></svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Router ─────────────────────────────────────────────────────────────────
function AdminApp() {
  const { authed, page, navigate, logout } = useAdmin();
  const [paletteOpen, setPaletteOpen] = useStateA(false);

  // Open palette on Cmd/Ctrl+K
  useEffectA(() => {
    if (!authed) return;
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(s => !s);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [authed]);

  if (!authed) return <AdminLogin />;

  const commands = [
    { icon:'📊', title:'Dashboard', section:'Halaman', onRun:()=>navigate('dashboard'), keywords:'beranda overview' },
    { icon:'📦', title:'Produk', section:'Halaman', onRun:()=>navigate('products') },
    { icon:'🧾', title:'Pesanan', section:'Halaman', onRun:()=>navigate('orders'), keywords:'order transaksi' },
    { icon:'🔐', title:'Stok akun', section:'Halaman', onRun:()=>navigate('stock'), keywords:'kredensial credential' },
    { icon:'👥', title:'Pelanggan', section:'Halaman', onRun:()=>navigate('users'), keywords:'member user' },
    { icon:'🎟️', title:'Voucher', section:'Halaman', onRun:()=>navigate('vouchers'), keywords:'diskon promo' },
    { icon:'💳', title:'Payment Gateway', section:'Halaman', onRun:()=>navigate('gateways'), keywords:'pembayaran' },
    { icon:'📋', title:'Audit log', section:'Halaman', onRun:()=>navigate('audit'), keywords:'aktivitas history' },
    { icon:'⚙️', title:'Pengaturan', section:'Halaman', onRun:()=>navigate('settings'), keywords:'setting toko' },
    { icon:'➕', title:'Tambah produk baru', section:'Aksi', onRun:()=>{ navigate('products'); setTimeout(()=>{ const btn = document.querySelector('[data-cmd="add-product"]'); btn && btn.click(); }, 100); } },
    { icon:'➕', title:'Tambah stok kredensial', section:'Aksi', onRun:()=>{ navigate('stock'); setTimeout(()=>{ const btn = document.querySelector('[data-cmd="add-stock"]'); btn && btn.click(); }, 100); } },
    { icon:'➕', title:'Buat voucher baru', section:'Aksi', onRun:()=>{ navigate('vouchers'); setTimeout(()=>{ const btn = document.querySelector('[data-cmd="add-voucher"]'); btn && btn.click(); }, 100); } },
    { icon:'🏠', title:'Lihat toko (frontend)', section:'Navigasi', onRun:()=>{ window.location.hash = ''; } },
    { icon:'🚪', title:'Logout', section:'Akun', onRun:()=>logout() },
  ];

  return (
    <>
      <AdminShell>
        {page === 'dashboard' && <DashboardPage />}
        {page === 'products' && <ProductsPage />}
        {page === 'product-detail' && <ProductDetailPage />}
        {page === 'orders' && <OrdersPage />}
        {page === 'stock' && <StockPage />}
        {page === 'users' && <UsersPage />}
        {page === 'user-detail' && <UserDetailPage />}
        {page === 'vouchers' && <VouchersPage />}
        {page === 'gateways' && <GatewaysPage />}
        {page === 'audit' && <AuditPage />}
        {page === 'settings' && <SettingsPage />}
      </AdminShell>
      <CommandPalette commands={commands} open={paletteOpen} onClose={()=>setPaletteOpen(false)} />
      <OnboardingChecklist />
    </>
  );
}

function AdminRoot() {
  return <AdminProvider><AdminApp /></AdminProvider>;
}

// Expose to global so the host HTML's router can mount it
window.AdminRoot = AdminRoot;
