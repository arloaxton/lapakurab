// Soft Cloud variant — calm cream + sky blue, friendly rounded sans, gradient blobs

const SoftCloudApp = ({ currency='IDR' }) => {
  const themeVars = {
    '--bg': '#F4F1EC',
    '--surface': '#FFFFFF',
    '--ink': '#22304A',
    '--ink-soft': '#7A8499',
    '--primary': '#5B8DEF',
    '--accent': '#FFB4A2',
    '--accent2': '#B4E4D0',
    '--accent3': '#FFE5A0',
    '--border': '#E5DFD4',
    '--font-body': '"Plus Jakarta Sans", system-ui, sans-serif',
    '--font-display': '"Plus Jakarta Sans", system-ui, sans-serif',
  };

  const products = [
    { name:'Streamflix Premium', price:25000, hue:340, stock:12 },
    { name:'Tunify Family', price:18000, hue:140, stock:8 },
    { name:'CloudVPN Pro', price:15000, hue:220, stock:24 },
    { name:'Disnia+ Hotstart', price:22000, hue:265, stock:5 },
  ];

  const fmt = (n) => 'Rp' + n.toLocaleString('id-ID');

  return (
    <div style={{
      ...themeVars,
      background:'var(--bg)', color:'var(--ink)', minHeight:'100vh',
      fontFamily:'var(--font-body)', fontSize:14,
    }}>
      {/* Top */}
      <div style={{
        padding:'18px 32px', display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:40, height:40, borderRadius:14,
            background:'linear-gradient(135deg, var(--primary), var(--accent2))',
            position:'relative', overflow:'hidden',
          }}>
            <div style={{ position:'absolute', inset:6, borderRadius:8, background:'rgba(255,255,255,0.5)', backdropFilter:'blur(4px)' }} />
          </div>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, letterSpacing:'-0.02em' }}>cloud<span style={{color:'var(--primary)'}}>shop</span></div>
        </div>
        <div style={{ display:'flex', gap:24, fontSize:13, color:'var(--ink-soft)', fontWeight:500 }}>
          {['Beranda','Katalog','Promo','Bantuan'].map(n => <span key={n} style={{cursor:'pointer'}}>{n}</span>)}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button style={{
            padding:'10px 16px', borderRadius:999, border:`1px solid var(--border)`,
            background:'var(--surface)', cursor:'pointer', fontWeight:600, fontSize:13, fontFamily:'inherit',
          }}>Masuk</button>
          <button style={{
            padding:'10px 16px', borderRadius:999, border:0,
            background:'var(--ink)', color:'white', cursor:'pointer', fontWeight:600, fontSize:13, fontFamily:'inherit',
          }}>Keranjang · 2</button>
        </div>
      </div>

      {/* Hero */}
      <section style={{ padding:'40px 32px', position:'relative', overflow:'hidden' }}>
        <div style={{
          position:'absolute', top:-80, right:-40, width:340, height:340, borderRadius:'50%',
          background:'radial-gradient(circle, var(--accent), transparent 70%)', opacity:0.6, filter:'blur(20px)',
        }} />
        <div style={{
          position:'absolute', bottom:-100, left:-60, width:300, height:300, borderRadius:'50%',
          background:'radial-gradient(circle, var(--accent2), transparent 70%)', opacity:0.7, filter:'blur(30px)',
        }} />
        <div style={{ position:'relative', textAlign:'center', maxWidth:780, margin:'0 auto', padding:'40px 0' }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px',
            background:'rgba(255,255,255,0.7)', backdropFilter:'blur(8px)', borderRadius:999,
            fontSize:12, fontWeight:600, marginBottom:24,
          }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent2)' }} />
            Marketplace akun premium #1 di Indonesia
          </div>
          <h1 style={{
            fontFamily:'var(--font-display)', fontSize:64, lineHeight:1.05, fontWeight:700,
            letterSpacing:'-0.03em', margin:'0 0 20px',
          }}>
            Akun favoritmu,<br/>
            <em style={{
              fontStyle:'italic', fontWeight:500,
              background:'linear-gradient(135deg, var(--primary), var(--accent))',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            }}>tinggal pilih.</em>
          </h1>
          <p style={{ fontSize:16, color:'var(--ink-soft)', lineHeight:1.6, margin:'0 auto 32px', maxWidth:520 }}>
            Streaming, VPN, dan layanan premium lainnya — dengan harga yang bersahabat dan pengiriman dalam hitungan menit.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
            <button style={{
              padding:'14px 28px', borderRadius:999, border:0, cursor:'pointer',
              background:'var(--ink)', color:'white', fontWeight:600, fontSize:14, fontFamily:'inherit',
            }}>Mulai jelajah</button>
            <button style={{
              padding:'14px 28px', borderRadius:999, cursor:'pointer',
              background:'transparent', border:`1px solid var(--ink)`, color:'var(--ink)',
              fontWeight:600, fontSize:14, fontFamily:'inherit',
            }}>Lihat promo bulan ini</button>
          </div>

          {/* Trust bar */}
          <div style={{ display:'flex', gap:32, justifyContent:'center', marginTop:40, fontSize:12, color:'var(--ink-soft)' }}>
            <span>★ 4.9/5 dari 4.812 ulasan</span>
            <span>· Garansi 100%</span>
            <span>· Kirim &lt; 5 menit</span>
          </div>
        </div>
      </section>

      {/* Products */}
      <section style={{ padding:'24px 32px 64px' }}>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:20 }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:700, letterSpacing:'-0.02em', margin:0 }}>Pilihan minggu ini</h2>
          <button style={{ background:'none', border:0, color:'var(--primary)', fontWeight:600, cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>Lihat semua →</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
          {products.map((p,i) => (
            <div key={i} style={{
              background:'var(--surface)', borderRadius:24, padding:16,
              border:`1px solid var(--border)`,
            }}>
              <div style={{
                aspectRatio:'1', borderRadius:18,
                background:`linear-gradient(135deg, oklch(0.85 0.12 ${p.hue}), oklch(0.78 0.14 ${(p.hue+50)%360}))`,
                position:'relative', marginBottom:12, overflow:'hidden',
              }}>
                <div style={{
                  position:'absolute', top:'-20%', right:'-10%', width:'60%', height:'60%',
                  borderRadius:'50%', background:'rgba(255,255,255,0.4)', filter:'blur(20px)',
                }} />
              </div>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{p.name}</div>
              <div style={{ fontSize:11, color:'var(--ink-soft)', marginBottom:10 }}>★ 4.9 · {p.stock} stok</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:10, color:'var(--ink-soft)' }}>Mulai dari</div>
                  <div style={{ fontWeight:700, fontSize:16, color:'var(--primary)' }}>{fmt(p.price)}</div>
                </div>
                <button style={{
                  width:34, height:34, borderRadius:'50%', border:0, cursor:'pointer',
                  background:'var(--ink)', color:'white', fontSize:16, fontWeight:600, fontFamily:'inherit',
                }}>+</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

window.SoftCloudApp = SoftCloudApp;
