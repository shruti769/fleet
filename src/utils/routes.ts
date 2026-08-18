export const routes = {
  dashboard: "/dashboard",
  startShiftGate: "/screen/A3",
  run: "/screen/A4",
  navigate: "/screen/A6",
  messages: "/screen/A22",
  profile: "/screen/A34",
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];
