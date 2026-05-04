// Toko Akun — main interactive prototype
// All 7 screens, cart/search/filter/checkout/auth/dashboard

const { useState, useEffect, useMemo, useRef, createContext, useContext } = React;

// ─── Data ────────────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id:'p1', name:'Streamflix Premium', cat:'streaming', tagline:'4K UHD · 4 Profil', priceIDR:25000, oldIDR:55000, stock:12, rating:4.9, reviews:1284, durations:['1 Bulan','3 Bulan','6 Bulan','1 Tahun'], hue:340, emoji:'▶' },
  { id:'p2', name:'Tunify Family', cat:'streaming', tagline:'Musik tanpa iklan · 6 akun', priceIDR:18000, oldIDR:42000, stock:8, rating:4.8, reviews:932, durations:['1 Bulan','3 Bulan','6 Bulan'], hue:140, emoji:'♪' },
  { id:'p3', name:'CloudVPN Pro', cat:'vpn', tagline:'80+ negara · No-log', priceIDR:15000, oldIDR:35000, stock:24, rating:4.7, reviews:512, durations:['1 Bulan','6 Bulan','1 Tahun','2 Tahun'], hue:220, emoji:'◈' },
  { id:'p4', name:'Disnia+ Hotstart', cat:'streaming', tagline:'Marvel · Star Wars · Pixar', priceIDR:22000, oldIDR:49000, stock:5, rating:4.9, reviews:2104, durations:['1 Bulan','3 Bulan','1 Tahun'], hue:265, emoji:'✦' },
  { id:'p5', name:'YouTune Premium', cat:'streaming', tagline:'No ads · Background play', priceIDR:12000, oldIDR:28000, stock:31, rating:4.8, reviews:1876, durations:['1 Bulan','3 Bulan','6 Bulan','1 Tahun'], hue:10, emoji:'▷' },
  { id:'p6', name:'NordSecure VPN', cat:'vpn', tagline:'5500+ server · Kill switch', priceIDR:20000, oldIDR:48000, stock:17, rating:4.6, reviews:743, durations:['1 Bulan','1 Tahun','2 Tahun'], hue:200, emoji:'◇' },
  { id:'p7', name:'HBO Mix', cat:'streaming', tagline:'Series premium · Original', priceIDR:28000, oldIDR:60000, stock:3, rating:4.9, reviews:654, durations:['1 Bulan','3 Bulan'], hue:285, emoji:'◉' },
  { id:'p8', name:'Surfly VPN Lite', cat:'vpn', tagline:'Ringan & cepat · 1 device', priceIDR:9000, oldIDR:22000, stock:42, rating:4.5, reviews:298, durations:['1 Bulan','3 Bulan','6 Bulan'], hue:170, emoji:'≈' },
];

const CATEGORIES = [
  { id:'all', label:'Semua', emoji:'✦' },
  { id:'streaming', label:'Streaming', emoji:'▶' },
  { id:'vpn', label:'VPN', emoji:'◈' },
];

const REVIEWS = [
  { name:'Rina A.', rating:5, text:'Cepet banget pengirimannya, langsung jalan bro 🔥', when:'2 hari lalu' },
  { name:'Dimas P.', rating:5, text:'Murah, garansi full. Bakal langganan terus disini.', when:'1 minggu lalu' },
  { name:'Anita K.', rating:4, text:'Akun aman, cuma sempet pending 5 menit aja.', when:'2 minggu lalu' },
  { name:'Bagas W.', rating:5, text:'Mantul! Customer service ramah & responsif.', when:'3 minggu lalu' },
];

const PAYMENT_METHODS = [
  { id:'qris', name:'QRIS', desc:'Semua e-wallet & m-banking', tag:'Instant' },
  { id:'gopay', name:'GoPay', desc:'Bayar pakai saldo GoPay', tag:'Populer' },
  { id:'ovo', name:'OVO', desc:'Cashback hingga 10%', tag:'Cashback' },
  { id:'dana', name:'DANA', desc:'Bayar pakai saldo DANA', tag:null },
  { id:'shopeepay', name:'ShopeePay', desc:'Pakai saldo ShopeePay', tag:null },
];

const ORDERS_DATA = [
  { id:'#TKA-2841', date:'2 Mei 2026', product:'Streamflix Premium', duration:'3 Bulan', total:75000, status:'Aktif', daysLeft:62 },
  { id:'#TKA-2719', date:'18 Apr 2026', product:'CloudVPN Pro', duration:'1 Tahun', total:180000, status:'Aktif', daysLeft:340 },
  { id:'#TKA-2604', date:'12 Mar 2026', product:'Tunify Family', duration:'1 Bulan', total:18000, status:'Selesai', daysLeft:0 },
  { id:'#TKA-2511', date:'2 Mar 2026', product:'YouTune Premium', duration:'6 Bulan', total:72000, status:'Aktif', daysLeft:120 },
];

// ─── Theme tokens (Y2K Bubble — main direction) ──────────────────────────────
const THEME = {
  bg: '#FFF8F2',
  surface: '#FFFFFF',
  ink: '#1A1626',
  inkSoft: '#5A5168',
  primary: '#FF6B9D',     // hot pink
  primaryInk: '#FFFFFF',
  mint: '#7FE7C7',
  lilac: '#C5A3FF',
  peach: '#FFC97A',
  sky: '#9FD4FF',
  border: '#E8DFD3',
  shadow: 'rgba(26,22,38,0.08)',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtIDR = (n) => 'Rp' + n.toLocaleString('id-ID');
const fmtUSD = (n) => '$' + (n/15500).toFixed(2);

const highlightMatch = (text, query) => {
  if (!query || !query.trim()) return text;
  const q = query.trim();
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return text;
  return (
    <>{text.slice(0, i)}<mark style={{ background:'rgba(255,107,157,0.22)', color:'var(--ink)', padding:0, borderRadius:2, fontWeight:700 }}>{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>
  );
};

// ─── Context ─────────────────────────────────────────────────────────────────
const StoreCtx = createContext(null);

function StoreProvider({ children, currency, dark, font }) {
  const [route, setRoute] = useState({ name:'home' });
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ cat:'all', sort:'popular', maxPrice:50000 });
  const [toast, setToast] = useState(null);
  const [flyAnim, setFlyAnim] = useState(null);
  const [compareIds, setCompareIds] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const fmt = currency === 'USD' ? fmtUSD : fmtIDR;

  const toggleCompare = (productId) => {
    setCompareIds(ids => {
      if (ids.includes(productId)) return ids.filter(i => i !== productId);
      if (ids.length >= 3) {
        setToast({ msg: 'Maksimal 3 produk untuk dibandingkan', ts: Date.now() });
        setTimeout(() => setToast(null), 2200);
        return ids;
      }
      return [...ids, productId];
    });
  };
  const clearCompare = () => setCompareIds([]);
  const compareList = useMemo(() => compareIds.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean), [compareIds]);

  const addToCart = (product, duration, originRect) => {
    setCart(c => {
      const key = product.id + '|' + duration;
      const existing = c.find(it => it.key === key);
      if (existing) return c.map(it => it.key === key ? {...it, qty:it.qty+1} : it);
      return [...c, { key, product, duration, qty:1 }];
    });
    if (originRect) setFlyAnim({ rect: originRect, hue: product.hue, ts: Date.now() });
    setToast({ msg: `${product.name} ditambahkan ke keranjang!`, ts: Date.now() });
    setTimeout(() => setToast(null), 2500);
  };

  const removeFromCart = (key) => setCart(c => c.filter(it => it.key !== key));
  const updateQty = (key, qty) => setCart(c => qty <= 0 ? c.filter(it => it.key !== key) : c.map(it => it.key === key ? {...it, qty} : it));

  const cartTotal = cart.reduce((s, it) => s + it.product.priceIDR * it.qty, 0);
  const cartCount = cart.reduce((s, it) => s + it.qty, 0);

  const value = {
    route, setRoute, cart, setCart, addToCart, removeFromCart, updateQty,
    cartTotal, cartCount, user, setUser, search, setSearch,
    filter, setFilter, toast, setToast, flyAnim, setFlyAnim,
    currency, fmt, dark, font,
    compareIds, compareList, toggleCompare, clearCompare, compareOpen, setCompareOpen,
  };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

const useStore = () => useContext(StoreCtx);

