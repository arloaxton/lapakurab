// lapakurab-shared.jsx — P0 shared infra
// Toast system, Undo snackbar, EmptyState, Skeleton, useKey, useCopy
// Loaded BEFORE admin-app.jsx & store-app.jsx so both can use the helpers.

const { useState: _useS, useEffect: _useE, useRef: _useR, useCallback: _useCB, createContext: _createCtx, useContext: _useCtx } = React;

// ─── Toast system ───────────────────────────────────────────────────────────
const ToastCtx = _createCtx(null);

function ToastProvider({ children }) {
  const [toasts, setToasts] = _useS([]);
  const idRef = _useR(0);

  const remove = _useCB((id) => setToasts(list => list.filter(t => t.id !== id)), []);

  const push = _useCB((opts) => {
    const id = ++idRef.current;
    const t = {
      id,
      kind: opts.kind || 'info', // 'success' | 'error' | 'warn' | 'info'
      title: opts.title || '',
      desc: opts.desc || '',
      duration: opts.duration ?? 3500,
      action: opts.action || null, // { label, onClick }
    };
    setToasts(list => [...list, t]);
    if (t.duration > 0) setTimeout(() => remove(id), t.duration);
    return id;
  }, [remove]);

  const api = {
    push,
    success: (title, desc, opts={}) => push({ kind:'success', title, desc, ...opts }),
    error:   (title, desc, opts={}) => push({ kind:'error',   title, desc, ...opts }),
    warn:    (title, desc, opts={}) => push({ kind:'warn',    title, desc, ...opts }),
    info:    (title, desc, opts={}) => push({ kind:'info',    title, desc, ...opts }),
    undo:    (title, onUndo, opts={}) => push({ kind:'info', title, duration: 6000, action: { label:'Undo', onClick:onUndo }, ...opts }),
    remove,
  };

  // Expose globally too — supports calling from non-React code
  if (typeof window !== 'undefined') window.toast = api;

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} remove={remove} />
    </ToastCtx.Provider>
  );
}

function useToast() {
  const ctx = _useCtx(ToastCtx);
  if (!ctx) return window.toast || { push:()=>{}, success:()=>{}, error:()=>{}, warn:()=>{}, info:()=>{}, undo:()=>{}, remove:()=>{} };
  return ctx;
}

function ToastViewport({ toasts, remove }) {
  const palette = {
    success: { bg:'#0F8B5C', icon:'✓' },
    error:   { bg:'#DC2626', icon:'✕' },
    warn:    { bg:'#D97706', icon:'!' },
    info:    { bg:'#1F1F1F', icon:'•' },
  };
  return (
    <div style={{
      position:'fixed', bottom:24, right:24, zIndex:9999,
      display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end',
      pointerEvents:'none',
    }}>
      {toasts.map(t => {
        const p = palette[t.kind] || palette.info;
        return (
          <div key={t.id} style={{
            pointerEvents:'auto',
            background: p.bg, color:'white',
            padding:'12px 14px', borderRadius:10, minWidth:280, maxWidth:380,
            boxShadow:'0 12px 28px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08)',
            display:'flex', alignItems:'flex-start', gap:10,
            animation:'lkToastIn 220ms cubic-bezier(0.2,0.8,0.2,1)',
            fontFamily:'inherit',
          }}>
            <div style={{
              width:22, height:22, borderRadius:'50%',
              background:'rgba(255,255,255,0.22)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:13, fontWeight:700, flexShrink:0,
            }}>{p.icon}</div>
            <div style={{ flex:1, minWidth:0, lineHeight:1.4 }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom: t.desc ? 2 : 0 }}>{t.title}</div>
              {t.desc && <div style={{ fontSize:11, opacity:0.9 }}>{t.desc}</div>}
            </div>
            {t.action && (
              <button onClick={() => { t.action.onClick(); remove(t.id); }} style={{
                background:'rgba(255,255,255,0.18)', border:0, color:'white',
                padding:'5px 10px', borderRadius:6, fontSize:12, fontWeight:600,
                cursor:'pointer', fontFamily:'inherit', flexShrink:0,
              }}>{t.action.label}</button>
            )}
            <button onClick={() => remove(t.id)} style={{
              background:'none', border:0, color:'rgba(255,255,255,0.7)',
              cursor:'pointer', fontSize:14, padding:0, lineHeight:1, flexShrink:0,
            }}>✕</button>
          </div>
        );
      })}
    </div>
  );
}

