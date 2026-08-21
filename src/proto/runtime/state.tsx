import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { router, usePathname } from 'expo-router';
import * as D from './data';

/** Screen ids travel through the router with `.` swapped for `_`. */
export const toRoute = (id: string) => `/screens/${id.replace(/\./g, '_')}` as const;
export const fromRoute = (segment: string) => segment.replace(/_/g, '.');

export type GoMode = 'push' | 'replace' | 'sheet' | 'tab' | 'root' | 'modal';

type State = {
  userName: string;
  overlay: string | null;
  toast: string;
  operator: string | null;
  remember: boolean;
  clockedOn: boolean;
  onBreak: boolean;
  timesheetView: 'shift' | 'week';
  available: boolean;
  fitForDuty: string;
  preStart: string;
  queue: number;
  q: number;
  checks: Record<number, string>;
  pending: number;
  activeCheck: string;
  sev: string;
  defectPhoto: boolean;
  declPhoto: boolean;
  component: string;
  reason: string;
  address: string;
  order: number[];
  zoomOut: boolean;
  statusIdx: number;
  target: number | undefined;
  scanned: number;
  sig: boolean;
  podReason: string;
  incidentType: string;
  notif: Record<string, boolean>;
  doc: string;
  shareWindow: string;
  availSet: boolean;
  pickedTypes: Record<string, boolean>;
  radius: number;
  notice: string;
  pickedDays: Record<string, boolean>;
  offerIdx: number;
  attach: boolean;
  docItem: D.FileItem | null;
  msgs: { them: boolean; me: boolean; at: string; text: string }[];
  comments: { who: string; role: string; at: string; text: string }[];
};

const initialState: State = {
  userName: 'Driver',
  overlay: null,
  toast: '',
  operator: null,
  remember: false,
  clockedOn: false,
  onBreak: false,
  timesheetView: 'shift',
  available: false,
  fitForDuty: 'not started',
  preStart: 'not started',
  queue: 3,
  q: 0,
  checks: {},
  pending: 0,
  activeCheck: 'Brakes and air lines',
  sev: 'Repair soon',
  defectPhoto: false,
  declPhoto: false,
  component: 'Choose a component',
  reason: 'Choose a reason',
  address: '2 Kirkwood Road, Corio VIC 3214',
  order: [0, 1, 2],
  zoomOut: false,
  statusIdx: 1,
  target: undefined,
  scanned: 18,
  sig: false,
  podReason: 'Choose a reason',
  incidentType: 'Choose a type',
  notif: {},
  doc: 'Heavy vehicle licence, MC',
  shareWindow: '7 days',
  availSet: false,
  pickedTypes: { 'General freight': true, 'Line haul, overnight': true },
  radius: 75,
  notice: 'Same day',
  pickedDays: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true },
  offerIdx: 0,
  attach: true,
  docItem: null,
  msgs: D.initialMsgs,
  comments: D.initialComments,
};

type Store = {
  state: State;
  screen: string;
  set: (patch: Partial<State> | ((prev: State) => Partial<State>)) => void;
  go: (id: string, mode?: GoMode) => void;
  back: () => void;
  dismiss: () => void;
  toast: (message: string) => void;
  drafts: { msg: string; comment: string };
  setDraft: (key: 'msg' | 'comment', value: string) => void;
};

const StoreContext = createContext<Store | null>(null);

export function PrototypeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [drafts, setDrafts] = useState({ msg: '', comment: '' });
  const pathname = usePathname();
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const screen = useMemo(() => {
    const match = /^\/screens\/(.+)$/.exec(pathname);
    return match ? fromRoute(decodeURIComponent(match[1])) : 'A1';
  }, [pathname]);

  const set = useCallback<Store['set']>((patch) => {
    setState((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  }, []);

  const go = useCallback<Store['go']>((id, mode = 'push') => {
    if (D.overIds.includes(id)) {
      setState((prev) => ({ ...prev, overlay: id }));
      return;
    }
    setState((prev) => ({ ...prev, overlay: null }));
    const href = toRoute(id);
    if (mode === 'push') {
      router.push(href);
    } else if (mode === 'tab' || mode === 'root') {
      // The prototype clears its stack for tab and root moves.
      if (router.canDismiss()) router.dismissAll();
      router.replace(href);
    } else {
      // `replace`, `sheet` and `modal` on a base id all keep the stack.
      router.replace(href);
    }
  }, []);

  const back = useCallback(() => {
    setState((prev) => ({ ...prev, overlay: null }));
    if (router.canGoBack()) router.back();
  }, []);

  const dismiss = useCallback(() => {
    setState((prev) => ({ ...prev, overlay: null }));
  }, []);

  const toast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setState((prev) => ({ ...prev, toast: '' }));
    // Remount the toast so its animation restarts, exactly as the prototype does.
    setTimeout(() => setState((prev) => ({ ...prev, toast: message })), 24);
    toastTimer.current = setTimeout(
      () => setState((prev) => ({ ...prev, toast: '' })),
      3324,
    );
  }, []);

  const setDraft = useCallback((key: 'msg' | 'comment', value: string) => {
    setDrafts((prev) => ({ ...prev, [key]: value }));
  }, []);

  // The prototype's `auto()` — two screens move on by themselves.
  useEffect(() => {
    if (screen === 'A16') setState((prev) => ({ ...prev, q: 0 }));
    if (screen === 'A1') {
      const t = setTimeout(() => go('A2', 'replace'), 5000);
      return () => clearTimeout(t);
    }
    if (screen === 'A26.S1') {
      const t = setTimeout(() => go('A27', 'replace'), 900);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [screen, go]);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (syncTimer.current) clearTimeout(syncTimer.current);
    },
    [],
  );

  const store = useMemo<Store>(
    () => ({ state, screen, set, go, back, dismiss, toast, drafts, setDraft }),
    [state, screen, set, go, back, dismiss, toast, drafts, setDraft],
  );

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('PrototypeProvider is missing above this screen');
  return store;
}
