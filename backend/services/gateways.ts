import {
  createGateway as repoCreate,
  deleteGateway as repoDelete,
  listGateways as repoList,
  updateGateway as repoUpdate,
} from "@/lib/data/gateways-repo";
import type { Gateway } from "@/lib/types";
import type {
  CreateGatewayInput,
  UpdateGatewayInput,
} from "../schemas/gateways";
import { requireAdmin } from "./auth";

export async function listGatewaysService(): Promise<Gateway[]> {
  await requireAdmin();
  return repoList();
}

export async function createGatewayService(input: CreateGatewayInput): Promise<Gateway> {
  await requireAdmin();
  return repoCreate(input);
}

export async function updateGatewayService(
  id: string,
  patch: UpdateGatewayInput
): Promise<Gateway> {
  await requireAdmin();
  return repoUpdate(id, patch);
}

export async function deleteGatewayService(id: string): Promise<void> {
  await requireAdmin();
  await repoDelete(id);
}
