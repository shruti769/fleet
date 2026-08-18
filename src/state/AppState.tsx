import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { migrateDatabase, queueCount } from "@/data/database";
import type { DriverState, GateStatus, ShiftStatus } from "@/types/domain";

const initial: DriverState = {
  operatorId: "op_redgum",
  shift: "clocked_off",
  fitForDuty: "not_started",
  preStart: "not_started",
  availability: true,
  unreadMessages: 3,
  queuedWrites: 0,
};
type ContextValue = DriverState & {
  ready: boolean;
  setShift(v: ShiftStatus): void;
  setGate(key: "fitForDuty" | "preStart", v: GateStatus): void;
  setOperator(id: string): void;
  toggleAvailability(): void;
  refreshQueue(): Promise<void>;
  reset(): Promise<void>;
};
const Context = createContext<ContextValue | null>(null);

export function AppStateProvider({ children }: React.PropsWithChildren) {
  const [state, setState] = useState(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    void (async () => {
      await migrateDatabase();
      const saved = await AsyncStorage.getItem("fleetsync.state.v3");
      if (saved) setState({ ...initial, ...JSON.parse(saved) });
      setReady(true);
    })();
  }, []);
  useEffect(() => {
    if (ready)
      void AsyncStorage.setItem("fleetsync.state.v3", JSON.stringify(state));
  }, [ready, state]);
  const refreshQueue = useCallback(async () => {
    const queuedWrites = await queueCount();
    setState((s) => ({ ...s, queuedWrites }));
  }, []);
  const value = useMemo<ContextValue>(
    () => ({
      ...state,
      ready,
      setShift: (shift) => setState((s) => ({ ...s, shift })),
      setGate: (key, v) => setState((s) => ({ ...s, [key]: v })),
      setOperator: (operatorId) => setState((s) => ({ ...s, operatorId })),
      toggleAvailability: () =>
        setState((s) => ({ ...s, availability: !s.availability })),
      refreshQueue,
      reset: async () => {
        await AsyncStorage.removeItem("fleetsync.state.v3");
        setState(initial);
      },
    }),
    [state, ready, refreshQueue],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAppState() {
  const value = useContext(Context);
  if (!value) throw new Error("AppStateProvider missing");
  return value;
}
