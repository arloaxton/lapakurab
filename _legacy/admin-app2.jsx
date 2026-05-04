// admin-app2.jsx — Phase 2 modules: Settings, ProductDetail, UserDetail, AuditLog
// Depends on admin-app.jsx (uses useAdmin, useStateA, helpers, primaryBtn etc via globals)

const useStateB = React.useState;
const useEffectB = React.useEffect;
const useMemoB = React.useMemo;
const useRefB = React.useRef;

// ─── Settings page ──────────────────────────────────────────────────────────
function SettingsPage() {
  const { settings, updateSettings, logAudit } = useAdmin();
  const [form, setForm] = useStateB(settings);
  const [saved, setSaved] = useStateB(false);
  const fileRef = useRefB(null);

  useEffectB(() => setForm(settings), [settings]);

  const upd = (k, v) => setForm(f => ({...f, [k]: v}));

  const onLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { alert('Maks 500KB ya bro'); return; }
    const reader = new FileReader();
    reader.onload = () => upd('logo', reader.result);
    reader.readAsDataURL(file);
  };

  const onSave = () => {
    updateSettings(form);
    logAudit('settings.update', 'Pengaturan toko', 'Konfigurasi diperbarui');
    setSaved(true);
    setTimeout(()=>setSaved(false), 2000);
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Konfigurasi toko, customer service, notifikasi, dan automasi."
        action={
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {saved && <span style={{ fontSize:12, color:'var(--success)', fontWeight:600 }}>✓ Tersimpan</span>}
            <button onClick={onSave} style={primaryBtn}>Simpan perubahan</button>
          </div>
        }
      />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {/* Info toko */}
        <SettingsCard title="Info toko" desc="Identitas brand yang muncul di invoice & email.">
          <FormRow label="Nama toko">
            <input value={form.storeName} onChange={e=>upd('storeName', e.target.value)} style={inpStyle} />
          </FormRow>
          <FormRow label="Tagline">
            <input value={form.storeTagline} onChange={e=>upd('storeTagline', e.target.value)} style={inpStyle} />
          </FormRow>
          <FormRow label="Logo (PNG/SVG, maks 500KB)">
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{
                width:64, height:64, borderRadius:10, border:'1.5px dashed var(--border-strong)',
                display:'flex', alignItems:'center', justifyContent:'center',
                background: form.logo ? 'var(--surface)' : 'var(--surface-2)', overflow:'hidden',
              }}>
                {form.logo
                  ? <img src={form.logo} alt="logo" style={{ maxWidth:'80%', maxHeight:'80%' }} />
                  : <span style={{ color:'var(--ink-soft)', fontSize:24, fontFamily:'var(--font-display)', fontWeight:800 }}>N</span>}
              </div>
              <div style={{ flex:1 }}>
                <input ref={fileRef} type="file" accept="image/*" onChange={onLogo} style={{ display:'none' }} />
                <button onClick={()=>fileRef.current?.click()} style={secondaryBtn}>Upload logo</button>
                {form.logo && <button onClick={()=>upd('logo','')} style={{...secondaryBtn, marginLeft:6, color:'var(--danger)'}}>Hapus</button>}
              </div>
            </div>
          </FormRow>
          <FormRow label="Prefix nomor invoice">
            <input value={form.invoicePrefix} onChange={e=>upd('invoicePrefix', e.target.value.toUpperCase().slice(0,5))}
              style={{...inpStyle, fontFamily:'ui-monospace,monospace'}} />
            <div style={{ fontSize:11, color:'var(--ink-soft)', marginTop:4 }}>Contoh: <code>{form.invoicePrefix}-2841</code></div>
          </FormRow>
          <FormRow label="Tax / PPN (%)">
            <input type="number" min="0" max="100" step="0.1" value={form.taxPercent}
              onChange={e=>upd('taxPercent', +e.target.value)} style={inpStyle} />
          </FormRow>
        </SettingsCard>

        {/* Customer service */}
        <SettingsCard title="Customer service" desc="Channel kontak yang ditampilkan ke pelanggan.">
          <FormRow label="WhatsApp CS">
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
              <span style={{ padding:'10px 12px', background:'var(--surface-2)', borderRadius:8, border:'1.5px solid var(--border)', fontSize:13, color:'var(--ink-soft)' }}>📱</span>
              <input value={form.csWA} onChange={e=>upd('csWA', e.target.value)} style={inpStyle} placeholder="+62 812-..." />
            </div>
          </FormRow>
          <FormRow label="Email customer service">
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
              <span style={{ padding:'10px 12px', background:'var(--surface-2)', borderRadius:8, border:'1.5px solid var(--border)', fontSize:13, color:'var(--ink-soft)' }}>✉</span>
              <input type="email" value={form.csEmail} onChange={e=>upd('csEmail', e.target.value)} style={inpStyle} />
            </div>
          </FormRow>

          <div style={{ marginTop:18, padding:12, background:'var(--surface-2)', borderRadius:8, border:'1px solid var(--border)' }}>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--ink)', marginBottom:6 }}>Preview di toko</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              <a href={`https://wa.me/${form.csWA.replace(/\D/g,'')}`} style={previewLinkStyle('#25D366')}>💬 Chat WhatsApp</a>
              <a href={`mailto:${form.csEmail}`} style={previewLinkStyle('var(--primary)')}>✉ Email kami</a>
            </div>
          </div>
        </SettingsCard>

        {/* Email notifikasi */}
        <SettingsCard title="Notifikasi email" desc="Trigger email ke admin saat event penting terjadi.">
          <FormRow label="Email penerima notifikasi">
            <input type="email" value={form.notifEmail} onChange={e=>upd('notifEmail', e.target.value)} style={inpStyle} />
          </FormRow>
          <NotifToggle label="Pesanan baru masuk" desc="Email tiap kali ada order baru."
            value={form.notifyOnOrder} onChange={v=>upd('notifyOnOrder', v)} />
          <NotifToggle label="Stok produk menipis" desc="Alert saat stok ≤ threshold."
            value={form.notifyOnLowStock} onChange={v=>upd('notifyOnLowStock', v)} />
          <NotifToggle label="Refund diproses" desc="Notifikasi refund yang dijalankan."
            value={form.notifyOnRefund} onChange={v=>upd('notifyOnRefund', v)} />
        </SettingsCard>

        {/* Automasi */}
        <SettingsCard title="Automasi" desc="Rule otomatis untuk operasional toko.">
          <NotifToggle label="Auto-delivery"
            desc="Setelah pembayaran terverifikasi, kirim kredensial otomatis dari pool stok."
            value={form.autoDelivery} onChange={v=>upd('autoDelivery', v)} />
          <NotifToggle label="Auto-pause produk stok kosong"
            desc="Produk dengan stok 0 otomatis di-nonaktifkan dari katalog."
            value={form.autoPauseOutOfStock} onChange={v=>upd('autoPauseOutOfStock', v)} />
          <FormRow label={`Threshold "stok menipis": ${form.lowStockThreshold} akun`}>
            <input type="range" min="1" max="20" value={form.lowStockThreshold}
              onChange={e=>upd('lowStockThreshold', +e.target.value)} style={{ width:'100%' }} />
          </FormRow>
        </SettingsCard>
      </div>
    </div>
  );
}

