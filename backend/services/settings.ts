import { getSettings, updateSettings as repoUpdate } from "@/lib/data/settings-repo";
import type { AdminSettings } from "@/lib/types";
import type { UpdateSettingsInput } from "../schemas/settings";
import { requireAdmin } from "./auth";

export async function getSettingsService(): Promise<AdminSettings> {
  // Public read OK — settings (storeName, tagline, csWA, dll) dipakai storefront.
  return getSettings();
}

export async function updateSettingsService(
  patch: UpdateSettingsInput
): Promise<AdminSettings> {
  await requireAdmin();
  return repoUpdate(patch);
}
