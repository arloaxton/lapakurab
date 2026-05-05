/**
 * HTML templates untuk email transaksional.
 * Inline styles agar render konsisten di Gmail/Outlook/dll.
 */

interface CredentialEmailVars {
  customerName: string;
  productName: string;
  duration: string;
  orderId: string;
  email: string;
  password: string;
  storeName: string;
  storeUrl: string;
  csWA?: string;
}

export function credentialEmailHTML(v: CredentialEmailVars): string {
  const wa = v.csWA
    ? `<a href="https://wa.me/${v.csWA.replace(/[^0-9]/g, "")}" style="color:#FF6B9D;text-decoration:none;font-weight:600">${v.csWA}</a>`
    : "Customer Service";
  return `<!doctype html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f4f4f7; margin:0; padding:24px; color:#1a1626">
  <div style="max-width:560px; margin:0 auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.06)">
    <div style="padding:32px 28px 8px">
      <div style="font-size:13px; font-weight:700; color:#FF6B9D; letter-spacing:0.04em; text-transform:uppercase; margin-bottom:8px">${escapeHTML(v.storeName)}</div>
      <h1 style="font-size:24px; font-weight:800; letter-spacing:-0.02em; margin:0 0 8px; color:#1a1626">Pesanan kamu siap dipakai 🎉</h1>
      <p style="font-size:14px; color:#666; line-height:1.6; margin:0 0 24px">
        Hai ${escapeHTML(v.customerName)}, terima kasih sudah berbelanja di ${escapeHTML(v.storeName)}!
        Berikut kredensial akun ${escapeHTML(v.productName)} (${escapeHTML(v.duration)}) yang sudah kami siapkan.
      </p>
    </div>
    <div style="margin:0 28px 20px; padding:18px; border-radius:12px; background:#f7f7fb; border:1px solid #ececf3">
      <div style="font-size:11px; font-weight:700; color:#888; letter-spacing:0.04em; text-transform:uppercase; margin-bottom:6px">Email akun</div>
      <div style="font-family:'SFMono-Regular', Consolas, monospace; font-size:14px; font-weight:600; color:#1a1626; margin-bottom:14px; word-break:break-all">${escapeHTML(v.email)}</div>
      <div style="font-size:11px; font-weight:700; color:#888; letter-spacing:0.04em; text-transform:uppercase; margin-bottom:6px">Password</div>
      <div style="font-family:'SFMono-Regular', Consolas, monospace; font-size:14px; font-weight:600; color:#1a1626; word-break:break-all">${escapeHTML(v.password)}</div>
    </div>
    <div style="margin:0 28px 24px; padding:14px 16px; border-radius:10px; background:#fff8e6; border:1px solid #ffe2a8; font-size:12px; line-height:1.6; color:#7a5a00">
      ⚠️ <strong>Penting:</strong> Jangan ganti password sendiri. Kalau ada masalah login, hubungi CS dulu — kami garansi penuh selama masa aktif.
    </div>
    <div style="padding:0 28px 24px">
      <a href="${escapeHTML(v.storeUrl)}/dashboard?tab=active" style="display:inline-block; padding:12px 22px; background:#1a1626; color:white; text-decoration:none; border-radius:999px; font-weight:700; font-size:13px">Lihat di Dashboard →</a>
    </div>
    <div style="padding:18px 28px; background:#f7f7fb; border-top:1px solid #ececf3; font-size:11px; color:#888; line-height:1.6">
      Order: <span style="font-family:'SFMono-Regular', Consolas, monospace">${escapeHTML(v.orderId)}</span><br>
      Butuh bantuan? Chat ${wa}
    </div>
  </div>
</body></html>`;
}

export function credentialEmailText(v: CredentialEmailVars): string {
  return `Hai ${v.customerName},

Terima kasih sudah berbelanja di ${v.storeName}!
Berikut kredensial akun ${v.productName} (${v.duration}):

Email: ${v.email}
Password: ${v.password}

⚠️ Jangan ganti password sendiri — kalau ada masalah login, hubungi CS.

Lihat di dashboard: ${v.storeUrl}/dashboard?tab=active

Order: ${v.orderId}
${v.csWA ? `CS WhatsApp: ${v.csWA}` : ""}`;
}

function escapeHTML(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