function SettingsCard({ title, desc, children }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:20 }}>
      <div style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:15, letterSpacing:'-0.01em', marginBottom:3 }}>{title}</div>
      <div style={{ fontSize:12, color:'var(--ink-soft)', marginBottom:18 }}>{desc}</div>
      {children}
    </div>
  );
}

function NotifToggle({ label, desc, value, onChange }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:14, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:500 }}>{label}</div>
        <div style={{ fontSize:11, color:'var(--ink-soft)', marginTop:2 }}>{desc}</div>
      </div>
      <label style={{ position:'relative', display:'inline-block', width:36, height:20, cursor:'pointer', flexShrink:0, marginTop:2 }}>
        <input type="checkbox" checked={value} onChange={e=>onChange(e.target.checked)} style={{ opacity:0, width:0, height:0 }} />
        <span style={{
          position:'absolute', inset:0, borderRadius:999,
          background: value ? 'var(--ink)' : 'var(--border)', transition:'0.2s',
        }}>
          <span style={{
            position:'absolute', top:2, left: value ? 18 : 2, width:16, height:16,
            borderRadius:'50%', background:'white', transition:'0.2s',
            boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </span>
      </label>
    </div>
  );
}

function previewLinkStyle(color) {
  return {
    padding:'5px 10px', borderRadius:6, background: color, color:'white',
    fontSize:11, fontWeight:600, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:5,
  };
}

