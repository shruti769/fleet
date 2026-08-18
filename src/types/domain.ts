export type ShiftStatus = "clocked_off" | "clocked_on" | "on_break";
export type GateStatus = "not_started" | "in_progress" | "passed" | "failed";
export type SyncStatus = "queued" | "sending" | "sent" | "failed";

export interface GeoStamp {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  capturedAt: string;
}
export interface QueueItem {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  payload: string;
  occurredAt: string;
  status: SyncStatus;
  attempts: number;
}
export interface DriverState {
  operatorId: string;
  shift: ShiftStatus;
  fitForDuty: GateStatus;
  preStart: GateStatus;
  availability: boolean;
  activeJobId?: string;
  unreadMessages: number;
  queuedWrites: number;
}