// Inject one-shot keyframes
if (typeof document !== 'undefined' && !document.getElementById('lk-toast-keyframes')) {
  const s = document.createElement('style');
  s.id = 'lk-toast-keyframes';
  s.textContent = `
    @keyframes lkToastIn { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes lkSkeleton { 0% { background-position: -200px 0 } 100% { background-position: calc(200px + 100%) 0 } }
    @keyframes lkFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  `;
  document.head.appendChild(s);
}

// ─── EmptyState ─────────────────────────────────────────────────────────────
function EmptyState({ icon='📦', title='Belum ada data', desc='', cta=null, compact=false }) {
  return (
    <div style={{
      padding: compact ? '32px 20px' : '56px 24px',
      textAlign:'center',
      background:'var(--surface, #fff)',
      border:'1px dashed var(--border, #e5e5e5)',
      borderRadius:14,
      animation:'lkFadeIn 280ms ease-out',
    }}>
      <div style={{
        width: compact ? 48 : 64, height: compact ? 48 : 64,
        margin:'0 auto 14px', borderRadius:'50%',
        background:'var(--surface-2, #f5f3ef)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize: compact ? 22 : 28,
      }}>{icon}</div>
      <div style={{
        fontFamily:'var(--font-display, inherit)',
        fontWeight:600, fontSize: compact ? 14 : 16,
        color:'var(--ink, #1a1a1a)', letterSpacing:'-0.01em', marginBottom:4,
      }}>{title}</div>
      {desc && <div style={{
        fontSize:12, color:'var(--ink-soft, #666)', maxWidth:380, margin:'0 auto 14px', lineHeight:1.5,
      }}>{desc}</div>}
      {cta}
    </div>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────
function Skeleton({ w='100%', h=14, rounded=4, style={} }) {
  return (
    <div style={{
      width:w, height:h, borderRadius:rounded,
      background:'linear-gradient(90deg, var(--surface-2, #f0eee9) 0%, var(--border, #e5e5e5) 50%, var(--surface-2, #f0eee9) 100%)',
      backgroundSize:'200px 100%',
      animation:'lkSkeleton 1.4s ease-in-out infinite',
      ...style,
    }} />
  );
}

function SkeletonRow({ cols=5 }) {
  return (
    <div style={{ display:'flex', gap:14, padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
      {Array.from({length:cols}).map((_,i) => (
        <Skeleton key={i} h={14} w={i === 0 ? '40%' : '15%'} rounded={4} style={{ flex: i === 0 ? 2 : 1 }} />
      ))}
    </div>
  );
}

function SkeletonCard({ h=120 }) {
  return (
    <div style={{ padding:18, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12 }}>
      <Skeleton h={14} w="55%" />
      <div style={{ height:8 }} />
      <Skeleton h={28} w="40%" />
      <div style={{ height:14 }} />
      <Skeleton h={10} w="80%" />
    </div>
  );
}

// ─── useKey hook (Esc, Enter, Cmd+K, etc.) ──────────────────────────────────
function useKey(combo, handler, deps=[]) {
  _useE(() => {
    const onKey = (e) => {
      // combo: "Escape", "Enter", "$mod+k", "$mod+Enter"
      const parts = combo.toLowerCase().split('+');
      const key = parts[parts.length - 1];
      const needMod = parts.includes('$mod');
      const needShift = parts.includes('shift');
      const needAlt = parts.includes('alt');

      const k = e.key.toLowerCase();
      if (k !== key) return;
      if (needMod && !(e.metaKey || e.ctrlKey)) return;
      if (!needMod && (e.metaKey || e.ctrlKey)) return;
      if (needShift !== e.shiftKey) return;
      if (needAlt !== e.altKey) return;

      handler(e);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  // eslint-disable-next-line
  }, deps);
}

// ─── Copy-to-clipboard helper ───────────────────────────────────────────────
function useCopy() {
  const t = useToast();
  return _useCB(async (text, label='Disalin') => {
    try {
      await navigator.clipboard.writeText(text);
      t.success(label, '"' + (text.length > 30 ? text.slice(0,28) + '…' : text) + '" disalin ke clipboard.', { duration: 2200 });
    } catch (e) {
      t.error('Gagal menyalin', 'Browser kamu blokir clipboard. Salin manual ya.');
    }
  }, [t]);
}

// ─── CredentialReveal — masked email/password with eye + copy ───────────────
function CredentialReveal({ label, value, masked=true }) {
  const [show, setShow] = _useS(false);
  const copy = useCopy();
  const display = (show || !masked) ? value : '•'.repeat(Math.min(value.length, 14));
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8, padding:'8px 10px',
      background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:6,
      fontFamily:'ui-monospace, SFMono-Regular, monospace', fontSize:12,
    }}>
      {label && <span style={{ color:'var(--ink-soft)', fontWeight:600, minWidth:60 }}>{label}</span>}
      <span style={{ flex:1, color:'var(--ink)', fontWeight:500, userSelect: show ? 'all' : 'none', letterSpacing: show ? 0 : '0.1em' }}>{display}</span>
      <button onClick={() => setShow(s => !s)} title={show ? 'Sembunyikan' : 'Tampilkan'} style={{
        background:'none', border:0, cursor:'pointer', padding:4, color:'var(--ink-soft)',
        display:'flex', alignItems:'center',
      }}>
        {show
          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
      </button>
      <button onClick={() => copy(value, label ? label + ' disalin' : 'Disalin')} title="Salin" style={{
        background:'none', border:0, cursor:'pointer', padding:4, color:'var(--ink-soft)',
        display:'flex', alignItems:'center',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
      </button>
    </div>
  );
}

// ─── Modal hook — Esc + click-outside to close ──────────────────────────────
function useModalKey(active, onClose) {
  _useE(() => {
    if (!active) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, onClose]);
}

// ─── Cmd+K Command Palette ──────────────────────────────────────────────────
function CommandPalette({ commands, open, onClose }) {
  const [q, setQ] = _useS('');
  const [idx, setIdx] = _useS(0);
  const inputRef = _useR(null);

  _useE(() => {
    if (open) {
      setQ('');
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = q
    ? commands.filter(c => (c.title + ' ' + (c.section||'') + ' ' + (c.keywords||'')).toLowerCase().includes(q.toLowerCase()))
    : commands;

  _useE(() => { if (idx >= filtered.length) setIdx(0); }, [q, filtered.length, idx]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(filtered.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(0, i - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); const c = filtered[idx]; if (c) { c.onRun(); onClose(); } }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  };

  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:9000,
      background:'rgba(20,20,20,0.42)', backdropFilter:'blur(2px)',
      display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:'12vh',
      animation:'lkFadeIn 140ms ease-out',
    }}>
      <div onClick={(e)=>e.stopPropagation()} style={{
        width:560, maxWidth:'92vw',
        background:'var(--surface, #fff)', border:'1px solid var(--border, #e5e5e5)',
        borderRadius:14, boxShadow:'0 30px 80px rgba(0,0,0,0.18), 0 8px 20px rgba(0,0,0,0.08)',
        overflow:'hidden',
      }}>
        <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border, #e5e5e5)', display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:14, color:'var(--ink-soft, #888)' }}>⌘K</span>
          <input
            ref={inputRef} value={q} onChange={(e)=>setQ(e.target.value)} onKeyDown={onKeyDown}
            placeholder="Cari halaman, action, produk…"
            style={{ flex:1, border:0, outline:'none', fontSize:15, fontFamily:'inherit',
              color:'var(--ink, #1a1a1a)', background:'transparent' }}
          />
          <kbd style={{ fontSize:11, padding:'3px 6px', background:'var(--surface-2,#f5f3ef)',
            border:'1px solid var(--border,#e5e5e5)', borderRadius:4, color:'var(--ink-soft,#666)',
            fontFamily:'inherit' }}>Esc</kbd>
        </div>
        <div style={{ maxHeight:'52vh', overflowY:'auto', padding:6 }}>
          {filtered.length === 0 ? (
            <div style={{ padding:'40px 20px', textAlign:'center', color:'var(--ink-soft,#888)', fontSize:13 }}>
              Tidak ada hasil untuk "{q}"
            </div>
          ) : filtered.map((c, i) => (
            <div key={i} onClick={()=>{ c.onRun(); onClose(); }} onMouseEnter={()=>setIdx(i)} style={{
              display:'flex', alignItems:'center', gap:12, padding:'10px 12px',
              borderRadius:8, cursor:'pointer',
              background: idx === i ? 'var(--surface-2,#f5f3ef)' : 'transparent',
            }}>
              <span style={{ fontSize:18, width:24, textAlign:'center' }}>{c.icon || '•'}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:500, color:'var(--ink,#1a1a1a)' }}>{c.title}</div>
                {c.section && <div style={{ fontSize:11, color:'var(--ink-soft,#888)', marginTop:1 }}>{c.section}</div>}
              </div>
              {c.shortcut && <kbd style={{ fontSize:10, padding:'2px 6px', background:'var(--surface-2,#f5f3ef)',
                border:'1px solid var(--border,#e5e5e5)', borderRadius:3, color:'var(--ink-soft,#888)',
                fontFamily:'inherit' }}>{c.shortcut}</kbd>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── usePersistedState — sync state with URL hash query params ──────────────
// Reads from #hash?key=val (kept compat with existing hash-route like #admin/products)
function readHashParams() {
  const h = window.location.hash || '';
  const qIdx = h.indexOf('?');
  if (qIdx < 0) return {};
  return Object.fromEntries(new URLSearchParams(h.slice(qIdx + 1)));
}
function writeHashParams(patch) {
  const h = window.location.hash || '';
  const qIdx = h.indexOf('?');
  const base = qIdx < 0 ? h : h.slice(0, qIdx);
  const params = readHashParams();
  Object.entries(patch).forEach(([k,v]) => {
    if (v == null || v === '' || v === 'all') delete params[k];
    else params[k] = String(v);
  });
  const qs = new URLSearchParams(params).toString();
  const next = base + (qs ? '?' + qs : '');
  if (next !== h) {
    history.replaceState(null, '', window.location.pathname + window.location.search + next);
  }
}
function usePersistedFilter(key, defaultVal) {
  const [val, setVal] = _useS(() => readHashParams()[key] ?? defaultVal);
  _useE(() => { writeHashParams({ [key]: val === defaultVal ? null : val }); }, [val]);
  return [val, setVal];
}

// ─── Field — form input with built-in validation display ────────────────────
function Field({ label, error, hint, required, children, style={} }) {
  return (
    <label style={{ display:'flex', flexDirection:'column', gap:5, ...style }}>
      <span style={{ fontSize:12, fontWeight:600, color:'var(--ink-soft, #666)', display:'flex', gap:4 }}>
        {label}
        {required && <span style={{ color:'#DC2626' }}>*</span>}
      </span>
      {children}
      {error
        ? <span style={{ fontSize:11, color:'#DC2626', display:'flex', alignItems:'center', gap:4 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </span>
        : hint
        ? <span style={{ fontSize:11, color:'var(--ink-soft, #888)' }}>{hint}</span>
        : null}
    </label>
  );
}

// useFormValidation — { values, errors, setField, validate, isValid }
function useFormValidation(initial, rules) {
  const [values, setValues] = _useS(initial);
  const [errors, setErrors] = _useS({});
  const [touched, setTouched] = _useS({});

  const validate = _useCB((vs = values) => {
    const errs = {};
    Object.entries(rules || {}).forEach(([k, fn]) => {
      const e = fn(vs[k], vs);
      if (e) errs[k] = e;
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [rules, values]);

  const setField = _useCB((k, v) => {
    setValues(s => ({ ...s, [k]: v }));
    if (touched[k]) {
      const fn = rules?.[k];
      if (fn) {
        const e = fn(v, { ...values, [k]: v });
        setErrors(s => ({ ...s, [k]: e }));
      }
    }
  }, [rules, touched, values]);

  const blur = _useCB((k) => {
    setTouched(s => ({ ...s, [k]: true }));
    const fn = rules?.[k];
    if (fn) {
      const e = fn(values[k], values);
      setErrors(s => ({ ...s, [k]: e }));
    }
  }, [rules, values]);

  const touchAll = _useCB(() => {
    const all = {};
    Object.keys(rules || {}).forEach(k => { all[k] = true; });
    setTouched(all);
  }, [rules]);

  return { values, errors, touched, setField, blur, validate, setValues, touchAll };
}

// ─── useSelection — multi-select state for bulk actions ─────────────────────
function useSelection(items, getId = (x) => x.id) {
  const [ids, setIds] = _useS(new Set());
  const visibleIds = items.map(getId);
  const allSelected = visibleIds.length > 0 && visibleIds.every(id => ids.has(id));
  const someSelected = visibleIds.some(id => ids.has(id));

  return {
    ids,
    has: (id) => ids.has(id),
    toggle: (id) => setIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }),
    toggleAll: () => setIds(s => {
      if (allSelected) { const n = new Set(s); visibleIds.forEach(id => n.delete(id)); return n; }
      return new Set([...s, ...visibleIds]);
    }),
    clear: () => setIds(new Set()),
    count: ids.size,
    allSelected, someSelected,
    selectedItems: items.filter(x => ids.has(getId(x))),
  };
}

// Expose to global
Object.assign(window, {
  ToastProvider, useToast, EmptyState, Skeleton, SkeletonRow, SkeletonCard,
  useKey, useCopy, CredentialReveal, useModalKey,
  CommandPalette, usePersistedFilter, Field, useFormValidation, useSelection,
});