// ─── Product Detail page ────────────────────────────────────────────────────
function ProductDetailPage() {
  const { products, orders, stock, pageParam, navigate, updateProducts, logAudit } = useAdmin();
  const [tab, setTab] = useStateB('info');
  const product = products.find(p => p.id === pageParam);

  if (!product) return (
    <div>
      <PageHeader title="Produk tidak ditemukan" />
      <button onClick={()=>navigate('products')} style={primaryBtn}>← Kembali</button>
    </div>
  );

  const productOrders = orders.filter(o => o.product === product.name);
  const productStock = stock.filter(s => s.productId === product.id);
  const totalSold = productOrders.filter(o => o.status === 'paid' || o.status === 'delivered').length;
  const revenue = productOrders.filter(o => o.status === 'paid' || o.status === 'delivered').reduce((s,o)=>s+o.total, 0);

  return (
    <div>
      <button onClick={()=>navigate('products')} style={{ ...secondaryBtn, marginBottom:12, fontSize:12 }}>← Kembali ke produk</button>

      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:24, marginBottom:14, display:'flex', alignItems:'center', gap:20 }}>
        <div style={{
          width:78, height:78, borderRadius:14, flexShrink:0,
          background:`linear-gradient(135deg, oklch(0.5 0.2 ${product.hue}), oklch(0.32 0.14 ${product.hue}))`,
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'white', fontWeight:700, fontFamily:'var(--font-display)', fontSize:34,
        }}>{product.emoji || product.name[0]}</div>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:600, letterSpacing:'-0.02em', margin:0 }}>{product.name}</h1>
            <StatusPill status={product.active ? 'active' : 'inactive'} />
          </div>
          <div style={{ color:'var(--ink-soft)', fontSize:13, marginBottom:8 }}>{product.tagline}</div>
          <div style={{ display:'flex', gap:14, fontSize:12, color:'var(--ink-soft)' }}>
            <span><span style={{ color:'var(--ink)', fontWeight:600 }}>{fmtIDRA(product.priceIDR)}</span> · harga jual</span>
            <span style={{ color:'var(--border-strong)' }}>·</span>
            <span><span style={{ color:'var(--ink)', fontWeight:600 }}>{product.cat === 'vpn' ? 'VPN' : 'Streaming'}</span> · kategori</span>
            <span style={{ color:'var(--border-strong)' }}>·</span>
            <span>★ <span style={{ color:'var(--ink)', fontWeight:600 }}>{product.rating}</span> ({product.reviews} review)</span>
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
        <StatCard label="Stok pool" value={productStock.filter(s=>s.status==='available').length} accent="var(--mint)" />
        <StatCard label="Total terjual" value={totalSold} accent="var(--primary)" />
        <StatCard label="Revenue" value={fmtIDRA(revenue)} accent="var(--lilac)" />
        <StatCard label="Stok di field" value={product.stock} accent={product.stock <= 5 ? 'var(--danger)' : 'var(--peach)'} />
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:0, borderBottom:'1px solid var(--border)', marginBottom:18 }}>
        {[
          {id:'info', l:'Info produk'},
          {id:'stock', l:`Stok akun (${productStock.length})`},
          {id:'orders', l:`Riwayat order (${productOrders.length})`},
        ].map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:'10px 16px', background:'transparent', border:0, cursor:'pointer',
            fontSize:13, fontWeight: tab === t.id ? 600 : 500,
            color: tab === t.id ? 'var(--ink)' : 'var(--ink-soft)',
            borderBottom: tab === t.id ? '2px solid var(--ink)' : '2px solid transparent',
            marginBottom:-1, fontFamily:'inherit',
          }}>{t.l}</button>
        ))}
      </div>

      {tab === 'info' && (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:22, maxWidth:600 }}>
          <DetailRow label="Nama">{product.name}</DetailRow>
          <DetailRow label="Tagline">{product.tagline}</DetailRow>
          <DetailRow label="Kategori">{product.cat === 'vpn' ? 'VPN' : 'Streaming'}</DetailRow>
          <DetailRow label="Harga jual">{fmtIDRA(product.priceIDR)}</DetailRow>
          <DetailRow label="Harga coret">{fmtIDRA(product.oldIDR)}</DetailRow>
          <DetailRow label="Stok di field">{product.stock}</DetailRow>
          <DetailRow label="Durasi">{product.durations.join(', ')}</DetailRow>
          <DetailRow label="Rating">★ {product.rating} ({product.reviews} review)</DetailRow>
          <DetailRow label="Status">{product.active ? 'Aktif' : 'Nonaktif'}</DetailRow>
        </div>
      )}

      {tab === 'stock' && (
        <TableShell
          columns={['Email','Password','Status','Ditambahkan']}
          rows={productStock.map(s => [
            <code key="e" style={{ fontFamily:'ui-monospace,monospace', fontSize:12 }}>{s.email}</code>,
            <code key="p" style={{ fontFamily:'ui-monospace,monospace', fontSize:12, color:'var(--ink-soft)' }}>{s.password}</code>,
            <StatusPill key="s" status={s.status} />,
            <span key="a" style={{ fontSize:12, color:'var(--ink-soft)' }}>{adminFmtDate(s.addedAt)}</span>,
          ])}
          empty="Belum ada stok untuk produk ini. Buka tab Stok akun untuk import."
        />
      )}

      {tab === 'orders' && (
        <TableShell
          columns={['Order ID','Tanggal','Pelanggan','Durasi','Total','Status']}
          rows={productOrders.map(o => [
            <span key="i" style={{ fontFamily:'ui-monospace,monospace', fontSize:12, fontWeight:600 }}>#{o.id}</span>,
            <span key="d" style={{ fontSize:12, color:'var(--ink-soft)' }}>{adminFmtDate(o.date)}</span>,
            <span key="c" style={{ fontSize:13 }}>{o.customer}</span>,
            <span key="du" style={{ fontSize:12 }}>{o.duration}</span>,
            <span key="t" style={{ fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{fmtIDRA(o.total)}</span>,
            <StatusPill key="s" status={o.status} />,
          ])}
          empty="Produk ini belum ada penjualan."
        />
      )}
    </div>
  );
}

