export const primaryViews = [
  "overview",
  "swap",
  "rewards",
  "network",
  "account",
] as const;
export const views = [
  ...primaryViews,
  "community",
  "earnings",
  "activate",
  "ieo",
  "test-lab",
] as const;
export type View = (typeof views)[number];
export const titles = {
  overview: "orig.nav.home",
  swap: "orig.nav.swap",
  rewards: "orig.mining.title",
  network: "orig.data.networkTitle",
  account: "orig.mine.title",
  community: "orig.team.title",
  earnings: "orig.mine.earnings",
  activate: "orig.activate.title",
  ieo: "orig.ieoUi.title",
  "test-lab": "parity.tools",
} as const;
export const legacyRoutes: Record<string, View> = {
  "/": "overview",
  "/swap": "swap",
  "/mining": "rewards",
  "/data": "network",
  "/mine": "account",
  "/mining/community": "community",
  "/mine/invite": "community",
  "/mine/earnings": "earnings",
  "/activate": "activate",
  "/mine/activate": "activate",
  "/ieo": "ieo",
  "/ieo/claim": "ieo",
  "/subscribe": "ieo",
};
export const isView = (value: string): value is View =>
  views.some((v) => v === value);
export function currentView(): View {
  const hash = location.hash.slice(1);
  return isView(hash)
    ? hash
    : (legacyRoutes[location.pathname.replace(/\/$/, "") || "/"] ?? "overview");
}
export function parentView(view: View): string {
  return ["community", "earnings"].includes(view)
    ? "rewards"
    : ["activate", "test-lab"].includes(view)
      ? "account"
      : view === "ieo"
        ? "overview"
        : view;
}
export function inviteFromSearch(search: string): string {
  const params = new URLSearchParams(search);
  for (const key of ["ref", "invite", "code", "invitation", "inviteCode"]) {
    const value = params.get(key)?.trim() ?? "";
    if (/^[a-zA-Z0-9]{4,16}$/.test(value)) return value;
  }
  return "";
}
export const validInvite = (code: string) =>
  /^[a-zA-Z0-9]{4,16}$/.test(code.trim());
