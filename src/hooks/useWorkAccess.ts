import { useAppState } from "@/state/AppState";

/** Returns whether shift-gated work tabs may be opened. */
export function useWorkAccess() {
  const state = useAppState();

  return (
    state.shift !== "clocked_off" &&
    state.fitForDuty === "passed" &&
    state.preStart === "passed"
  );
}