// ─── User Detail page ───────────────────────────────────────────────────────
function UserDetailPage() {
  const { users, orders, notes, pageParam, navigate, updateNotes, updateUsers, logAudit } = useAdmin();
  const user = users.find(u => u.id === pageParam);
  const [noteText, setNoteText] = useStateB('');

  if (!user) return (
    <div>
      <PageHeader title="Member tidak ditemukan" />
      <button onClick={()=>navigate('users')} style={primaryBtn}>← Kembali</button>
    </div>
  );

  const userOrders = orders.filter(o => o.email === user.email);
  const userNotes = notes.filter(n => n.userId === user.id).sort((a,b)=>b.at.localeCompare(a.at));
  const ltv = userOrders.filter(o => o.status === 'paid' || o.status === 'delivered').reduce((s,o)=>s+o.total, 0);
  const avgOrder = userOrders.length > 0 ? Math.round(ltv / userOrders.length) : 0;

  const addNote = () => {
    if (!noteText.trim()) return;
    updateNotes(list => [...list, {
      id:'nt'+Date.now(), userId:user.id, at: new Date().toISOString(),
      actor:'admin@lapakurab.id', text: noteText.trim(),
    }]);
    logAudit('note.create', user.email, 'Notes admin ditambahkan');
    setNoteText('');
  };

  const toggleBan = () => {
    updateUsers(list => list.map(x => x.id === user.id ? {...x, status: x.status === 'banned' ? 'active' : 'banned'} : x));
    logAudit(user.status === 'banned' ? 'user.unban' : 'user.ban', user.email, '');
  };

  return (
    <div>
      <button onClick={()=>navigate('users')} style={{ ...secondaryBtn, marginBottom:12, fontSize:12 }}>← Kembali ke member</button>

      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:24, marginBottom:14, display:'flex', alignItems:'center', gap:18 }}>
        <div style={{
          width:74, height:74, borderRadius:'50%', flexShrink:0,
          background:`oklch(0.78 0.12 ${(user.id.charCodeAt(1)*47)%360})`,
          color:'white', display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:30, fontWeight:700, fontFamily:'var(--font-display)',
        }}>{user.name[0]}</div>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:600, letterSpacing:'-0.02em', margin:0 }}>{user.name}</h1>
            <StatusPill status={user.status} />
          </div>
          <div style={{ color:'var(--ink-soft)', fontSize:13, marginBottom:6 }}>{user.email}</div>
          <div style={{ fontSize:12, color:'var(--ink-soft)' }}>Bergabung sejak {adminFmtDate(user.joined)}</div>
        </div>
        <div>
          <button onClick={toggleBan} style={{...secondaryBtn, color: user.status === 'banned' ? 'var(--success)' : 'var(--danger)'}}>
            {user.status === 'banned' ? 'Unban member' : 'Ban member'}
          </button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
        <StatCard label="Lifetime value" value={fmtIDRA(ltv)} accent="var(--primary)" />
        <StatCard label="Total order" value={userOrders.length} accent="var(--mint)" />
        <StatCard label="Rata-rata order" value={fmtIDRA(avgOrder)} accent="var(--lilac)" />
        <StatCard label="Status" value={user.status === 'active' ? 'Aktif' : 'Banned'} accent={user.status === 'active' ? 'var(--success)' : 'var(--danger)'} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14 }}>
        <div>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:10 }}>Riwayat order ({userOrders.length})</div>
          <TableShell
            columns={['Order ID','Tanggal','Produk','Total','Status']}
            rows={userOrders.map(o => [
              <span key="i" style={{ fontFamily:'ui-monospace,monospace', fontSize:12, fontWeight:600 }}>#{o.id}</span>,
              <span key="d" style={{ fontSize:12, color:'var(--ink-soft)' }}>{adminFmtDate(o.date)}</span>,
              <div key="p"><div style={{ fontSize:13 }}>{o.product}</div><div style={{ fontSize:11, color:'var(--ink-soft)' }}>{o.duration}</div></div>,
              <span key="t" style={{ fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{fmtIDRA(o.total)}</span>,
              <StatusPill key="s" status={o.status} />,
            ])}
            empty="Member ini belum pernah order."
          />
        </div>

        <div>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:10 }}>Notes admin</div>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:14, marginBottom:10 }}>
            <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} rows={3}
              placeholder="Tulis catatan internal soal member ini..."
              style={{ ...inpStyle, resize:'vertical', marginBottom:8 }} />
            <button onClick={addNote} disabled={!noteText.trim()} style={{ ...primaryBtn, width:'100%', opacity: noteText.trim() ? 1 : 0.5 }}>+ Tambah catatan</button>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {userNotes.length === 0 && (
              <div style={{ padding:16, textAlign:'center', fontSize:12, color:'var(--ink-soft)', background:'var(--surface)', border:'1px dashed var(--border)', borderRadius:10 }}>
                Belum ada catatan. Tambahkan untuk track interaksi atau warning.
              </div>
            )}
            {userNotes.map(n => (
              <div key={n.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:12 }}>
                <div style={{ fontSize:13, marginBottom:5, lineHeight:1.5 }}>{n.text}</div>
                <div style={{ fontSize:10, color:'var(--ink-soft)' }}>{n.actor} · {relTime(n.at)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Audit / Activity Log page ──────────────────────────────────────────────
function AuditPage() {
  const { audit } = useAdmin();
  const [filter, setFilter] = useStateB('all');

  const groups = useMemoB(() => {
    const all = ['all', ...new Set(audit.map(a => a.action.split('.')[0]))];
    return all;
  }, [audit]);

  const filtered = filter === 'all' ? audit : audit.filter(a => a.action.startsWith(filter));

  // Group by day
  const byDay = {};
  filtered.forEach(a => {
    const day = a.at.slice(0,10);
    (byDay[day] = byDay[day] || []).push(a);
  });
  const days = Object.keys(byDay).sort().reverse();

  const iconForAction = (action) => {
    const t = action.split('.')[0];
    return ({
      product: '📦', order: '🧾', user: '👤', voucher: '🎟', gateway: '💳',
      stock: '🔑', settings: '⚙', note: '📝', orders: '↓', users: '↓',
    })[t] || '•';
  };

  const colorForAction = (action) => {
    if (action.endsWith('.delete') || action.endsWith('.ban') || action.endsWith('.refunded')) return 'var(--danger)';
    if (action.endsWith('.create') || action.endsWith('.unban') || action.endsWith('.delivered')) return 'var(--success)';
    if (action.endsWith('.update') || action.endsWith('.toggle') || action.endsWith('.export')) return 'var(--primary)';
    return 'var(--ink-soft)';
  };

  return (
    <div>
      <PageHeader title="Activity log" subtitle={`${audit.length} aksi tercatat · audit trail siapa edit apa kapan`} />

      <div style={{ display:'flex', gap:6, marginBottom:18, flexWrap:'wrap' }}>
        {groups.map(g => (
          <button key={g} onClick={()=>setFilter(g)} style={chipStyle(filter === g)}>
            {g === 'all' ? 'Semua' : g}
          </button>
        ))}
      </div>

      {days.length === 0 && (
        <div style={{ padding:40, textAlign:'center', color:'var(--ink-soft)', fontSize:13, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10 }}>
          Belum ada aktivitas.
        </div>
      )}

      {days.map(day => (
        <div key={day} style={{ marginBottom:24 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'var(--ink-soft)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>
            {adminFmtDate(day)}
          </div>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden' }}>
            {byDay[day].map((a, i) => (
              <div key={a.id} style={{
                display:'flex', alignItems:'flex-start', gap:12, padding:'14px 16px',
                borderBottom: i < byDay[day].length - 1 ? '1px solid var(--border)' : 0,
              }}>
                <div style={{
                  width:32, height:32, borderRadius:8, flexShrink:0,
                  background:'var(--surface-2)', display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:14, border:'1px solid var(--border)',
                }}>{iconForAction(a.action)}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, marginBottom:2 }}>
                    <span style={{ fontWeight:600 }}>{a.actor}</span>{' '}
                    <span style={{ color:'var(--ink-soft)' }}>—</span>{' '}
                    <code style={{ fontFamily:'ui-monospace,monospace', fontSize:11, fontWeight:600, color: colorForAction(a.action), padding:'1px 6px', borderRadius:4, background:'var(--surface-2)' }}>{a.action}</code>{' '}
                    <span style={{ fontWeight:500 }}>{a.target}</span>
                  </div>
                  {a.detail && <div style={{ fontSize:12, color:'var(--ink-soft)' }}>{a.detail}</div>}
                </div>
                <div style={{ fontSize:11, color:'var(--ink-soft)', flexShrink:0, fontVariantNumeric:'tabular-nums' }}>
                  {new Date(a.at).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Expose to global so admin-app.jsx router can find them
window.SettingsPage = SettingsPage;
window.ProductDetailPage = ProductDetailPage;
window.UserDetailPage = UserDetailPage;
window.AuditPage = AuditPage;
