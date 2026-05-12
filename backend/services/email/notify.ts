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
  /** Credential format dari product — menentukan label field. */
  credentialFormat?: string;
  /** Generic credential fields. */
  field1: string;
  field2?: string;
  field3?: string;
  notes?: string;
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
    credentialFormat: input.credentialFormat || "email_password",
    field1: input.field1,
    field2: input.field2,
    field3: input.field3,
    notes: input.notes,
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
