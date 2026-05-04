// Acid Pop variant — high-contrast lime + black + magenta brutalist-meets-playful
// Reuses the StoreApp logic via wrapper; just overrides theme tokens & some chrome

const AcidPopApp = ({ currency='IDR' }) => {
  const themeVars = {
    '--bg': '#0A0A0A',
    '--surface': '#141414',
    '--ink': '#FAFAFA',
    '--ink-soft': '#9A9A9A',
    '--primary': '#D4FF3D',
    '--mint': '#FF2E93',
    '--lilac': '#00E5FF',
    '--peach': '#FFB800',
    '--sky': '#7B61FF',
    '--border': '#262626',
    '--font-body': '"JetBrains Mono", ui-monospace, monospace',
    '--font-display': '"Archivo Black", "Archivo", sans-serif',
  };

  return (
    <div style={{
      ...themeVars,
      background:'var(--bg)', color:'var(--ink)', minHeight:'100vh',
      fontFamily:'var(--font-body)', fontSize:13,
    }}>
      {/* Use the same StoreApp shell but with Acid theme — render a styled landing */}
      <AcidLanding />
    </div>
  );
};

function AcidLanding() {
  const products = window.__ACID_PRODUCTS || [
    { name:'NETFLIX•UHD', price:'25K', stock:12, hue:140 },
    { name:'SPOTIFY•FAM', price:'18K', stock:8, hue:280 },
    { name:'NORDVPN', price:'15K', stock:24, hue:55 },
    { name:'DISNEY+', price:'22K', stock:5, hue:200 },
  ];

  return (
    <div style={{ padding:'0' }}>
      {/* Top marquee */}
      <div style={{
        background:'var(--primary)', color:'#000', padding:'8px 0',
        fontFamily:'var(--font-display)', fontSize:11, letterSpacing:'0.1em',
        whiteSpace:'nowrap', overflow:'hidden',
      }}>
        <div style={{ display:'inline-block', animation:'marq 20s linear infinite', paddingLeft:'100%' }}>
          ★ FLASH SALE 70% OFF ★ KIRIM INSTAN ★ GARANSI 100% ★ QRIS / E-WALLET ★ FLASH SALE 70% OFF ★ KIRIM INSTAN ★ GARANSI 100% ★
        </div>
      </div>

      {/* Top bar */}
      <div style={{
        padding:'18px 32px', borderBottom:`1px solid var(--border)`, display:'flex', alignItems:'center', justifyContent:'space-between',
        position:'sticky', top:0, background:'var(--bg)', zIndex:10,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            background:'var(--primary)', color:'#000', padding:'4px 10px',
            fontFamily:'var(--font-display)', fontSize:18, letterSpacing:'-0.02em', transform:'skewX(-8deg)',
          }}>AKUN.MART</div>
          <div style={{ fontSize:10, color:'var(--ink-soft)', textTransform:'uppercase', letterSpacing:'0.1em' }}>v.26</div>
        </div>
        <div style={{ display:'flex', gap:0, fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>
          {['SHOP','HOT_DEALS','GUIDE','MASUK'].map((n,i) => (
            <button key={n} style={{
              background:'transparent', border:0, color:'var(--ink)', padding:'8px 14px',
              fontFamily:'inherit', cursor:'pointer', fontSize:11,
              borderRight: i < 3 ? `1px solid var(--border)` : 0,
            }}>{n}</button>
          ))}
        </div>
        <button style={{
          background:'var(--mint)', color:'#fff', border:0, padding:'10px 18px',
          fontFamily:'var(--font-display)', fontSize:12, letterSpacing:'0.05em', cursor:'pointer',
        }}>CART [02]</button>
      </div>

      {/* Hero */}
      <section style={{ padding:'40px 32px 0', position:'relative' }}>
        <div style={{
          fontSize:11, color:'var(--primary)', fontFamily:'var(--font-display)',
          letterSpacing:'0.2em', marginBottom:14,
        }}>// DIGITAL_GOODS / RESMI / 2026 //</div>
        <h1 style={{
          fontFamily:'var(--font-display)', fontSize:'clamp(60px, 11vw, 180px)', lineHeight:0.85,
          letterSpacing:'-0.04em', margin:0, fontWeight:900, textTransform:'uppercase',
        }}>
          AKUN<br/>
          <span style={{ color:'var(--primary)' }}>PREMIUM</span><br/>
          <span style={{ WebkitTextStroke:`2px var(--ink)`, color:'transparent' }}>HARGA RECEH.</span>
        </h1>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginTop:32, paddingBottom:32, borderBottom:`1px solid var(--border)` }}>
          <div style={{ maxWidth:420, fontSize:13, lineHeight:1.5, color:'var(--ink-soft)' }}>
            &gt; Streaming, VPN, &amp; tools premium dengan kualitas resmi dan garansi penuh. Bayar QRIS atau e-wallet. Kirim &lt; 5 menit ke email kamu.
          </div>
          <button style={{
            background:'var(--primary)', color:'#000', border:0, padding:'18px 32px',
            fontFamily:'var(--font-display)', fontSize:16, letterSpacing:'0.02em', cursor:'pointer',
            display:'inline-flex', alignItems:'center', gap:10,
          }}>BROWSE_KATALOG →</button>
        </div>
      </section>

      {/* Product grid */}
      <section style={{ padding:'32px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:24, letterSpacing:'-0.02em' }}>BEST_SELLERS<span style={{color:'var(--primary)'}}>/</span></div>
          <div style={{ fontSize:11, color:'var(--ink-soft)' }}>04 OF 18 ITEMS</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0, border:`1px solid var(--border)` }}>
          {products.map((p, i) => (
            <div key={i} style={{
              padding:20, borderRight: i<3 ? `1px solid var(--border)` : 0,
              background:'var(--surface)', position:'relative',
            }}>
              <div style={{
                width:'100%', aspectRatio:'1', background:`oklch(0.7 0.2 ${p.hue})`,
                marginBottom:16, position:'relative', overflow:'hidden',
              }}>
                <div style={{
                  position:'absolute', inset:0,
                  background:`repeating-linear-gradient(45deg, transparent 0 12px, rgba(0,0,0,0.1) 12px 14px)`,
                }} />
                <div style={{
                  position:'absolute', top:8, left:8, background:'#000', color:'var(--primary)',
                  fontFamily:'var(--font-display)', fontSize:10, padding:'3px 8px',
                }}>#{String(i+1).padStart(2,'0')}</div>
                <div style={{
                  position:'absolute', bottom:8, right:8, fontFamily:'var(--font-display)', fontSize:32,
                  color:'#000',
                }}>{p.name.slice(0,2)}</div>
              </div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:14, marginBottom:6 }}>{p.name}</div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:11 }}>
                <span style={{ color:'var(--ink-soft)' }}>STOCK: {p.stock}</span>
                <span style={{ background:'var(--primary)', color:'#000', padding:'3px 8px', fontFamily:'var(--font-display)' }}>RP{p.price}</span>
              </div>
              <button style={{
                width:'100%', marginTop:12, padding:'10px', background:'transparent',
                border:`1px solid var(--ink)`, color:'var(--ink)', cursor:'pointer',
                fontFamily:'var(--font-display)', fontSize:11, letterSpacing:'0.05em',
              }}>+ ADD_TO_CART</button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'32px', display:'grid', gridTemplateColumns:'2fr 1fr', gap:0, border:`1px solid var(--border)`, margin:'0 32px 32px' }}>
        <div style={{ padding:32, background:'var(--mint)', color:'#fff' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:11, letterSpacing:'0.2em', marginBottom:8 }}>// 24/7 SUPPORT</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:48, lineHeight:1, letterSpacing:'-0.03em' }}>BERMASALAH?<br/>KAMI GANTI.</div>
        </div>
        <div style={{ padding:32, background:'var(--primary)', color:'#000', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:11, letterSpacing:'0.2em' }}>// REVIEWS</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:64, lineHeight:1 }}>4.9<span style={{fontSize:24}}>/5</span></div>
          <div style={{ fontSize:10, opacity:0.7 }}>1.284 ULASAN VERIFIED</div>
        </div>
      </section>
    </div>
  );
}

window.AcidPopApp = AcidPopApp;
