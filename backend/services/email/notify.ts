/**
 * High-level email notifications. Fetch settings + render template + send.
 * Best-effort — caller boleh `.catch(() => {})` tanpa risk crash.
 */

import { sendEmail } from "./sender";
import { credentialEmailHTML, credentialEmailText } from "./templates";
import { getSettings } from "@/lib/data/settings-repo";
import { env } from "../../env";

export interface SendCredentialInput {
  orderId: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  duration: string;
  credEmail: string;
  credPassword: string;
}

export async function sendCredentialEmailFor(input: SendCredentialInput) {
  let storeName = "lapakurab";
  let csWA = "";
  try {
    const s = await getSettings();
    storeName = s.storeName || storeName;
    csWA = s.csWA || "";
  } catch {
    /* default */
  }
  const vars = {
    customerName: input.customerName,
    productName: input.productName,
    duration: input.duration,
    orderId: input.orderId,
    email: input.credEmail,
    password: input.credPassword,
    storeName,
    storeUrl: env.SITE_URL || "",
    csWA: csWA || undefined,
  };
  return sendEmail({
    to: input.customerEmail,
    subject: `${input.productName} siap dipakai · ${storeName}`,
    html: credentialEmailHTML(vars),
    text: credentialEmailText(vars),
  });
}