// ─── Product visual: brand-style mockup card ────────────────────────────────
function ProductTile({ hue, emoji, size=120, rounded=24, name, cat }) {
  // Pick a deep, saturated bg per hue (looks like a streaming app key art / brand card)
  const bgDeep = `oklch(0.32 0.14 ${hue})`;
  const bgMid = `oklch(0.45 0.18 ${hue})`;
  const accent = `oklch(0.78 0.18 ${(hue+40)%360})`;
  const accent2 = `oklch(0.85 0.14 ${(hue+90)%360})`;
  const isVPN = cat === 'vpn';
  const isSmall = size < 60;

  // Initials from name (e.g. "Streamflix Premium" → "S")
  const initial = (name || emoji || '?').trim()[0].toUpperCase();

  return (
    <div style={{
      width: size === '100%' ? '100%' : size,
      aspectRatio: size === '100%' ? '16 / 10' : undefined,
      height: size === '100%' ? undefined : size,
      borderRadius: rounded,
      position:'relative', overflow:'hidden',
      background:`linear-gradient(140deg, ${bgDeep} 0%, ${bgMid} 100%)`,
      boxShadow:'inset 0 -1px 2px rgba(255,255,255,0.06), inset 0 1px 2px rgba(255,255,255,0.18)',
    }}>
      {/* Soft glow accents */}
      <div style={{
        position:'absolute', top:'-30%', right:'-20%', width:'80%', height:'80%',
        borderRadius:'50%', background: accent, opacity:0.35, filter:'blur(40px)',
      }} />
      <div style={{
        position:'absolute', bottom:'-30%', left:'-20%', width:'70%', height:'70%',
        borderRadius:'50%', background: accent2, opacity:0.22, filter:'blur(36px)',
      }} />

      {/* VPN: globe rings; Streaming: play triangle */}
      {isVPN ? (
        <svg viewBox="0 0 100 100" style={{ position:'absolute', top:'50%', left:'50%', width:'60%', height:'60%', transform:'translate(-50%,-50%)', opacity: isSmall ? 0.5 : 0.22 }}>
          <circle cx="50" cy="50" r="38" fill="none" stroke="white" strokeWidth="1"/>
          <ellipse cx="50" cy="50" rx="38" ry="16" fill="none" stroke="white" strokeWidth="1"/>
          <ellipse cx="50" cy="50" rx="16" ry="38" fill="none" stroke="white" strokeWidth="1"/>
          <line x1="12" y1="50" x2="88" y2="50" stroke="white" strokeWidth="1"/>
        </svg>
      ) : (
        !isSmall && (
          <div style={{
            position:'absolute', top: '14%', left: '10%', right: '10%',
            display:'flex', gap:4,
          }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ flex: i === 0 ? 2 : 1, height:3, borderRadius:2, background:'rgba(255,255,255,0.25)' }} />
            ))}
          </div>
        )
      )}

      {/* Big initial mark */}
      <div style={{
        position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <div style={{
          fontFamily:'var(--font-display)',
          fontSize: typeof size === 'number' ? size * 0.5 : '4rem',
          fontWeight: 700, lineHeight: 1, letterSpacing:'-0.05em',
          color:'white',
          textShadow:'0 2px 24px rgba(0,0,0,0.4)',
        }}>{initial}</div>
      </div>

      {/* Bottom UI strip — only on larger sizes */}
      {!isSmall && (
        <div style={{
          position:'absolute', left:'8%', right:'8%', bottom:'8%',
          display:'flex', alignItems:'center', gap:6,
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: 5,
            background:'rgba(255,255,255,0.95)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize: 9, color: bgDeep, fontWeight: 800,
          }}>{isVPN ? '◆' : '▶'}</div>
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:3 }}>
            <div style={{ height:4, background:'rgba(255,255,255,0.85)', borderRadius:2, width:'70%' }} />
            <div style={{ height:3, background:'rgba(255,255,255,0.4)', borderRadius:2, width:'45%' }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Top bar ────────────────────────────────────────────────────────────────
function TopBar() {
  const { route, setRoute, cartCount, search, setSearch, user } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lapakurab_recent_searches') || '[]'); } catch { return []; }
  });

  const liveResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q) || p.cat.includes(q)).slice(0,5);
  }, [search]);

  const popularQueries = ['Netflix', 'Spotify', 'VPN', 'Disney+', 'YouTube'];
  const trendingProducts = useMemo(() => [...PRODUCTS].filter(p => p.active !== false).sort((a,b) => (b.reviews||0) - (a.reviews||0)).slice(0,4), []);

  const saveRecent = (q) => {
    if (!q || !q.trim()) return;
    const next = [q.trim(), ...recent.filter(r => r.toLowerCase() !== q.trim().toLowerCase())].slice(0, 5);
    setRecent(next);
    try { localStorage.setItem('lapakurab_recent_searches', JSON.stringify(next)); } catch {}
  };

  const clearRecent = () => {
    setRecent([]);
    try { localStorage.removeItem('lapakurab_recent_searches'); } catch {}
  };

  const submitSearch = (q) => {
    setSearch(q);
    saveRecent(q);
    setRoute({name:'search'});
    setSearchFocus(false);
  };

  const showDropdown = searchFocus && (search.trim() ? true : (recent.length > 0 || trendingProducts.length > 0));

  return (
    <div style={{
      position:'sticky', top:0, zIndex:50, background:'var(--bg)',
      borderBottom:`1px solid var(--border)`, backdropFilter:'blur(8px)',
    }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'14px 24px', display:'flex', alignItems:'center', gap:20 }}>
        <button onClick={() => setRoute({name:'home'})} style={{
          background:'none', border:0, padding:0, cursor:'pointer', display:'flex', alignItems:'center', gap:8,
        }}>
          <div style={{
            width:36, height:36, borderRadius:12,
            background:'linear-gradient(135deg, var(--primary), var(--lilac))',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'white', fontWeight:900, fontSize:18, fontFamily:'var(--font-display)',
            boxShadow:'0 4px 12px rgba(255,107,157,0.35)',
            transform:'rotate(-6deg)',
          }}>Lk</div>
          <div style={{ fontWeight:700, fontSize:18, fontFamily:'var(--font-display)', letterSpacing:'-0.03em' }}>lapakurab<span style={{color:'var(--primary)'}}>_</span></div>
        </button>

        <div style={{ flex:1, position:'relative', maxWidth:520, marginLeft:20 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setTimeout(() => setSearchFocus(false), 200)}
            onKeyDown={e => { if (e.key === 'Enter' && search.trim()) { submitSearch(search); } }}
            placeholder="Cari akun streaming, VPN..."
            style={{
              width:'100%', padding:'12px 16px 12px 42px', borderRadius:999,
              border:`1.5px solid var(--border)`, background:'var(--surface)',
              fontSize:14, fontFamily:'inherit', outline:'none',
              transition:'all 0.2s',
              boxShadow: searchFocus ? '0 0 0 4px rgba(255,107,157,0.15)' : 'none',
              borderColor: searchFocus ? 'var(--primary)' : 'var(--border)',
            }}
          />
          <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--ink-soft)', fontSize:16 }}>⌕</div>
          {search.trim() && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setSearch('')}
              aria-label="Bersihkan"
              style={{
                position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                width:20, height:20, borderRadius:'50%', border:0, cursor:'pointer',
                background:'var(--surface-2)', color:'var(--ink-soft)',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:12,
              }}
            >×</button>
          )}
          {showDropdown && (
            <div style={{
              position:'absolute', top:'100%', left:0, right:0, marginTop:8,
              background:'var(--surface)', borderRadius:18, border:`1.5px solid var(--border)`,
              boxShadow:'0 12px 40px rgba(0,0,0,0.12)', overflow:'hidden', zIndex:60,
              maxHeight:480, overflowY:'auto',
            }}>
              {/* When typing — show live results */}
              {search.trim() && liveResults.length > 0 && (
                <>
                  <div style={{ padding:'10px 16px 6px', fontSize:10, fontWeight:700, color:'var(--ink-soft)', letterSpacing:'0.08em', textTransform:'uppercase' }}>Produk</div>
                  {liveResults.map(p => (
                    <button key={p.id} onMouseDown={(e)=>e.preventDefault()} onClick={() => { setRoute({name:'product', id:p.id}); setSearchFocus(false); setSearch(''); }}
                      style={{
                        width:'100%', display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
                        background:'none', border:0, cursor:'pointer', textAlign:'left',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(255,107,157,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background='none'}
                    >
                      <ProductTile hue={p.hue} emoji={p.emoji} size={40} rounded={10} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:600, fontSize:14 }}>{highlightMatch(p.name, search)}</div>
                        <div style={{ fontSize:12, color:'var(--ink-soft)' }}>{p.tagline}</div>
                      </div>
                      <div style={{ fontWeight:700, fontSize:14, color:'var(--primary)' }}>{fmtIDR(p.priceIDR)}</div>
                    </button>
                  ))}
                  <button onMouseDown={(e)=>e.preventDefault()} onClick={()=>submitSearch(search)}
                    style={{
                      width:'100%', padding:'12px 16px', background:'var(--surface-2)',
                      border:0, borderTop:`1px solid var(--border)`, cursor:'pointer',
                      fontSize:13, fontWeight:600, color:'var(--primary)', fontFamily:'inherit',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                    }}>
                    Lihat semua hasil untuk "{search}" →
                  </button>
                </>
              )}

              {/* No results */}
              {search.trim() && liveResults.length === 0 && (
                <div style={{ padding:'24px 16px', textAlign:'center' }}>
                  <div style={{ fontSize:32, marginBottom:6, opacity:0.5 }}>⌕</div>
                  <div style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>Nggak ketemu "{search}"</div>
                  <div style={{ fontSize:12, color:'var(--ink-soft)', marginBottom:12 }}>Coba kata lain atau lihat saran berikut.</div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:'center' }}>
                    {popularQueries.map(q => (
                      <button key={q} onMouseDown={(e)=>e.preventDefault()} onClick={()=>{ setSearch(q); }}
                        style={{
                          padding:'5px 11px', borderRadius:999, border:`1px solid var(--border)`,
                          background:'var(--surface)', cursor:'pointer', fontSize:12, fontFamily:'inherit', color:'var(--ink)',
                        }}>{q}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* When empty + recent or trending */}
              {!search.trim() && (
                <>
                  {recent.length > 0 && (
                    <>
                      <div style={{ padding:'10px 16px 6px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ fontSize:10, fontWeight:700, color:'var(--ink-soft)', letterSpacing:'0.08em', textTransform:'uppercase' }}>Pencarian terakhir</span>
                        <button onMouseDown={(e)=>e.preventDefault()} onClick={clearRecent} style={{ fontSize:11, color:'var(--ink-soft)', background:'none', border:0, cursor:'pointer', fontFamily:'inherit' }}>Hapus</button>
                      </div>
                      {recent.map(r => (
                        <button key={r} onMouseDown={(e)=>e.preventDefault()} onClick={()=>submitSearch(r)}
                          style={{
                            width:'100%', display:'flex', alignItems:'center', gap:12, padding:'8px 16px',
                            background:'none', border:0, cursor:'pointer', textAlign:'left', fontFamily:'inherit',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background='var(--surface-2)'}
                          onMouseLeave={e => e.currentTarget.style.background='none'}
                        >
                          <span style={{ width:24, height:24, borderRadius:'50%', background:'var(--surface-2)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ink-soft)', fontSize:12, flexShrink:0 }}>↻</span>
                          <span style={{ flex:1, fontSize:13, color:'var(--ink)' }}>{r}</span>
                          <span style={{ fontSize:11, color:'var(--ink-soft)' }}>↗</span>
                        </button>
                      ))}
                    </>
                  )}
                  <div style={{ padding:'10px 16px 6px', fontSize:10, fontWeight:700, color:'var(--ink-soft)', letterSpacing:'0.08em', textTransform:'uppercase' }}>Lagi populer</div>
                  {trendingProducts.map(p => (
                    <button key={p.id} onMouseDown={(e)=>e.preventDefault()} onClick={() => { setRoute({name:'product', id:p.id}); setSearchFocus(false); }}
                      style={{
                        width:'100%', display:'flex', alignItems:'center', gap:12, padding:'8px 14px',
                        background:'none', border:0, cursor:'pointer', textAlign:'left',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(255,107,157,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background='none'}
                    >
                      <ProductTile hue={p.hue} emoji={p.emoji} size={32} rounded={8} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:600, fontSize:13 }}>{p.name}</div>
                        <div style={{ fontSize:11, color:'var(--ink-soft)' }}>{p.cat === 'vpn' ? 'VPN' : 'Streaming'} · ⭐ {p.rating}</div>
                      </div>
                      <div style={{ fontWeight:700, fontSize:13, color:'var(--primary)' }}>{fmtIDR(p.priceIDR)}</div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <nav style={{ display:'flex', gap:6, alignItems:'center' }}>
          <NavBtn active={route.name==='catalog'} onClick={() => setRoute({name:'catalog'})}>Katalog</NavBtn>
          <NavBtn active={route.name==='dashboard'} onClick={() => setRoute(user ? {name:'dashboard'} : {name:'auth'})}>
            {user ? user.name.split(' ')[0] : 'Masuk'}
          </NavBtn>
          <button onClick={() => setRoute({name:'cart'})} style={{
            position:'relative', padding:'10px 14px', borderRadius:999,
            border:`1.5px solid var(--ink)`, background:'var(--ink)', color:'white',
            fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6,
            fontFamily:'inherit',
          }}>
            <span>⛛</span> Keranjang
            {cartCount > 0 && (
              <span style={{
                background:'var(--primary)', color:'white', borderRadius:999,
                padding:'2px 8px', fontSize:11, fontWeight:800, minWidth:20,
              }}>{cartCount}</span>
            )}
          </button>
        </nav>
      </div>
    </div>
  );
}

function NavBtn({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:'10px 14px', borderRadius:999, border:'1.5px solid transparent',
      background: active ? 'rgba(255,107,157,0.12)' : 'transparent',
      color: active ? 'var(--primary)' : 'var(--ink)',
      fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'inherit',
      transition:'all 0.15s',
    }}>{children}</button>
  );
}

// ─── Home ───────────────────────────────────────────────────────────────────
function HomeScreen() {
  const { setRoute, addToCart } = useStore();
  const featured = PRODUCTS.slice(0,4);
  const [tickerIdx, setTickerIdx] = useState(0);
  const tickerNames = ['Rina','Dimas','Anita','Bagas','Sari','Yoga','Mira','Adit'];
  const tickerProducts = ['Streamflix Premium','CloudVPN Pro','Tunify Family','Disnia+ Hotstart','YouTune Premium'];

  useEffect(() => {
    const t = setInterval(() => setTickerIdx(i => i+1), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px' }}>
      {/* Hero */}
      <section style={{
        position:'relative', borderRadius:32, padding:'56px 48px', overflow:'hidden',
        background:'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)', border:'1px solid var(--border)',
        marginBottom:32,
      }}>
        <div style={{
          position:'absolute', top:-60, right:-60, width:240, height:240, borderRadius:'50%',
          background:'radial-gradient(circle, var(--primary), transparent)', opacity:0.3, filter:'blur(20px)',
        }} />
        <div style={{
          position:'absolute', bottom:-40, left:-40, width:180, height:180, borderRadius:'50%',
          background:'radial-gradient(circle, var(--mint), transparent)', opacity:0.4, filter:'blur(20px)',
        }} />
        <div style={{ position:'relative', display:'grid', gridTemplateColumns:'1.3fr 1fr', gap:40, alignItems:'center' }}>
          <div>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:999,
              background:'rgba(255,255,255,0.7)', backdropFilter:'blur(8px)',
              fontWeight:600, fontSize:12, marginBottom:20,
            }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:'#22C55E', boxShadow:'0 0 0 3px rgba(34,197,94,0.25)' }} />
              4.812 verified customers · live
            </div>
            <h1 style={{
              fontFamily:'var(--font-display)', fontSize:64, lineHeight:0.95, fontWeight:800,
              letterSpacing:'-0.03em', margin:'0 0 20px',
            }}>
              Premium accounts,<br/>
              <span style={{
                background:'linear-gradient(135deg, var(--primary), var(--lilac))',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
              }}>fair price. real fast.</span>
            </h1>
            <p style={{ fontSize:17, color:'var(--ink-soft)', lineHeight:1.5, margin:'0 0 28px', maxWidth:480 }}>
              Streaming favoritmu & VPN aman, bergaransi penuh. Kirim instan via QRIS atau e-wallet.
            </p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <button onClick={() => setRoute({name:'catalog'})} style={{
                padding:'16px 28px', borderRadius:999, border:0, cursor:'pointer',
                background:'var(--ink)', color:'white', fontWeight:700, fontSize:15,
                fontFamily:'inherit', boxShadow:'0 8px 24px rgba(26,22,38,0.25)',
              }}>Mulai belanja →</button>
              <button onClick={() => setRoute({name:'catalog'})} style={{
                padding:'16px 28px', borderRadius:999, border:'1.5px solid var(--ink)', cursor:'pointer',
                background:'rgba(255,255,255,0.6)', color:'var(--ink)', fontWeight:700, fontSize:15,
                fontFamily:'inherit',
              }}>Lihat promo</button>
            </div>
          </div>
          <div style={{ position:'relative', height:320 }}>
            {featured.map((p, i) => {
              const positions = [
                { top:0, left:30, rot:-8, z:3 },
                { top:60, right:0, rot:6, z:2 },
                { bottom:0, left:0, rot:4, z:2 },
                { bottom:30, right:60, rot:-4, z:1 },
              ];
              const pos = positions[i];
              return (
                <div key={p.id} style={{
                  position:'absolute', ...pos, transform:`rotate(${pos.rot}deg)`, zIndex:pos.z,
                  cursor:'pointer', transition:'transform 0.3s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = `rotate(0deg) scale(1.05)`}
                onMouseLeave={e => e.currentTarget.style.transform = `rotate(${pos.rot}deg)`}
                onClick={() => setRoute({name:'product', id:p.id})}
                >
                  <div style={{
                    background:'white', borderRadius:20, padding:12, width:140,
                    boxShadow:'0 12px 32px rgba(0,0,0,0.12)',
                  }}>
                    <ProductTile hue={p.hue} emoji={p.emoji} size={116} rounded={14} />
                    <div style={{ fontWeight:700, fontSize:13, marginTop:8 }}>{p.name.split(' ')[0]}</div>
                    <div style={{ fontWeight:800, fontSize:13, color:'var(--primary)', marginTop:2 }}>{fmtIDR(p.priceIDR)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live ticker */}
      <div style={{
        background:'var(--surface)', borderRadius:18, padding:'14px 20px', marginBottom:32,
        border:`1.5px solid var(--border)`, display:'flex', alignItems:'center', gap:14, overflow:'hidden',
      }}>
        <div style={{
          padding:'4px 10px', borderRadius:6, background:'#FEE2E2', color:'#DC2626',
          fontWeight:800, fontSize:11, letterSpacing:'0.05em', flexShrink:0,
        }}>● LIVE</div>
        <div style={{ flex:1, position:'relative', height:20, overflow:'hidden' }}>
          {[0,1,2].map(off => {
            const idx = (tickerIdx + off) % tickerNames.length;
            const pIdx = (tickerIdx + off) % tickerProducts.length;
            return (
              <div key={tickerIdx + '_' + off} style={{
                position:'absolute', top:0, left:0, width:'100%',
                opacity: off === 1 ? 1 : 0,
                transform: `translateY(${(off-1)*-20}px)`,
                transition:'all 0.5s',
                fontSize:13, color:'var(--ink-soft)',
              }}>
                <strong style={{color:'var(--ink)'}}>{tickerNames[idx]}</strong> baru saja membeli <strong style={{color:'var(--primary)'}}>{tickerProducts[pIdx]}</strong> · 2 menit lalu
              </div>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:800, letterSpacing:'-0.02em', margin:'0 0 16px' }}>Kategori populer</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:48 }}>
        {[
          { id:'streaming', label:'Streaming', desc:'Netflix, Spotify, Disney+ & lainnya', emoji:'▶', hue:340 },
          { id:'vpn', label:'VPN', desc:'Privasi & akses tanpa batas', emoji:'◈', hue:220 },
          { id:'all', label:'Semua produk', desc:'Lihat seluruh katalog kami', emoji:'✦', hue:140 },
        ].map(c => (
          <button key={c.id} onClick={() => { useStore(); setRoute({name:'catalog', cat:c.id}); }} style={{
            padding:24, borderRadius:24, background:'var(--surface)', border:`1.5px solid var(--border)`,
            cursor:'pointer', textAlign:'left', transition:'all 0.2s', fontFamily:'inherit',
            display:'flex', alignItems:'center', gap:16,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
          >
            <ProductTile hue={c.hue} emoji={c.emoji} size={72} rounded={18} />
            <div>
              <div style={{ fontWeight:700, fontSize:18, marginBottom:4 }}>{c.label}</div>
              <div style={{ fontSize:13, color:'var(--ink-soft)' }}>{c.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Featured grid */}
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:16 }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:700, letterSpacing:'-0.03em', margin:0 }}>Best sellers</h2>
        <button onClick={() => setRoute({name:'catalog'})} style={{
          background:'none', border:0, color:'var(--primary)', fontWeight:700, fontSize:14, cursor:'pointer',
        }}>Lihat semua →</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
        {PRODUCTS.slice(0,4).map(p => <ProductCard key={p.id} product={p} />)}
      </div>

      {/* Trust strip */}
      <div style={{
        marginTop:48, padding:32, borderRadius:24,
        background:'var(--surface)', border:'1px solid var(--border)',
        display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24,
      }}>
        {[
          { num:'4.812', label:'Pelanggan aktif' },
          { num:'15.290+', label:'Order sukses' },
          { num:'4.9★', label:'Rating rata-rata' },
          { num:'24/7', label:'Customer support' },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:800, letterSpacing:'-0.02em', color:'var(--ink)' }}>{s.num}</div>
            <div style={{ fontSize:13, color:'var(--ink)', opacity:0.7, marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}

// ─── Product card ───────────────────────────────────────────────────────────
function ProductCard({ product }) {
  const { setRoute, addToCart, fmt, compareIds, toggleCompare } = useStore();
  const [hover, setHover] = useState(false);
  const btnRef = useRef(null);
  const inCompare = compareIds.includes(product.id);

  const discount = Math.round(((product.oldIDR - product.priceIDR) / product.oldIDR) * 100);
  const lowStock = product.stock <= 5;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background:'var(--surface)', borderRadius:24, overflow:'hidden',
        border:`1.5px solid var(--border)`, cursor:'pointer',
        transition:'all 0.2s', transform: hover ? 'translateY(-4px)' : '',
        boxShadow: hover ? '0 16px 40px rgba(0,0,0,0.1)' : '0 2px 6px rgba(0,0,0,0.04)',
      }}
      onClick={() => setRoute({name:'product', id:product.id})}
    >
      <div style={{ position:'relative', padding:10, paddingBottom:0 }}>
        <div style={{ position:'relative', borderRadius:12, overflow:'hidden' }}>
          <ProductTile hue={product.hue} emoji={product.emoji} name={product.name} cat={product.cat} size="100%" rounded={12} />
          <div style={{ position:'absolute', top:10, left:10, display:'flex', flexDirection:'column', gap:5 }}>
            {discount > 0 && (
              <div style={{
                padding:'3px 8px', borderRadius:5, background:'rgba(255,255,255,0.95)', color:'var(--ink)',
                fontSize:10, fontWeight:700, letterSpacing:'0.02em',
                backdropFilter:'blur(8px)',
              }}>−{discount}%</div>
            )}
          </div>
          {lowStock && (
            <div style={{
              position:'absolute', top:10, right:10,
              padding:'3px 8px', borderRadius:5, background:'rgba(220,38,38,0.95)', color:'white',
              fontSize:10, fontWeight:700, backdropFilter:'blur(8px)',
            }}>Sisa {product.stock}</div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); toggleCompare(product.id); }}
            title={inCompare ? 'Hapus dari perbandingan' : 'Bandingkan'}
            style={{
              position:'absolute', bottom:8, right:8,
              width:32, height:32, borderRadius:'50%', border:0, cursor:'pointer',
              background: inCompare ? 'var(--primary)' : 'rgba(255,255,255,0.95)',
              color: inCompare ? 'white' : 'var(--ink)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:14, fontWeight:700,
              boxShadow:'0 2px 8px rgba(0,0,0,0.15)', backdropFilter:'blur(8px)',
              opacity: hover || inCompare ? 1 : 0,
              transition:'opacity 0.15s, background 0.15s, transform 0.15s',
              transform: inCompare ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              {inCompare ? (
                <polyline points="20 6 9 17 4 12"/>
              ) : (
                <><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h12"/></>
              )}
            </svg>
          </button>
        </div>
      </div>
      <div style={{ padding:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
          <span style={{
            fontSize:10, fontWeight:600, color:'var(--ink-soft)',
            textTransform:'uppercase', letterSpacing:'0.06em',
          }}>{product.cat === 'vpn' ? 'VPN' : 'Streaming'}</span>
          <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:11, color:'var(--ink-soft)' }}>
            <span style={{color:'#F59E0B'}}>★</span>
            <strong style={{color:'var(--ink)'}}>{product.rating}</strong>
            <span>({product.reviews > 999 ? (product.reviews/1000).toFixed(1)+'k' : product.reviews})</span>
          </span>
        </div>
        <div style={{ fontWeight:600, fontSize:15, marginBottom:3, letterSpacing:'-0.01em' }}>{product.name}</div>
        <div style={{ fontSize:12, color:'var(--ink-soft)', marginBottom:14, lineHeight:1.4, minHeight:34 }}>{product.tagline}</div>
        <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:12 }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'var(--ink)', letterSpacing:'-0.02em' }}>{fmt(product.priceIDR)}</div>
          <div style={{ fontSize:12, color:'var(--ink-soft)', textDecoration:'line-through' }}>{fmt(product.oldIDR)}</div>
        </div>
        <button
          ref={btnRef}
          onClick={(e) => {
            e.stopPropagation();
            const r = btnRef.current.getBoundingClientRect();
            addToCart(product, product.durations[0], r);
          }}
          style={{
            width:'100%', padding:'10px 14px', borderRadius:8, border:0, cursor:'pointer',
            background: hover ? 'var(--ink)' : 'var(--surface-2)',
            color: hover ? 'white' : 'var(--ink)',
            fontWeight:600, fontSize:13, fontFamily:'inherit',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            transition:'all 0.15s',
            border: `1px solid ${hover ? 'var(--ink)' : 'var(--border)'}`,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>
          </svg>
          Tambah ke keranjang
        </button>
      </div>
    </div>
  );
}

// ─── Catalog ────────────────────────────────────────────────────────────────
function CatalogScreen() {
  const { filter, setFilter, route } = useStore();
  const initCat = route.cat || filter.cat;

  useEffect(() => {
    if (route.cat && route.cat !== filter.cat) setFilter(f => ({...f, cat: route.cat}));
  }, [route.cat]);

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter(p => filter.cat === 'all' || p.cat === filter.cat);
    list = list.filter(p => p.priceIDR <= filter.maxPrice);
    if (filter.sort === 'price-low') list = [...list].sort((a,b) => a.priceIDR - b.priceIDR);
    if (filter.sort === 'price-high') list = [...list].sort((a,b) => b.priceIDR - a.priceIDR);
    if (filter.sort === 'rating') list = [...list].sort((a,b) => b.rating - a.rating);
    return list;
  }, [filter]);

  return (
    <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px' }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:48, fontWeight:800, letterSpacing:'-0.03em', margin:'0 0 8px' }}>
          Katalog produk
        </h1>
        <p style={{ color:'var(--ink-soft)', fontSize:15, margin:0 }}>{filtered.length} produk siap kirim instan</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:24 }}>
        {/* Sidebar filter */}
        <aside style={{
          background:'var(--surface)', borderRadius:24, padding:20,
          border:`1.5px solid var(--border)`, alignSelf:'start', position:'sticky', top:84,
        }}>
          <div style={{ fontWeight:700, fontSize:13, letterSpacing:'0.05em', textTransform:'uppercase', color:'var(--ink-soft)', marginBottom:12 }}>Kategori</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:24 }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setFilter(f => ({...f, cat:c.id}))} style={{
                padding:'10px 12px', borderRadius:12, border:0, cursor:'pointer',
                background: filter.cat === c.id ? 'var(--ink)' : 'transparent',
                color: filter.cat === c.id ? 'white' : 'var(--ink)',
                fontWeight:600, fontSize:14, textAlign:'left', display:'flex', alignItems:'center', gap:10,
                fontFamily:'inherit',
              }}>
                <span style={{ fontSize:16 }}>{c.emoji}</span>{c.label}
              </button>
            ))}
          </div>

          <div style={{ fontWeight:700, fontSize:13, letterSpacing:'0.05em', textTransform:'uppercase', color:'var(--ink-soft)', marginBottom:12 }}>Harga max</div>
          <input type="range" min={5000} max={50000} step={1000} value={filter.maxPrice}
            onChange={e => setFilter(f => ({...f, maxPrice: +e.target.value}))}
            style={{ width:'100%', accentColor:'var(--primary)' }}
          />
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--ink-soft)', marginTop:6 }}>
            <span>Rp5rb</span>
            <strong style={{color:'var(--primary)'}}>{fmtIDR(filter.maxPrice)}</strong>
          </div>

          <div style={{ marginTop:24, padding:16, background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:16 }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:18, marginBottom:4 }}>Garansi 100%</div>
            <div style={{ fontSize:12, color:'var(--ink)', opacity:0.75 }}>Akun bermasalah? Kami ganti baru atau refund full.</div>
          </div>
        </aside>

        <div>
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16,
            background:'var(--surface)', borderRadius:14, padding:'10px 16px', border:`1.5px solid var(--border)`,
          }}>
            <div style={{ fontSize:13, color:'var(--ink-soft)' }}>Urutkan:</div>
            <div style={{ display:'flex', gap:6 }}>
              {[
                {id:'popular', label:'Populer'},
                {id:'price-low', label:'Termurah'},
                {id:'price-high', label:'Termahal'},
                {id:'rating', label:'Rating tertinggi'},
              ].map(s => (
                <button key={s.id} onClick={() => setFilter(f => ({...f, sort:s.id}))} style={{
                  padding:'6px 12px', borderRadius:999, border:0, cursor:'pointer',
                  background: filter.sort === s.id ? 'var(--primary)' : 'transparent',
                  color: filter.sort === s.id ? 'white' : 'var(--ink-soft)',
                  fontWeight:600, fontSize:12, fontFamily:'inherit',
                }}>{s.label}</button>
              ))}
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          {filtered.length === 0 && (
            <div style={{ padding:48, textAlign:'center', color:'var(--ink-soft)' }}>Yah, ga ada yang cocok 😢 coba ubah filternya.</div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─── Product detail ─────────────────────────────────────────────────────────
function ProductScreen() {
  const { route, setRoute, addToCart, fmt } = useStore();
  const product = PRODUCTS.find(p => p.id === route.id) || PRODUCTS[0];
  const [duration, setDuration] = useState(product.durations[1] || product.durations[0]);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('detail');
  const [countdown, setCountdown] = useState({ h:5, m:42, s:18 });
  const btnRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(c => {
        let { h, m, s } = c;
        s--; if (s < 0) { s = 59; m--; if (m < 0) { m = 59; h--; if (h < 0) h = 23; } }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const durMultiplier = { '1 Bulan':1, '3 Bulan':2.7, '6 Bulan':5, '1 Tahun':9, '2 Tahun':16 };
  const finalPrice = Math.round(product.priceIDR * (durMultiplier[duration] || 1)) * qty;
  const oldPrice = Math.round(product.oldIDR * (durMultiplier[duration] || 1)) * qty;

  return (
    <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20, fontSize:13, color:'var(--ink-soft)' }}>
        <button onClick={() => setRoute({name:'home'})} style={{background:'none',border:0,color:'inherit',cursor:'pointer',padding:0}}>Beranda</button>
        <span>›</span>
        <button onClick={() => setRoute({name:'catalog'})} style={{background:'none',border:0,color:'inherit',cursor:'pointer',padding:0}}>Katalog</button>
        <span>›</span>
        <span style={{color:'var(--ink)'}}>{product.name}</span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:40 }}>
        <div>
          <div style={{
            background:'var(--surface)', borderRadius:32, padding:32,
            border:`1.5px solid var(--border)`, position:'sticky', top:84,
          }}>
            <ProductTile hue={product.hue} emoji={product.emoji} size={420} rounded={24} />
            <div style={{ display:'flex', gap:8, marginTop:16 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{
                  flex:1, height:60, borderRadius:12,
                  background:`oklch(0.${88-i*3} 0.1${3-i} ${product.hue+i*30})`,
                  border: i===0 ? `2px solid var(--primary)` : `1.5px solid var(--border)`,
                  cursor:'pointer',
                }} />
              ))}
            </div>
          </div>
        </div>

        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <span style={{
              padding:'4px 10px', borderRadius:8, background:'rgba(255,107,157,0.12)', color:'var(--primary)',
              fontSize:11, fontWeight:800, letterSpacing:'0.02em',
            }}>● {product.cat === 'streaming' ? 'Streaming' : 'VPN'}</span>
            {product.stock <= 5 && (
              <span style={{ padding:'4px 10px', borderRadius:8, background:'#FEE2E2', color:'#DC2626', fontSize:11, fontWeight:800 }}>
                Sisa {product.stock} stok!
              </span>
            )}
          </div>

          <h1 style={{ fontFamily:'var(--font-display)', fontSize:42, fontWeight:800, letterSpacing:'-0.03em', margin:'0 0 8px' }}>{product.name}</h1>
          <p style={{ fontSize:16, color:'var(--ink-soft)', margin:'0 0 16px' }}>{product.tagline}</p>

          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              {[1,2,3,4,5].map(s => <span key={s} style={{color: s <= Math.round(product.rating) ? '#F59E0B' : '#E5E5E5', fontSize:18}}>★</span>)}
            </div>
            <strong>{product.rating}</strong>
            <span style={{color:'var(--ink-soft)', fontSize:14}}>({product.reviews.toLocaleString('id-ID')} ulasan)</span>
            <span style={{color:'var(--ink-soft)'}}>·</span>
            <span style={{color:'#22C55E', fontSize:14, fontWeight:600}}>{product.reviews+200}+ terjual</span>
          </div>

          {/* Flash deal countdown */}
          <div style={{
            padding:16, borderRadius:16, marginBottom:24,
            background:'var(--surface-2)', border:'1px solid var(--border)',
            display:'flex', alignItems:'center', justifyContent:'space-between',
          }}>
            <div>
              <div style={{ fontSize:11, fontWeight:800, color:'#DC2626', letterSpacing:'0.05em', marginBottom:4 }}>⚡ FLASH DEAL BERAKHIR</div>
              <div style={{ fontSize:13, color:'var(--ink-soft)' }}>Buruan, harga normal kembali setelah ini!</div>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {[{n:countdown.h, l:'jam'},{n:countdown.m, l:'mnt'},{n:countdown.s, l:'dtk'}].map((t,i) => (
                <div key={i} style={{
                  background:'var(--ink)', color:'white', padding:'8px 12px', borderRadius:10,
                  textAlign:'center', minWidth:46,
                }}>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, lineHeight:1, fontVariantNumeric:'tabular-nums' }}>
                    {String(t.n).padStart(2,'0')}
                  </div>
                  <div style={{ fontSize:9, opacity:0.7, marginTop:2 }}>{t.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Duration picker */}
          <div style={{ marginBottom:24 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:10 }}>Pilih durasi</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
              {product.durations.map(d => (
                <button key={d} onClick={() => setDuration(d)} style={{
                  padding:'14px 16px', borderRadius:14, cursor:'pointer',
                  border: duration === d ? `2px solid var(--primary)` : `1.5px solid var(--border)`,
                  background: duration === d ? 'rgba(255,107,157,0.06)' : 'var(--surface)',
                  textAlign:'left', fontFamily:'inherit',
                  position:'relative',
                }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>{d}</div>
                  <div style={{ fontSize:12, color:'var(--ink-soft)', marginTop:2 }}>
                    {fmt(Math.round(product.priceIDR * (durMultiplier[d] || 1)))}
                  </div>
                  {durMultiplier[d] >= 5 && (
                    <div style={{ position:'absolute', top:-8, right:8, padding:'2px 8px', borderRadius:6, background:'var(--mint)', color:'var(--ink)', fontSize:10, fontWeight:800 }}>HEMAT</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Qty */}
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
            <div style={{ fontWeight:700, fontSize:14 }}>Jumlah</div>
            <div style={{ display:'flex', alignItems:'center', border:`1.5px solid var(--border)`, borderRadius:999, overflow:'hidden' }}>
              <button onClick={() => setQty(q => Math.max(1, q-1))} style={{ width:36, height:36, border:0, background:'transparent', fontSize:18, cursor:'pointer', fontWeight:700 }}>−</button>
              <div style={{ width:40, textAlign:'center', fontWeight:700 }}>{qty}</div>
              <button onClick={() => setQty(q => q+1)} style={{ width:36, height:36, border:0, background:'transparent', fontSize:18, cursor:'pointer', fontWeight:700 }}>+</button>
            </div>
          </div>

          {/* Price + buy */}
          <div style={{
            padding:20, borderRadius:20, background:'var(--surface)', border:`1.5px solid var(--border)`,
            marginBottom:24,
          }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:14 }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:800, color:'var(--primary)', letterSpacing:'-0.02em' }}>
                {fmt(finalPrice)}
              </div>
              <div style={{ fontSize:14, color:'var(--ink-soft)', textDecoration:'line-through' }}>{fmt(oldPrice)}</div>
              <div style={{
                padding:'2px 8px', borderRadius:6, background:'#FEE2E2', color:'#DC2626',
                fontSize:11, fontWeight:800,
              }}>HEMAT {fmt(oldPrice - finalPrice)}</div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button
                ref={btnRef}
                onClick={() => {
                  for (let i=0;i<qty;i++) addToCart(product, duration, btnRef.current.getBoundingClientRect());
                }}
                style={{
                  flex:1, padding:'16px', borderRadius:14, cursor:'pointer',
                  border:`1.5px solid var(--ink)`, background:'var(--surface)', color:'var(--ink)',
                  fontWeight:700, fontSize:15, fontFamily:'inherit',
                }}
              >+ Keranjang</button>
              <button onClick={() => {
                addToCart(product, duration, btnRef.current.getBoundingClientRect());
                setRoute({name:'cart'});
              }} style={{
                flex:1.4, padding:'16px', borderRadius:14, cursor:'pointer',
                border:0, background:'var(--ink)', color:'white',
                fontWeight:700, fontSize:15, fontFamily:'inherit',
                boxShadow:'0 8px 24px rgba(26,22,38,0.25)',
              }}>Beli Sekarang →</button>
            </div>
          </div>

          {/* Trust row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:24 }}>
            {[
              {emoji:'⚡', t:'Kirim instan', d:'< 5 menit'},
              {emoji:'◆', t:'Garansi penuh', d:'Selama aktif'},
              {emoji:'♥', t:'Support 24/7', d:'WhatsApp'},
            ].map(b => (
              <div key={b.t} style={{ padding:12, background:'var(--surface)', borderRadius:14, border:`1.5px solid var(--border)`, textAlign:'center' }}>
                <div style={{ fontSize:20, marginBottom:4 }}>{b.emoji}</div>
                <div style={{ fontWeight:700, fontSize:13 }}>{b.t}</div>
                <div style={{ fontSize:11, color:'var(--ink-soft)' }}>{b.d}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ borderTop:`1.5px solid var(--border)`, paddingTop:24 }}>
            <div style={{ display:'flex', gap:6, marginBottom:16 }}>
              {[{id:'detail', label:'Deskripsi'}, {id:'reviews', label:`Ulasan (${product.reviews})`}, {id:'how', label:'Cara pakai'}].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  padding:'10px 16px', borderRadius:999, border:0, cursor:'pointer',
                  background: tab === t.id ? 'var(--ink)' : 'transparent',
                  color: tab === t.id ? 'white' : 'var(--ink-soft)',
                  fontWeight:600, fontSize:13, fontFamily:'inherit',
                }}>{t.label}</button>
              ))}
            </div>

            {tab === 'detail' && (
              <div style={{ fontSize:14, lineHeight:1.7, color:'var(--ink-soft)' }}>
                <p>Akun {product.name} resmi dengan kualitas {product.tagline}. Cocok buat kamu yang suka {product.cat === 'streaming' ? 'nonton serial favorit, film terbaru, dan konten eksklusif' : 'browsing aman, akses tanpa batas geografis, dan privasi maksimal'}.</p>
                <ul style={{ paddingLeft:20, marginTop:12 }}>
                  <li>Akun private, bukan sharing</li>
                  <li>Garansi full selama masa aktif</li>
                  <li>Bisa diakses di {product.cat === 'streaming' ? 'TV, laptop, HP, tablet' : 'semua device'}</li>
                  <li>Pengiriman otomatis via email & dashboard</li>
                </ul>
              </div>
            )}

            {tab === 'reviews' && (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {REVIEWS.map((r,i) => (
                  <div key={i} style={{ padding:16, background:'var(--surface)', borderRadius:16, border:`1.5px solid var(--border)` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                      <div style={{
                        width:36, height:36, borderRadius:'50%',
                        background:`linear-gradient(135deg, oklch(0.85 0.12 ${i*80}), oklch(0.75 0.14 ${(i*80+60)%360}))`,
                        display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800,
                      }}>{r.name[0]}</div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:13 }}>{r.name}</div>
                        <div style={{ fontSize:11, color:'var(--ink-soft)' }}>{r.when}</div>
                      </div>
                      <div style={{ marginLeft:'auto' }}>
                        {[1,2,3,4,5].map(s => <span key={s} style={{color: s <= r.rating ? '#F59E0B' : '#E5E5E5', fontSize:14}}>★</span>)}
                      </div>
                    </div>
                    <div style={{ fontSize:14, color:'var(--ink)' }}>{r.text}</div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'how' && (
              <ol style={{ paddingLeft:20, fontSize:14, lineHeight:1.8, color:'var(--ink-soft)' }}>
                <li>Klik <strong>Beli Sekarang</strong> & pilih metode pembayaran (QRIS / E-wallet)</li>
                <li>Selesaikan pembayaran dalam 15 menit</li>
                <li>Login info dikirim otomatis ke email & dashboard kamu</li>
                <li>Login & nikmati! Ada masalah? Chat CS kami 24/7.</li>
              </ol>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─── Cart ───────────────────────────────────────────────────────────────────
function CartScreen() {
  const { cart, removeFromCart, updateQty, cartTotal, setRoute, fmt } = useStore();

  if (cart.length === 0) {
    return (
      <div style={{ maxWidth:600, margin:'80px auto', padding:'24px', textAlign:'center' }}>
        <div style={{ fontSize:80, marginBottom:16 }}>⛛</div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:800, margin:'0 0 8px' }}>Keranjang masih kosong</h1>
        <p style={{ color:'var(--ink-soft)', marginBottom:24 }}>Yuk pilih akun favoritmu dulu!</p>
        <button onClick={() => setRoute({name:'catalog'})} style={{
          padding:'14px 28px', borderRadius:999, border:0, background:'var(--ink)', color:'white',
          fontWeight:700, fontSize:15, cursor:'pointer', fontFamily:'inherit',
        }}>Mulai belanja →</button>
      </div>
    );
  }

  const fee = 2500;
  const total = cartTotal + fee;

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px' }}>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:42, fontWeight:800, letterSpacing:'-0.03em', margin:'0 0 24px' }}>Keranjang kamu ({cart.length})</h1>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:24 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {cart.map(it => (
            <div key={it.key} style={{
              background:'var(--surface)', borderRadius:20, padding:16,
              border:`1.5px solid var(--border)`, display:'flex', gap:16, alignItems:'center',
            }}>
              <ProductTile hue={it.product.hue} emoji={it.product.emoji} size={80} rounded={14} />
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:15 }}>{it.product.name}</div>
                <div style={{ fontSize:12, color:'var(--ink-soft)', marginTop:2 }}>Durasi: {it.duration}</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, color:'var(--primary)', marginTop:6 }}>
                  {fmt(it.product.priceIDR * it.qty)}
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', border:`1.5px solid var(--border)`, borderRadius:999 }}>
                <button onClick={() => updateQty(it.key, it.qty-1)} style={{ width:32, height:32, border:0, background:'none', fontSize:16, cursor:'pointer', fontWeight:700 }}>−</button>
                <div style={{ width:32, textAlign:'center', fontWeight:700, fontSize:13 }}>{it.qty}</div>
                <button onClick={() => updateQty(it.key, it.qty+1)} style={{ width:32, height:32, border:0, background:'none', fontSize:16, cursor:'pointer', fontWeight:700 }}>+</button>
              </div>
              <button onClick={() => removeFromCart(it.key)} style={{
                width:36, height:36, borderRadius:'50%', border:0, background:'#FEE2E2', color:'#DC2626',
                fontSize:16, cursor:'pointer', fontFamily:'inherit',
              }}>×</button>
            </div>
          ))}
        </div>

        <aside style={{
          background:'var(--surface)', borderRadius:24, padding:24,
          border:`1.5px solid var(--border)`, alignSelf:'start', position:'sticky', top:84,
        }}>
          <div style={{ fontWeight:700, fontSize:16, marginBottom:16 }}>Ringkasan</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10, paddingBottom:16, borderBottom:`1px dashed var(--border)`, marginBottom:16 }}>
            <Row label="Subtotal" value={fmt(cartTotal)} />
            <Row label="Biaya admin" value={fmt(fee)} />
            <Row label="Diskon" value={'−' + fmt(0)} valueColor="#22C55E" />
          </div>
          <Row label="Total" value={fmt(total)} bold />
          <button onClick={() => setRoute({name:'checkout'})} style={{
            marginTop:20, width:'100%', padding:'16px', borderRadius:14, border:0, cursor:'pointer',
            background:'var(--primary)', color:'white', fontWeight:700, fontSize:15,
            fontFamily:'inherit', boxShadow:'0 8px 24px rgba(255,107,157,0.4)',
          }}>Lanjut ke pembayaran →</button>
          <div style={{ marginTop:14, fontSize:11, color:'var(--ink-soft)', textAlign:'center' }}>
            🔒 Pembayaran aman & terenkripsi
          </div>
        </aside>
      </div>
      <Footer />
    </div>
  );
}

function Row({ label, value, bold, valueColor }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', fontSize: bold ? 17 : 13 }}>
      <span style={{ color: bold ? 'var(--ink)' : 'var(--ink-soft)', fontWeight: bold ? 700 : 500 }}>{label}</span>
      <span style={{ fontWeight: bold ? 800 : 600, color: valueColor || 'var(--ink)', fontFamily: bold ? 'var(--font-display)' : 'inherit' }}>{value}</span>
    </div>
  );
}

// ─── Checkout ───────────────────────────────────────────────────────────────
function CheckoutScreen() {
  const { cart, cartTotal, fmt, setRoute, setCart, user } = useStore();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [method, setMethod] = useState('qris');
  const [paying, setPaying] = useState(false);

  const fee = 2500;
  const total = cartTotal + fee;

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setStep(3);
      setCart([]);
    }, 2400);
  };

  if (cart.length === 0 && step < 3) {
    setRoute({name:'cart'});
    return null;
  }

  return (
    <div style={{ maxWidth:900, margin:'0 auto', padding:'24px' }}>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:42, fontWeight:800, letterSpacing:'-0.03em', margin:'0 0 8px' }}>Checkout</h1>

      {/* Stepper */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:32, marginTop:16 }}>
        {['Info','Pembayaran','Selesai'].map((label,i) => (
          <React.Fragment key={i}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{
                width:32, height:32, borderRadius:'50%',
                background: step > i ? 'var(--mint)' : (step === i+1 ? 'var(--ink)' : 'var(--border)'),
                color: step >= i+1 ? (step > i ? 'var(--ink)' : 'white') : 'var(--ink-soft)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontWeight:800, fontSize:13,
              }}>{step > i ? '✓' : i+1}</div>
              <span style={{ fontSize:13, fontWeight: step === i+1 ? 700 : 500, color: step >= i+1 ? 'var(--ink)' : 'var(--ink-soft)' }}>{label}</span>
            </div>
            {i < 2 && <div style={{ flex:1, height:2, background: step > i+1 ? 'var(--mint)' : 'var(--border)' }} />}
          </React.Fragment>
        ))}
      </div>

      {step === 3 ? (
        <div style={{ textAlign:'center', padding:'48px 0' }}>
          <div style={{
            width:120, height:120, borderRadius:'50%', margin:'0 auto 24px',
            background:'var(--primary)', color:'var(--primary-ink)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:56,
            animation:'tk-pop 0.5s cubic-bezier(.3,1.5,.5,1)',
            boxShadow:'0 0 60px rgba(0,255,148,0.4)',
          }}>✓</div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:800, margin:'0 0 8px' }}>Yeay, pesananmu sukses! 🎉</h2>
          <p style={{ color:'var(--ink-soft)', fontSize:15, maxWidth:480, margin:'0 auto 24px' }}>
            Akun akan dikirim otomatis ke email <strong>{email}</strong> dalam 1-5 menit. Cek juga Dashboard kamu ya!
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
            <button onClick={() => setRoute({name:'dashboard'})} style={{
              padding:'14px 24px', borderRadius:999, border:0, background:'var(--ink)', color:'white',
              fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit',
            }}>Lihat pesanan saya</button>
            <button onClick={() => setRoute({name:'home'})} style={{
              padding:'14px 24px', borderRadius:999, border:'1.5px solid var(--border)', background:'transparent',
              fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit',
            }}>Belanja lagi</button>
          </div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:24 }}>
          <div style={{
            background:'var(--surface)', borderRadius:24, padding:24, border:`1.5px solid var(--border)`,
          }}>
            {step === 1 && (
              <div>
                <div style={{ fontWeight:700, fontSize:18, marginBottom:16, fontFamily:'var(--font-display)' }}>Info kontak</div>
                <Field label="Email" value={email} onChange={setEmail} placeholder="kamu@email.com" type="email" />
                <Field label="No. WhatsApp" value={phone} onChange={setPhone} placeholder="08xxxxxxx" />
                <div style={{ padding:12, background:'rgba(127,231,199,0.2)', borderRadius:12, fontSize:12, color:'var(--ink-soft)', marginTop:12 }}>
                  💌 Akun akan dikirim ke email & WhatsApp ini. Pastikan benar ya!
                </div>
                <button
                  disabled={!email || !phone}
                  onClick={() => setStep(2)}
                  style={{
                    marginTop:20, width:'100%', padding:'14px', borderRadius:14, border:0, cursor:'pointer',
                    background: (email && phone) ? 'var(--ink)' : 'var(--border)',
                    color: (email && phone) ? 'white' : 'var(--ink-soft)',
                    fontWeight:700, fontSize:15, fontFamily:'inherit',
                  }}
                >Lanjut ke pembayaran →</button>
              </div>
            )}

            {step === 2 && (
              <div>
                <div style={{ fontWeight:700, fontSize:18, marginBottom:16, fontFamily:'var(--font-display)' }}>Pilih metode pembayaran</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {PAYMENT_METHODS.map(m => (
                    <button key={m.id} onClick={() => setMethod(m.id)} style={{
                      padding:14, borderRadius:14, cursor:'pointer', textAlign:'left',
                      border: method === m.id ? `2px solid var(--primary)` : `1.5px solid var(--border)`,
                      background: method === m.id ? 'rgba(255,107,157,0.06)' : 'var(--surface)',
                      display:'flex', alignItems:'center', gap:14, fontFamily:'inherit',
                    }}>
                      <div style={{
                        width:48, height:48, borderRadius:12,
                        background: `linear-gradient(135deg, oklch(0.85 0.12 ${m.id.length*30}), oklch(0.78 0.14 ${(m.id.length*30+50)%360}))`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        color:'white', fontWeight:800, fontSize:13,
                      }}>{m.name.slice(0,2).toUpperCase()}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:14 }}>{m.name}</div>
                        <div style={{ fontSize:12, color:'var(--ink-soft)' }}>{m.desc}</div>
                      </div>
                      {m.tag && (
                        <div style={{
                          padding:'3px 8px', borderRadius:6, background:'var(--mint)', color:'var(--ink)',
                          fontSize:10, fontWeight:800,
                        }}>{m.tag}</div>
                      )}
                      <div style={{
                        width:20, height:20, borderRadius:'50%',
                        border: method === m.id ? `6px solid var(--primary)` : `2px solid var(--border)`,
                      }} />
                    </button>
                  ))}
                </div>

                {method === 'qris' && (
                  <div style={{ marginTop:20, padding:20, background:'#F8F5FF', borderRadius:16, textAlign:'center' }}>
                    <div style={{ fontWeight:700, marginBottom:10 }}>Scan QRIS</div>
                    <div style={{
                      width:160, height:160, margin:'0 auto', borderRadius:14, background:'white',
                      backgroundImage:`
                        linear-gradient(45deg, var(--ink) 25%, transparent 25%),
                        linear-gradient(-45deg, var(--ink) 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, var(--ink) 75%),
                        linear-gradient(-45deg, transparent 75%, var(--ink) 75%)`,
                      backgroundSize:'14px 14px',
                      backgroundPosition:'0 0, 0 7px, 7px -7px, -7px 0px',
                      border:`2px solid var(--ink)`,
                      position:'relative',
                    }}>
                      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'white', padding:8, borderRadius:8 }}>
                        <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:11 }}>QRIS</div>
                      </div>
                    </div>
                    <div style={{ fontSize:12, color:'var(--ink-soft)', marginTop:10 }}>Berlaku 15 menit</div>
                  </div>
                )}

                <div style={{ display:'flex', gap:10, marginTop:20 }}>
                  <button onClick={() => setStep(1)} style={{
                    padding:'14px 20px', borderRadius:14, cursor:'pointer',
                    border:`1.5px solid var(--border)`, background:'transparent', color:'var(--ink)',
                    fontWeight:700, fontSize:14, fontFamily:'inherit',
                  }}>← Kembali</button>
                  <button
                    onClick={handlePay}
                    disabled={paying}
                    style={{
                      flex:1, padding:'14px', borderRadius:14, border:0, cursor: paying ? 'wait' : 'pointer',
                      background: paying ? 'var(--ink-soft)' : 'var(--primary)',
                      color:'white', fontWeight:700, fontSize:15, fontFamily:'inherit',
                      boxShadow:'0 8px 24px rgba(255,107,157,0.4)',
                      position:'relative', overflow:'hidden',
                    }}
                  >
                    {paying ? (
                      <span style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
                        <span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'tk-spin 0.8s linear infinite', display:'inline-block' }} />
                        Memproses...
                      </span>
                    ) : `Bayar ${fmt(total)} →`}
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside style={{
            background:'var(--surface)', borderRadius:24, padding:20, border:`1.5px solid var(--border)`, alignSelf:'start',
          }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Ringkasan pesanan</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14, paddingBottom:14, borderBottom:`1px dashed var(--border)` }}>
              {cart.map(it => (
                <div key={it.key} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <ProductTile hue={it.product.hue} emoji={it.product.emoji} size={40} rounded={10} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{it.product.name}</div>
                    <div style={{ fontSize:11, color:'var(--ink-soft)' }}>{it.duration} × {it.qty}</div>
                  </div>
                  <div style={{ fontSize:12, fontWeight:700 }}>{fmt(it.product.priceIDR * it.qty)}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14, paddingBottom:14, borderBottom:`1px dashed var(--border)` }}>
              <Row label="Subtotal" value={fmt(cartTotal)} />
              <Row label="Biaya admin" value={fmt(fee)} />
            </div>
            <Row label="Total" value={fmt(total)} bold />
          </aside>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type='text' }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:12, fontWeight:600, color:'var(--ink-soft)', display:'block', marginBottom:6 }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width:'100%', padding:'12px 14px', borderRadius:12, border:`1.5px solid var(--border)`,
          background:'var(--bg)', fontSize:14, fontFamily:'inherit', outline:'none', color:'var(--ink)',
        }}
        onFocus={e => e.currentTarget.style.borderColor='var(--primary)'}
        onBlur={e => e.currentTarget.style.borderColor='var(--border)'}
      />
    </div>
  );
}

