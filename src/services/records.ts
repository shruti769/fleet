import * as Crypto from "expo-crypto";
import { enqueue } from "@/data/database";

export async function captureLocation() {
  // Flow-and-design prototype: deterministic Laverton seed location.
  return {
    latitude: -37.861,
    longitude: 144.745,
    accuracy: 14,
    capturedAt: new Date().toISOString(),
  };
}

export async function recordOfflineFirst(
  entity: string,
  entityId: string,
  action: string,
  data: unknown,
) {
  const occurredAt = new Date().toISOString();
  const location = await captureLocation().catch(() => null);
  await enqueue({
    id: Crypto.randomUUID(),
    entity,
    entityId,
    action,
    payload: JSON.stringify({ data, location }),
    occurredAt,
    status: "queued",
    attempts: 0,
  });
  return { occurredAt, location };
}