// ─── Auth ───────────────────────────────────────────────────────────────────
function AuthScreen() {
  const { setRoute, setUser } = useStore();
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['','','','','','']);
  const [otpError, setOtpError] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const otpRefs = useRef([]);

  const ok = mode === 'login' ? (email && pw) : (email && pw && name);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const submit = () => {
    if (!ok) return;
    if (mode === 'signup') {
      setStep('otp');
      setResendIn(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } else {
      setUser({ name: name || 'Member', email, phone: '08123456789' });
      setRoute({name:'dashboard'});
    }
  };

  const updateOtp = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    setOtpError(false);
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx+1]?.focus();
    if (next.every(d => d !== '')) {
      setTimeout(() => verifyOtp(next.join('')), 150);
    }
  };

  const onOtpKey = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx-1]?.focus();
    }
  };

  const onOtpPaste = (e) => {
    const txt = (e.clipboardData.getData('text') || '').replace(/\D/g,'').slice(0,6);
    if (txt.length === 6) {
      e.preventDefault();
      const next = txt.split('');
      setOtp(next);
      setTimeout(() => verifyOtp(txt), 150);
    }
  };

  const verifyOtp = (code) => {
    // Demo: any 6-digit code works, except '000000'
    if (code === '000000') {
      setOtpError(true);
      setOtp(['','','','','','']);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
      return;
    }
    setUser({ name: name || 'Member', email, phone: '08123456789' });
    setRoute({name:'dashboard'});
  };

  return (
    <div style={{ minHeight:'calc(100vh - 70px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>

      {step === 'otp' ? (
        <div style={{ maxWidth:480, width:'100%' }}>
          <div style={{
            background:'var(--surface)', borderRadius:20, padding:'40px 36px 28px',
            border:`1px solid var(--border)`, boxShadow:'0 1px 2px rgba(0,0,0,0.04), 0 24px 60px rgba(0,0,0,0.06)',
          }}>
            {/* Step indicator */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:32 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontWeight:600, color:'var(--ink-soft)' }}>
                <div style={{ width:18, height:18, borderRadius:'50%', background:'var(--ink)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span style={{ color:'var(--ink)' }}>Detail akun</span>
              </div>
              <div style={{ flex:1, height:1, background:'var(--ink)' }} />
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontWeight:600, color:'var(--ink)' }}>
                <div style={{ width:18, height:18, borderRadius:'50%', background:'var(--ink)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700 }}>2</div>
                <span>Verifikasi</span>
              </div>
            </div>

            {/* Email envelope illustration */}
            <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
              <div style={{ position:'relative', width:88, height:88 }}>
                <div style={{
                  position:'absolute', inset:0, borderRadius:20,
                  background:'linear-gradient(135deg, var(--lilac) 0%, var(--primary) 100%)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 12px 32px rgba(123,97,255,0.25)',
                }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2"/>
                    <polyline points="3 7 12 13 21 7"/>
                  </svg>
                </div>
                {/* Pulsing dot */}
                <div style={{
                  position:'absolute', top:-4, right:-4, width:20, height:20, borderRadius:'50%',
                  background:'#0F8B5C', border:'3px solid var(--surface)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:'white' }} />
                </div>
              </div>
            </div>

            <h2 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:700, letterSpacing:'-0.025em', margin:'0 0 10px', textAlign:'center' }}>
              Masukkan kode verifikasi
            </h2>
            <p style={{ color:'var(--ink-soft)', fontSize:13, margin:'0 0 4px', textAlign:'center', lineHeight:1.5 }}>
              Kami kirim kode 6 digit ke
            </p>
            <p style={{ fontSize:13, fontWeight:600, margin:'0 0 28px', textAlign:'center', wordBreak:'break-all' }}>
              {email || 'kamu@email.com'}
              <button onClick={() => { setStep('form'); setOtp(['','','','','','']); setOtpError(false); }} style={{
                background:'none', border:0, cursor:'pointer', color:'var(--primary)',
                fontWeight:600, fontSize:12, fontFamily:'inherit', padding:'0 0 0 8px',
              }}>Ubah</button>
            </p>

            <div style={{ display:'flex', gap:8, marginBottom:14, justifyContent:'center' }} onPaste={onOtpPaste}>
              {otp.map((d, i) => (
                <React.Fragment key={i}>
                  <input
                    ref={el => otpRefs.current[i] = el}
                    value={d}
                    onChange={e => updateOtp(i, e.target.value)}
                    onKeyDown={e => onOtpKey(i, e)}
                    inputMode="numeric"
                    maxLength={1}
                    style={{
                      width:48, height:60, textAlign:'center',
                      fontSize:24, fontWeight:600, fontFamily:'var(--font-display)',
                      borderRadius:10,
                      border: `1.5px solid ${otpError ? '#DC2626' : (d ? 'var(--ink)' : 'var(--border)')}`,
                      background: otpError ? 'rgba(220,38,38,0.04)' : (d ? 'var(--surface)' : 'var(--surface-2)'),
                      color:'var(--ink)',
                      outline:'none', transition:'all 0.15s',
                      boxShadow: d && !otpError ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
                    }}
                  />
                  {i === 2 && (
                    <div style={{ display:'flex', alignItems:'center', color:'var(--ink-soft)', fontSize:18, fontWeight:300 }}>—</div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {otpError ? (
              <div style={{
                display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                fontSize:12, color:'#DC2626', marginBottom:20, padding:'8px 12px',
                background:'rgba(220,38,38,0.08)', borderRadius:8,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Kode tidak valid. Periksa kembali email kamu.
              </div>
            ) : (
              <div style={{ height:20, marginBottom:20 }} />
            )}

            <div style={{ textAlign:'center', fontSize:13, color:'var(--ink-soft)' }}>
              Tidak menerima kode?{' '}
              {resendIn > 0 ? (
                <span style={{ fontVariantNumeric:'tabular-nums' }}>Kirim ulang dalam <strong style={{ color:'var(--ink)' }}>{resendIn}s</strong></span>
              ) : (
                <button onClick={() => setResendIn(60)} style={{
                  background:'none', border:0, cursor:'pointer', color:'var(--primary)',
                  fontWeight:600, fontSize:13, fontFamily:'inherit', padding:0, textDecoration:'underline', textUnderlineOffset:2,
                }}>Kirim ulang</button>
              )}
            </div>
          </div>

          <div style={{ textAlign:'center', marginTop:20, fontSize:11, color:'var(--ink-soft)', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Verifikasi dilindungi enkripsi end-to-end
          </div>

          <div style={{ textAlign:'center', marginTop:8, fontSize:11, color:'var(--ink-soft)' }}>
            Demo: kode apapun bisa, kecuali <code style={{fontFamily:'ui-monospace,monospace', background:'var(--surface)', border:`1px solid var(--border)`, padding:'1px 5px', borderRadius:4}}>000000</code>
          </div>
        </div>
      ) : (
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, maxWidth:980, width:'100%', alignItems:'center' }}>
        <div style={{ position:'relative', height:440 }}>
          <div style={{
            position:'absolute', top:20, left:20, right:60, bottom:60,
            background:'var(--surface-2)', border:'1px solid var(--border-strong)',
            borderRadius:32, transform:'rotate(-3deg)',
          }} />
          <div style={{
            position:'absolute', top:60, left:60, right:20, bottom:20,
            background:'linear-gradient(135deg, var(--lilac) 0%, #1A1538 100%)',
            borderRadius:32, transform:'rotate(2deg)', display:'flex', alignItems:'center', justifyContent:'center',
            color:'white', boxShadow:'0 30px 80px rgba(123,97,255,0.3)',
          }}>
            <div style={{ textAlign:'center', padding:24 }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:48, fontWeight:800, letterSpacing:'-0.02em', lineHeight:1 }}>
                Welcome<br/>back,<br/>member.
              </div>
              <div style={{ marginTop:16, fontSize:14, opacity:0.85 }}>
                Akses akun favoritmu lebih cepat.
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background:'var(--surface)', borderRadius:32, padding:32, border:`1.5px solid var(--border)`,
          boxShadow:'0 20px 60px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display:'flex', gap:6, marginBottom:24, padding:4, background:'var(--bg)', borderRadius:999 }}>
            {[{id:'login',l:'Masuk'},{id:'signup',l:'Daftar'}].map(t => (
              <button key={t.id} onClick={() => setMode(t.id)} style={{
                flex:1, padding:'10px', borderRadius:999, border:0, cursor:'pointer',
                background: mode === t.id ? 'var(--ink)' : 'transparent',
                color: mode === t.id ? 'white' : 'var(--ink-soft)',
                fontWeight:700, fontSize:13, fontFamily:'inherit',
              }}>{t.l}</button>
            ))}
          </div>

          <h2 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, letterSpacing:'-0.02em', margin:'0 0 4px' }}>
            {mode === 'login' ? 'Masuk akun' : 'Buat akun baru'}
          </h2>
          <p style={{ color:'var(--ink-soft)', fontSize:13, margin:'0 0 20px' }}>
            {mode === 'login' ? 'Selamat datang kembali!' : 'Gratis, cuma butuh 30 detik.'}
          </p>

          {mode === 'signup' && <Field label="Nama" value={name} onChange={setName} placeholder="Nama lengkap" />}
          <Field label="Email" value={email} onChange={setEmail} placeholder="kamu@email.com" type="email" />
          <Field label="Password" value={pw} onChange={setPw} placeholder="••••••••" type="password" />

          <button onClick={submit} disabled={!ok} style={{
            width:'100%', padding:'14px', borderRadius:14, border:0, cursor: ok ? 'pointer' : 'not-allowed',
            background: ok ? 'var(--primary)' : 'var(--border)',
            color: ok ? 'white' : 'var(--ink-soft)',
            fontWeight:700, fontSize:15, fontFamily:'inherit',
            boxShadow: ok ? '0 8px 24px rgba(255,107,157,0.4)' : 'none',
            marginTop:8,
          }}>{mode === 'login' ? 'Masuk' : 'Kirim kode verifikasi'} →</button>

          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0', color:'var(--ink-soft)', fontSize:11 }}>
            <div style={{ flex:1, height:1, background:'var(--border)' }} />
            <span>atau</span>
            <div style={{ flex:1, height:1, background:'var(--border)' }} />
          </div>

          <button onClick={submit} style={{
            width:'100%', padding:'12px', borderRadius:14, cursor:'pointer',
            border:`1.5px solid var(--border)`, background:'var(--surface)',
            fontWeight:600, fontSize:14, fontFamily:'inherit',
            display:'flex', alignItems:'center', justifyContent:'center', gap:10,
          }}>
            <span style={{ width:18, height:18, borderRadius:'50%', background:'linear-gradient(135deg,#4285F4,#EA4335,#FBBC05,#34A853)' }} />
            Lanjut dengan Google
          </button>
        </div>
      </div>
      )}
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────────────
function DashboardScreen() {
  const { user, setRoute, setUser, fmt } = useStore();
  const [tab, setTab] = useState('orders');

  if (!user) {
    setRoute({name:'auth'});
    return null;
  }

  const activeOrders = ORDERS_DATA.filter(o => o.status === 'Aktif');
  const totalSpent = ORDERS_DATA.reduce((s,o)=>s+o.total, 0);
  const nextRenewal = activeOrders.reduce((min, o) => o.daysLeft < min.daysLeft ? o : min, activeOrders[0] || { daysLeft: 0, product:'-' });

  return (
    <div style={{ maxWidth:1280, margin:'0 auto', padding:'24px' }}>
      <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:32 }}>
        <aside style={{
          alignSelf:'start', position:'sticky', top:84,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24, padding:'10px 12px', borderRadius:12, background:'var(--surface)', border:`1px solid var(--border)` }}>
            <div style={{
              width:36, height:36, borderRadius:10, background:'var(--ink)',
              display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:600, fontSize:13,
              fontFamily:'var(--font-display)',
            }}>{user.name[0]}</div>
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ fontWeight:600, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.name}</div>
              <div style={{ fontSize:11, color:'var(--ink-soft)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.email}</div>
            </div>
          </div>

          <div style={{ fontSize:10, fontWeight:600, color:'var(--ink-soft)', letterSpacing:'0.08em', textTransform:'uppercase', padding:'0 12px 8px' }}>Akun</div>
          <div style={{ display:'flex', flexDirection:'column', gap:2, marginBottom:16 }}>
            {[
              {id:'orders', l:'Overview'},
              {id:'active', l:'Langganan aktif', count:activeOrders.length},
              {id:'profile', l:'Profil & keamanan'},
              {id:'help', l:'Pusat bantuan'},
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding:'8px 12px', borderRadius:8, border:0, cursor:'pointer',
                background: tab === t.id ? 'var(--surface)' : 'transparent',
                color: 'var(--ink)',
                fontWeight: tab === t.id ? 600 : 500, fontSize:13, textAlign:'left',
                display:'flex', alignItems:'center', justifyContent:'space-between',
                fontFamily:'inherit',
                boxShadow: tab === t.id ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
                border: tab === t.id ? `1px solid var(--border)` : '1px solid transparent',
              }}>
                <span>{t.l}</span>
                {t.count != null && (
                  <span style={{ fontSize:11, fontWeight:600, color:'var(--ink-soft)', background:'var(--surface-2)', padding:'1px 6px', borderRadius:6 }}>{t.count}</span>
                )}
              </button>
            ))}
          </div>

          <button onClick={() => { setUser(null); setRoute({name:'home'}); }} style={{
            padding:'8px 12px', borderRadius:8, border:0, background:'transparent',
            color:'var(--ink-soft)', fontWeight:500, fontSize:13, textAlign:'left', cursor:'pointer',
            width:'100%', fontFamily:'inherit',
          }}>Keluar →</button>
        </aside>

        <div style={{ minWidth:0 }}>
          {tab === 'orders' && (
            <div>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:12, color:'var(--ink-soft)', fontWeight:500, marginBottom:6 }}>Selamat datang kembali</div>
                <h1 style={{ fontFamily:'var(--font-display)', fontSize:30, fontWeight:700, letterSpacing:'-0.025em', margin:0 }}>{user.name.split(' ')[0]} 👋</h1>
              </div>

              {/* Hero status card */}
              <div style={{
                background:'var(--surface)', borderRadius:16, border:`1px solid var(--border)`,
                padding:24, marginBottom:24, display:'grid', gridTemplateColumns:'1fr auto', gap:24, alignItems:'center',
              }}>
                <div>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'3px 10px', borderRadius:6, background:'rgba(15,139,92,0.1)', color:'#0F8B5C', fontSize:11, fontWeight:600, marginBottom:12 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:'#0F8B5C' }} />
                    {activeOrders.length} langganan aktif
                  </div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:600, letterSpacing:'-0.02em', marginBottom:6 }}>
                    Perpanjangan berikutnya dalam {nextRenewal.daysLeft} hari
                  </div>
                  <div style={{ fontSize:13, color:'var(--ink-soft)' }}>{nextRenewal.product} · {nextRenewal.duration || ''}</div>
                </div>
                <button onClick={() => setRoute({name:'catalog'})} style={{
                  padding:'10px 16px', borderRadius:8, border:0, cursor:'pointer',
                  background:'var(--ink)', color:'white', fontWeight:600, fontSize:13, fontFamily:'inherit',
                }}>+ Beli langganan baru</button>
              </div>

              {/* Stat tiles */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:32 }}>
                {[
                  {l:'Total order', n:ORDERS_DATA.length, sub:'sepanjang waktu'},
                  {l:'Aktif', n:activeOrders.length, sub:'langganan berjalan'},
                  {l:'Total belanja', n:fmt(totalSpent), sub:'sepanjang waktu', big:true},
                  {l:'Total hemat', n:fmt(285000), sub:'vs harga retail', big:true},
                ].map(s => (
                  <div key={s.l} style={{ padding:16, borderRadius:12, background:'var(--surface)', border:`1px solid var(--border)` }}>
                    <div style={{ fontSize:11, fontWeight:500, color:'var(--ink-soft)', marginBottom:8 }}>{s.l}</div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize: s.big ? 18 : 24, fontWeight:600, letterSpacing:'-0.02em', color:'var(--ink)' }}>{s.n}</div>
                    <div style={{ fontSize:11, color:'var(--ink-soft)', marginTop:4 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Orders table */}
              <div style={{ marginBottom:12, display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:600, letterSpacing:'-0.01em', margin:0 }}>Riwayat order</h2>
                <button style={{ background:'none', border:0, color:'var(--ink-soft)', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>Filter ▾</button>
              </div>
              <div style={{ background:'var(--surface)', borderRadius:12, border:`1px solid var(--border)`, overflow:'hidden' }}>
                <div style={{
                  display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr 1fr 100px 70px',
                  padding:'12px 16px', fontSize:11, fontWeight:600, color:'var(--ink-soft)',
                  letterSpacing:'0.04em', textTransform:'uppercase',
                  borderBottom:`1px solid var(--border)`, background:'var(--surface-2)',
                }}>
                  <div>Produk</div>
                  <div>Order ID</div>
                  <div>Tanggal</div>
                  <div>Total</div>
                  <div>Status</div>
                  <div></div>
                </div>
                {ORDERS_DATA.map((o, i) => {
                  const prod = PRODUCTS.find(p => p.name === o.product) || PRODUCTS[0];
                  return (
                    <div key={o.id} style={{
                      display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr 1fr 100px 70px',
                      padding:'14px 16px', alignItems:'center', fontSize:13,
                      borderBottom: i < ORDERS_DATA.length - 1 ? `1px solid var(--border)` : 0,
                    }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <ProductTile hue={prod.hue} emoji={prod.emoji} size={32} rounded={6} />
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontWeight:600, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{o.product}</div>
                          <div style={{ fontSize:11, color:'var(--ink-soft)' }}>{o.duration}</div>
                        </div>
                      </div>
                      <div style={{ fontSize:12, fontFamily:'ui-monospace,monospace', color:'var(--ink-soft)' }}>{o.id}</div>
                      <div style={{ fontSize:12, color:'var(--ink-soft)' }}>{o.date}</div>
                      <div style={{ fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{fmt(o.total)}</div>
                      <div>
                        <span style={{
                          display:'inline-flex', alignItems:'center', gap:5,
                          padding:'2px 8px', borderRadius:5, fontSize:11, fontWeight:600,
                          background: o.status === 'Aktif' ? 'rgba(15,139,92,0.1)' : 'var(--surface-2)',
                          color: o.status === 'Aktif' ? '#0F8B5C' : 'var(--ink-soft)',
                          border: `1px solid ${o.status === 'Aktif' ? 'rgba(15,139,92,0.2)' : 'var(--border)'}`,
                        }}>
                          <span style={{ width:5, height:5, borderRadius:'50%', background: o.status === 'Aktif' ? '#0F8B5C' : 'var(--ink-soft)' }} />
                          {o.status}
                        </span>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <button style={{ background:'none', border:0, color:'var(--ink-soft)', fontSize:13, cursor:'pointer', padding:4 }}>⋯</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'active' && (
            <div>
              <div style={{ marginBottom:24 }}>
                <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:600, letterSpacing:'-0.02em', margin:'0 0 6px' }}>Langganan aktif</h1>
                <p style={{ color:'var(--ink-soft)', fontSize:13, margin:0 }}>Kelola akses akun, lihat kredensial, dan perpanjang langganan.</p>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {activeOrders.map(o => {
                  const prod = PRODUCTS.find(p => p.name === o.product) || PRODUCTS[0];
                  const pct = Math.min(100, Math.max(0, (o.daysLeft / 365) * 100));
                  const expiringSoon = o.daysLeft < 14;
                  return (
                    <div key={o.id} style={{
                      background:'var(--surface)', borderRadius:12, padding:20, border:`1px solid var(--border)`,
                    }}>
                      <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:16 }}>
                        <ProductTile hue={prod.hue} emoji={prod.emoji} size={44} rounded={10} />
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                            <div style={{ fontWeight:600, fontSize:15 }}>{prod.name}</div>
                            <span style={{
                              display:'inline-flex', alignItems:'center', gap:4,
                              padding:'1px 7px', borderRadius:4, fontSize:10, fontWeight:600,
                              background: expiringSoon ? 'rgba(217,119,6,0.1)' : 'rgba(15,139,92,0.1)',
                              color: expiringSoon ? '#B45309' : '#0F8B5C',
                              border: `1px solid ${expiringSoon ? 'rgba(217,119,6,0.2)' : 'rgba(15,139,92,0.2)'}`,
                            }}>
                              <span style={{ width:5, height:5, borderRadius:'50%', background: expiringSoon ? '#B45309' : '#0F8B5C' }} />
                              {expiringSoon ? 'Akan berakhir' : 'Aktif'}
                            </span>
                          </div>
                          <div style={{ fontSize:12, color:'var(--ink-soft)' }}>{o.duration} · Order {o.id}</div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:18, fontVariantNumeric:'tabular-nums' }}>{o.daysLeft}</div>
                          <div style={{ fontSize:11, color:'var(--ink-soft)' }}>hari tersisa</div>
                        </div>
                      </div>

                      <div style={{ height:4, background:'var(--surface-2)', borderRadius:999, overflow:'hidden', marginBottom:16 }}>
                        <div style={{
                          height:'100%', width:`${pct}%`,
                          background: expiringSoon ? '#D97706' : '#0F8B5C',
                        }} />
                      </div>

                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                        <div style={{ background:'var(--surface-2)', borderRadius:8, padding:'10px 12px', border:`1px solid var(--border)` }}>
                          <div style={{ fontSize:10, fontWeight:600, color:'var(--ink-soft)', marginBottom:3, letterSpacing:'0.04em', textTransform:'uppercase' }}>Email</div>
                          <div style={{ fontFamily:'ui-monospace,monospace', fontSize:12, fontWeight:500 }}>user•{prod.id}@stream.mail</div>
                        </div>
                        <div style={{ background:'var(--surface-2)', borderRadius:8, padding:'10px 12px', border:`1px solid var(--border)` }}>
                          <div style={{ fontSize:10, fontWeight:600, color:'var(--ink-soft)', marginBottom:3, letterSpacing:'0.04em', textTransform:'uppercase' }}>Password</div>
                          <div style={{ fontFamily:'ui-monospace,monospace', fontSize:12, fontWeight:500, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <span>••••••••••</span>
                            <button style={{ background:'none', border:0, color:'var(--ink-soft)', cursor:'pointer', fontSize:11, fontWeight:500, padding:0, fontFamily:'inherit' }}>Tampilkan</button>
                          </div>
                        </div>
                      </div>

                      <div style={{ display:'flex', gap:8 }}>
                        <button style={{
                          flex:1, padding:'9px 14px', borderRadius:8, border:`1px solid var(--border)`, cursor:'pointer',
                          background:'var(--surface)', color:'var(--ink)', fontWeight:500, fontSize:12, fontFamily:'inherit',
                        }}>Salin kredensial</button>
                        <button style={{
                          flex:1, padding:'9px 14px', borderRadius:8, border:0, cursor:'pointer',
                          background:'var(--ink)', color:'white', fontWeight:500, fontSize:12, fontFamily:'inherit',
                        }}>{expiringSoon ? 'Perpanjang sekarang' : 'Perpanjang'}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'profile' && (
            <div>
              <div style={{ marginBottom:24 }}>
                <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:600, letterSpacing:'-0.02em', margin:'0 0 6px' }}>Profil & keamanan</h1>
                <p style={{ color:'var(--ink-soft)', fontSize:13, margin:0 }}>Update info kontak dan kelola password akun lapakurab kamu.</p>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div style={{ background:'var(--surface)', borderRadius:12, border:`1px solid var(--border)`, overflow:'hidden' }}>
                  <div style={{ padding:'14px 18px', borderBottom:`1px solid var(--border)`, background:'var(--surface-2)' }}>
                    <div style={{ fontWeight:600, fontSize:13 }}>Informasi kontak</div>
                    <div style={{ fontSize:11, color:'var(--ink-soft)', marginTop:2 }}>Dipakai untuk kirim invoice & info akun.</div>
                  </div>
                  <div style={{ padding:18 }}>
                    <Field label="Nama" value={user.name} onChange={(v)=>setUser({...user, name:v})} />
                    <Field label="Email" value={user.email} onChange={(v)=>setUser({...user, email:v})} />
                    <Field label="No. WhatsApp" value={user.phone} onChange={(v)=>setUser({...user, phone:v})} />
                    <button style={{
                      marginTop:4, padding:'9px 16px', borderRadius:8, border:0, cursor:'pointer',
                      background:'var(--ink)', color:'white', fontWeight:600, fontSize:12, fontFamily:'inherit',
                    }}>Simpan perubahan</button>
                  </div>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  <div style={{ background:'var(--surface)', borderRadius:12, border:`1px solid var(--border)`, overflow:'hidden' }}>
                    <div style={{ padding:'14px 18px', borderBottom:`1px solid var(--border)`, background:'var(--surface-2)' }}>
                      <div style={{ fontWeight:600, fontSize:13 }}>Keamanan</div>
                    </div>
                    <div style={{ padding:18 }}>
                      {[
                        {l:'Password', s:'Terakhir diubah 2 bulan lalu', a:'Ubah'},
                        {l:'2-Factor auth', s:'Belum aktif', a:'Aktifkan'},
                        {l:'Sesi aktif', s:'2 perangkat', a:'Kelola'},
                      ].map((r,i,arr) => (
                        <div key={r.l} style={{
                          display:'flex', alignItems:'center', justifyContent:'space-between',
                          padding:'10px 0', borderBottom: i < arr.length - 1 ? `1px solid var(--border)` : 0,
                        }}>
                          <div>
                            <div style={{ fontWeight:500, fontSize:13 }}>{r.l}</div>
                            <div style={{ fontSize:11, color:'var(--ink-soft)' }}>{r.s}</div>
                          </div>
                          <button style={{ background:'none', border:`1px solid var(--border)`, color:'var(--ink)', padding:'5px 10px', borderRadius:6, fontSize:11, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>{r.a}</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background:'var(--surface)', borderRadius:12, border:`1px solid var(--border)`, padding:18 }}>
                    <div style={{ fontWeight:600, fontSize:13, marginBottom:4 }}>Zona berbahaya</div>
                    <div style={{ fontSize:11, color:'var(--ink-soft)', marginBottom:12 }}>Hapus akun lapakurab beserta semua data secara permanen.</div>
                    <button style={{ background:'none', border:`1px solid #DC2626`, color:'#DC2626', padding:'7px 12px', borderRadius:6, fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>Hapus akun</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'help' && (
            <div>
              <div style={{ marginBottom:24 }}>
                <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:600, letterSpacing:'-0.02em', margin:'0 0 6px' }}>Pusat bantuan</h1>
                <p style={{ color:'var(--ink-soft)', fontSize:13, margin:0 }}>Punya kendala? Cari jawaban di FAQ atau langsung chat support kami.</p>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
                {[
                  {l:'Chat WhatsApp', s:'Avg. 2 menit', a:'Buka →'},
                  {l:'Email support', s:'Avg. 4 jam', a:'Kirim →'},
                  {l:'Status sistem', s:'Semua sistem normal', a:'Lihat →', ok:true},
                ].map(c => (
                  <div key={c.l} style={{ background:'var(--surface)', borderRadius:12, border:`1px solid var(--border)`, padding:14 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                      {c.ok && <span style={{ width:6, height:6, borderRadius:'50%', background:'#0F8B5C' }} />}
                      <div style={{ fontWeight:600, fontSize:13 }}>{c.l}</div>
                    </div>
                    <div style={{ fontSize:11, color:'var(--ink-soft)', marginBottom:10 }}>{c.s}</div>
                    <button style={{ background:'none', border:0, color:'var(--ink)', padding:0, fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>{c.a}</button>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom:12 }}>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, margin:0 }}>Pertanyaan umum</h2>
              </div>
              <div style={{ background:'var(--surface)', borderRadius:12, border:`1px solid var(--border)`, overflow:'hidden' }}>
                {[
                  {q:'Akun saya tidak bisa login. Apa yang harus saya lakukan?', a:'Coba reset password via dashboard kamu, atau chat CS untuk garansi instan dalam < 10 menit.'},
                  {q:'Berapa lama pengiriman setelah pembayaran?', a:'Otomatis dalam 5 menit setelah pembayaran sukses. Jika lebih, hubungi support.'},
                  {q:'Apakah saya bisa refund?', a:'Bisa, selama akun belum dipakai atau ada kendala teknis dari sisi kami dalam 24 jam pertama.'},
                  {q:'Sampai kapan garansi berlaku?', a:'Selama masa aktif paket yang kamu beli. Akun bermasalah? Kami ganti gratis.'},
                  {q:'Apakah satu akun bisa dipakai banyak orang?', a:'Tergantung paket. Cek detail di halaman produk masing-masing — tertulis berapa profil/device yang didukung.'},
                ].map((f,i,arr) => (
                  <details key={i} style={{ borderBottom: i < arr.length - 1 ? `1px solid var(--border)` : 0 }}>
                    <summary style={{
                      padding:'14px 18px', cursor:'pointer', fontWeight:500, fontSize:13,
                      display:'flex', justifyContent:'space-between', alignItems:'center', listStyle:'none',
                    }}>
                      <span>{f.q}</span>
                      <span style={{ color:'var(--ink-soft)', fontSize:14 }}>+</span>
                    </summary>
                    <div style={{ padding:'0 18px 14px', fontSize:13, color:'var(--ink-soft)', lineHeight:1.6 }}>{f.a}</div>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─── Search results ─────────────────────────────────────────────────────────
function SearchScreen() {
  const { search, setSearch } = useStore();
  const results = useMemo(() => {
    if (!search.trim()) return PRODUCTS;
    const q = search.toLowerCase();
    return PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q) || p.cat.includes(q));
  }, [search]);

  return (
    <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px' }}>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:800, letterSpacing:'-0.03em', margin:'0 0 8px' }}>
        Hasil pencarian: <span style={{ color:'var(--primary)' }}>"{search}"</span>
      </h1>
      <p style={{ color:'var(--ink-soft)', margin:'0 0 24px' }}>{results.length} produk ditemukan</p>
      {results.length === 0 ? (
        <div style={{ padding:48, textAlign:'center', background:'var(--surface)', borderRadius:24, border:`1.5px solid var(--border)` }}>
          <div style={{ fontSize:48, marginBottom:12 }}>?</div>
          <div style={{ fontWeight:700, fontSize:18, marginBottom:6 }}>Hmm, ga nemu nih.</div>
          <div style={{ color:'var(--ink-soft)' }}>Coba kata kunci lain atau lihat katalog lengkap.</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
          {results.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
      <Footer />
    </div>
  );
}

// ─── Footer ─────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      marginTop:64, padding:'40px 0 24px', borderTop:`1.5px solid var(--border)`,
      display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:32,
    }}>
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
          <div style={{
            width:36, height:36, borderRadius:12,
            background:'linear-gradient(135deg, var(--primary), var(--lilac))',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'white', fontWeight:900, fontSize:18, fontFamily:'var(--font-display)',
            transform:'rotate(-6deg)',
          }}>Lk</div>
          <div style={{ fontWeight:700, fontSize:18, fontFamily:'var(--font-display)' }}>lapakurab<span style={{color:'var(--primary)'}}>_</span></div>
        </div>
        <p style={{ fontSize:13, color:'var(--ink-soft)', lineHeight:1.6, maxWidth:300, margin:0 }}>
          Marketplace akun digital premium. Garansi penuh, kirim instan via QRIS & e-wallet.
        </p>
      </div>
      {[
        { h:'Belanja', l:['Streaming','VPN','Promo','Best seller'] },
        { h:'Bantuan', l:['Cara order','Garansi','FAQ','Hubungi CS'] },
        { h:'Tentang', l:['Tentang kami','Blog','Reseller','Karir'] },
      ].map(c => (
        <div key={c.h}>
          <div style={{ fontWeight:700, fontSize:13, marginBottom:10 }}>{c.h}</div>
          <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:6, fontSize:13, color:'var(--ink-soft)' }}>
            {c.l.map(x => <li key={x} style={{cursor:'pointer'}}>{x}</li>)}
          </ul>
        </div>
      ))}
      <div style={{ gridColumn:'1 / -1', paddingTop:20, borderTop:`1px solid var(--border)`, fontSize:12, color:'var(--ink-soft)', display:'flex', justifyContent:'space-between' }}>
        <span>© 2026 lapakurab. Semua hak dilindungi.</span>
        <span>Made with ♥ in Jakarta</span>
      </div>
    </footer>
  );
}

// ─── Toast & fly-to-cart ────────────────────────────────────────────────────
function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div style={{
      position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)',
      background:'var(--ink)', color:'white', padding:'12px 20px', borderRadius:999,
      fontSize:13, fontWeight:600, zIndex:200,
      boxShadow:'0 12px 40px rgba(0,0,0,0.3)',
      animation:'tk-toast 0.3s cubic-bezier(.3,1.4,.5,1)',
      display:'flex', alignItems:'center', gap:8,
    }}>
      <span style={{ width:20, height:20, borderRadius:'50%', background:'var(--mint)', color:'var(--ink)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800 }}>✓</span>
      {toast.msg}
    </div>
  );
}

function FlyToCart() {
  const { flyAnim } = useStore();
  if (!flyAnim) return null;
  // Find cart icon target
  const cartBtn = document.querySelector('[data-cart-target]');
  const target = cartBtn ? cartBtn.getBoundingClientRect() : { left: window.innerWidth - 200, top: 30 };
  return (
    <div key={flyAnim.ts} style={{
      position:'fixed', left:flyAnim.rect.left, top:flyAnim.rect.top,
      width:38, height:38, borderRadius:'50%',
      background:`oklch(0.85 0.15 ${flyAnim.hue})`,
      zIndex:300, pointerEvents:'none',
      animation:`tk-fly-${Math.round(target.left)}-${Math.round(target.top)} 0.7s cubic-bezier(.5,0,.7,1) forwards`,
      // Use transform via inline styles + setTimeout for simplicity
    }} ref={el => {
      if (!el) return;
      const dx = target.left + 20 - flyAnim.rect.left;
      const dy = target.top + 20 - flyAnim.rect.top;
      el.animate([
        { transform:'translate(0,0) scale(1)', opacity:1 },
        { transform:`translate(${dx*0.5}px, ${dy*0.3}px) scale(0.8)`, opacity:0.9, offset:0.5 },
        { transform:`translate(${dx}px, ${dy}px) scale(0.2)`, opacity:0 },
      ], { duration:700, easing:'cubic-bezier(.5,0,.7,1)' });
    }} />
  );
}

// ─── Compare bar + modal ──────────────────────────────────────────────────
function CompareBar() {
  const { compareList, clearCompare, toggleCompare, setCompareOpen, fmt } = useStore();
  if (compareList.length === 0) return null;

  return (
    <div style={{
      position:'fixed', left:'50%', bottom:24, transform:'translateX(-50%)',
      zIndex:80,
      background:'var(--surface)', borderRadius:24, border:`1.5px solid var(--border)`,
      boxShadow:'0 18px 50px rgba(0,0,0,0.18)',
      padding:'10px 12px 10px 14px',
      display:'flex', alignItems:'center', gap:14,
      maxWidth:'min(640px, calc(100vw - 32px))',
      animation:'compareBarSlide 0.25s ease-out',
    }}>
      <style>{`@keyframes compareBarSlide { from { transform: translate(-50%, 30px); opacity:0; } to { transform: translate(-50%, 0); opacity:1; } }`}</style>
      <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
        <div style={{ fontSize:11, color:'var(--ink-soft)', fontWeight:600 }}>Bandingkan</div>
        <div style={{ fontSize:13, fontWeight:700 }}>{compareList.length}/3 dipilih</div>
      </div>
      <div style={{ display:'flex', gap:6, alignItems:'center' }}>
        {compareList.map(p => (
          <div key={p.id} style={{ position:'relative' }} title={p.name}>
            <ProductTile hue={p.hue} emoji={p.emoji} size={38} rounded={9} />
            <button onClick={() => toggleCompare(p.id)}
              aria-label={`Hapus ${p.name}`}
              style={{
                position:'absolute', top:-4, right:-4, width:18, height:18, borderRadius:'50%',
                background:'var(--ink)', color:'white', border:'2px solid var(--surface)',
                cursor:'pointer', fontSize:10, fontWeight:700, padding:0,
                display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1,
              }}>×</button>
          </div>
        ))}
        {Array.from({length: 3 - compareList.length}).map((_,i) => (
          <div key={'empty'+i} style={{
            width:38, height:38, borderRadius:9, border:`2px dashed var(--border)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'var(--ink-soft)', fontSize:18, opacity:0.5,
          }}>+</div>
        ))}
      </div>
      <div style={{ flex:1 }} />
      <button onClick={clearCompare} style={{
        background:'none', border:0, color:'var(--ink-soft)', fontSize:12, cursor:'pointer',
        fontFamily:'inherit', padding:'6px 8px',
      }}>Reset</button>
      <button onClick={() => setCompareOpen(true)} disabled={compareList.length < 2}
        style={{
          padding:'10px 18px', borderRadius:999, border:0,
          background: compareList.length < 2 ? 'var(--surface-2)' : 'var(--primary)',
          color: compareList.length < 2 ? 'var(--ink-soft)' : 'white',
          fontWeight:700, fontSize:13, fontFamily:'inherit',
          cursor: compareList.length < 2 ? 'not-allowed' : 'pointer',
          display:'flex', alignItems:'center', gap:6,
        }}>
        Bandingkan →
      </button>
    </div>
  );
}

function CompareModal() {
  const { compareOpen, setCompareOpen, compareList, fmt, addToCart, setRoute, toggleCompare } = useStore();

  useEffect(() => {
    if (!compareOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setCompareOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [compareOpen]);

  if (!compareOpen || compareList.length === 0) return null;

  const featuresFor = (p) => {
    const f = {};
    f['Kategori'] = p.cat === 'vpn' ? 'VPN' : 'Streaming';
    f['Harga'] = fmt(p.priceIDR);
    f['Harga normal'] = fmt(p.oldIDR);
    f['Diskon'] = Math.round(((p.oldIDR - p.priceIDR) / p.oldIDR) * 100) + '%';
    f['Rating'] = `★ ${p.rating} (${p.reviews > 999 ? (p.reviews/1000).toFixed(1)+'k' : p.reviews})`;
    f['Pilihan durasi'] = p.durations.join(', ');
    f['Stok tersedia'] = p.stock + ' akun';
    f['Kualitas'] = p.tagline;
    return f;
  };

  const allKeys = ['Kategori','Harga','Harga normal','Diskon','Rating','Pilihan durasi','Stok tersedia','Kualitas'];

  // best price highlight
  const cheapestPrice = Math.min(...compareList.map(p => p.priceIDR));
  const highestRating = Math.max(...compareList.map(p => p.rating));
  const mostStock = Math.max(...compareList.map(p => p.stock));
  const biggestDisc = Math.max(...compareList.map(p => Math.round(((p.oldIDR - p.priceIDR) / p.oldIDR) * 100)));

  const isBest = (key, p) => {
    if (key === 'Harga') return p.priceIDR === cheapestPrice;
    if (key === 'Rating') return p.rating === highestRating;
    if (key === 'Stok tersedia') return p.stock === mostStock;
    if (key === 'Diskon') return Math.round(((p.oldIDR - p.priceIDR) / p.oldIDR) * 100) === biggestDisc;
    return false;
  };

  return (
    <div onClick={() => setCompareOpen(false)} style={{
      position:'fixed', inset:0, zIndex:90,
      background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:20,
      animation:'fadeIn 0.2s',
    }}>
      <style>{`@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }`}</style>
      <div onClick={e => e.stopPropagation()} style={{
        background:'var(--bg)', borderRadius:24, width:'100%', maxWidth:980,
        maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column',
        border:`1.5px solid var(--border)`,
      }}>
        <div style={{
          padding:'20px 26px', borderBottom:`1px solid var(--border)`,
          display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--surface)',
        }}>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, letterSpacing:'-0.02em' }}>
              Bandingkan {compareList.length} produk
            </div>
            <div style={{ fontSize:12, color:'var(--ink-soft)', marginTop:2 }}>
              Yang ter-<span style={{ color:'var(--primary)', fontWeight:700 }}>highlight pink</span> = pilihan terbaik di kategorinya.
            </div>
          </div>
          <button onClick={() => setCompareOpen(false)} style={{
            width:36, height:36, borderRadius:'50%', border:`1px solid var(--border)`,
            background:'var(--surface)', cursor:'pointer', fontSize:16, color:'var(--ink-soft)',
          }}>✕</button>
        </div>

        <div style={{ overflow:'auto', flex:1 }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr>
                <th style={{ width:140, padding:'14px 18px', textAlign:'left', position:'sticky', left:0, background:'var(--bg)', zIndex:1, borderBottom:`1px solid var(--border)` }}></th>
                {compareList.map(p => (
                  <th key={p.id} style={{ padding:'14px 18px', textAlign:'left', borderBottom:`1px solid var(--border)`, background:'var(--bg)', minWidth:200 }}>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      <div style={{ position:'relative', width:'100%' }}>
                        <ProductTile hue={p.hue} emoji={p.emoji} name={p.name} cat={p.cat} size="100%" rounded={12} />
                        <button onClick={() => toggleCompare(p.id)} aria-label="Hapus dari perbandingan" style={{
                          position:'absolute', top:6, right:6, width:24, height:24, borderRadius:'50%',
                          background:'rgba(255,255,255,0.95)', color:'var(--ink)', border:0,
                          cursor:'pointer', fontSize:12, fontWeight:700,
                          display:'flex', alignItems:'center', justifyContent:'center',
                        }}>×</button>
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, letterSpacing:'-0.01em' }}>{p.name}</div>
                        <div style={{ fontSize:11, color:'var(--ink-soft)' }}>{p.tagline}</div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allKeys.map((key, i) => (
                <tr key={key} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--bg)' }}>
                  <td style={{
                    padding:'12px 18px', fontSize:11, fontWeight:700, color:'var(--ink-soft)',
                    textTransform:'uppercase', letterSpacing:'0.06em',
                    position:'sticky', left:0, background:'inherit', zIndex:1,
                    verticalAlign:'top',
                  }}>{key}</td>
                  {compareList.map(p => {
                    const val = featuresFor(p)[key];
                    const best = isBest(key, p);
                    return (
                      <td key={p.id} style={{
                        padding:'12px 18px', verticalAlign:'top',
                        background: best ? 'rgba(255,107,157,0.10)' : 'transparent',
                        position:'relative',
                      }}>
                        <span style={{ fontWeight: best ? 700 : 500, color:'var(--ink)' }}>{val}</span>
                        {best && (
                          <span style={{
                            display:'inline-block', marginLeft:6,
                            padding:'1px 6px', borderRadius:5,
                            background:'var(--primary)', color:'white',
                            fontSize:9, fontWeight:700, letterSpacing:'0.04em', textTransform:'uppercase',
                          }}>Terbaik</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <td style={{ padding:'14px 18px', position:'sticky', left:0, background:'var(--bg)', borderTop:`1px solid var(--border)` }}></td>
                {compareList.map(p => (
                  <td key={p.id} style={{ padding:'14px 18px', borderTop:`1px solid var(--border)`, background:'var(--bg)' }}>
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      <button onClick={() => { addToCart(p, p.durations[0]); setCompareOpen(false); }} style={{
                        padding:'10px 14px', borderRadius:8, border:0, cursor:'pointer',
                        background:'var(--primary)', color:'white',
                        fontWeight:700, fontSize:12, fontFamily:'inherit',
                      }}>+ Keranjang</button>
                      <button onClick={() => { setRoute({name:'product', id:p.id}); setCompareOpen(false); }} style={{
                        padding:'8px 14px', borderRadius:8, cursor:'pointer',
                        background:'var(--surface)', color:'var(--ink)', border:`1px solid var(--border)`,
                        fontWeight:600, fontSize:12, fontFamily:'inherit',
                      }}>Detail</button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────
function StoreApp({ currency='IDR', dark=false, font='clean' }) {
  // Soft Cloud: calm cream + sky blue, friendly & trustworthy
  const themeVars = dark ? {
    '--bg': '#0A0A0A',
    '--surface': '#141414',
    '--surface-2': '#1C1C1C',
    '--ink': '#F5F5F5',
    '--ink-soft': '#9A9A9A',
    '--primary': '#5B8DEF',
    '--primary-ink': '#FFFFFF',
    '--mint': '#5B8DEF',
    '--lilac': '#B4A7E8',
    '--peach': '#FFB4A2',
    '--sky': '#5B8DEF',
    '--border': '#262626',
    '--border-strong': '#333333',
    '--shadow': '0 8px 32px rgba(0,0,0,0.6)',
    '--font-body': font === 'groovy' ? '"DM Sans", system-ui, sans-serif'
                  : font === 'editorial' ? '"Inter", system-ui, sans-serif'
                  : '"Plus Jakarta Sans", system-ui, sans-serif',
    '--font-display': font === 'groovy' ? '"Space Grotesk", system-ui, sans-serif'
                     : font === 'editorial' ? '"Fraunces", Georgia, serif'
                     : '"Plus Jakarta Sans", system-ui, sans-serif',
  } : {
    '--bg': '#F4F1EC',
    '--surface': '#FFFFFF',
    '--surface-2': '#FAF7F1',
    '--ink': '#22304A',
    '--ink-soft': '#7A8499',
    '--primary': '#5B8DEF',           // calm sky blue
    '--primary-ink': '#FFFFFF',
    '--mint': '#B4E4D0',              // soft mint
    '--lilac': '#B4A7E8',             // soft lilac
    '--peach': '#FFB4A2',             // soft peach
    '--sky': '#9FD4FF',               // soft sky
    '--border': '#E5DFD4',
    '--border-strong': '#D5CFC4',
    '--shadow': '0 8px 32px rgba(34,48,74,0.06)',
    '--font-body': font === 'groovy' ? '"DM Sans", system-ui, sans-serif'
                  : font === 'editorial' ? '"Inter", system-ui, sans-serif'
                  : '"Plus Jakarta Sans", system-ui, sans-serif',
    '--font-display': font === 'groovy' ? '"Space Grotesk", system-ui, sans-serif'
                     : font === 'editorial' ? '"Fraunces", Georgia, serif'
                     : '"Plus Jakarta Sans", system-ui, sans-serif',
  };

  return (
    <StoreProvider currency={currency} dark={dark} font={font}>
      <div style={{
        ...themeVars,
        background:'var(--bg)', color:'var(--ink)', minHeight:'100vh',
        fontFamily:'var(--font-body)', fontSize:14,
      }}>
        <TopBar />
        <RouteContent />
        <Toast />
        <FlyToCart />
        <CompareBar />
        <CompareModal />
      </div>
    </StoreProvider>
  );
}

function RouteContent() {
  const { route } = useStore();
  switch (route.name) {
    case 'home': return <HomeScreen />;
    case 'catalog': return <CatalogScreen />;
    case 'product': return <ProductScreen />;
    case 'cart': return <CartScreen />;
    case 'checkout': return <CheckoutScreen />;
    case 'auth': return <AuthScreen />;
    case 'dashboard': return <DashboardScreen />;
    case 'search': return <SearchScreen />;
    default: return <HomeScreen />;
  }
}

window.StoreApp = StoreApp;
