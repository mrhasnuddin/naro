import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useI18n, type Locale, type Key } from "./context";
import { Icon, Select } from "./components/ui";
import { Modal } from "./components/Modal";
import { Activation, Help } from "./components/Support";
import { WalletPicker } from "./features/wallet/WalletPicker";
const DemoDashboard = lazy(() =>
  import("./demo/DemoDashboard").then((module) => ({
    default: module.DemoDashboard,
  })),
);
import { isLocalDemo } from "./demo/network";
import { useWallet, shortAddress } from "./features/wallet/store";
import { Dashboard } from "./features/dashboard/Dashboard";
import { snapshot, type AccountPreview, type DataMode } from "./data/dashboard";
import { inviteCode } from "./data/amounts";
import logo from "../../design-system/assets/naro-logo.png";
const views = [
  "overview",
  "rewards",
  "community",
  "network",
  "account",
] as const;
type View = (typeof views)[number];
type DialogKind = "wallet" | "activation" | "help" | "copy";
const isView = (value: string): value is View =>
  views.some((view) => view === value);
const initialView = (): View =>
  isView(location.hash.slice(1))
    ? (location.hash.slice(1) as View)
    : "overview";
export function App() {
  const { t, locale, setLocale } = useI18n();
  const wallet = useWallet();
  const [view, setView] = useState<View>(initialView),
    [mode, setMode] = useState<DataMode>("wallet"),
    [account, setAccount] = useState<AccountPreview>("active");
  const [modal, setModal] = useState<DialogKind | null>(null),
    [toast, setToast] = useState(""),
    [copyLink, setCopyLink] = useState("");
  const returnFocus = useRef<HTMLElement | null>(null),
    main = useRef<HTMLElement>(null);
  const [invitation] = useState(() => inviteCode(location.search));
  const open = (kind: DialogKind) => {
    returnFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setModal(kind);
  };
  useEffect(() => {
    const listener = () => {
      const hash = location.hash.slice(1);
      if (!isView(hash)) return;
      setView(hash);
      requestAnimationFrame(() => {
        main.current?.focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: "instant" });
      });
    };
    window.addEventListener("hashchange", listener);
    return () => window.removeEventListener("hashchange", listener);
  }, []);
  useEffect(() => {
    document.title = `NARO | ${t(`nav.${view}`)}`;
  }, [view, locale, t]);
  useEffect(() => {
    if (wallet.state.address) setMode("wallet");
  }, [wallet.state.address]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 6000);
    return () => clearTimeout(timer);
  }, [toast]);
  const copyInvite = async () => {
    const url = new URL(location.href);
    url.search = "?invite=DEMONARO";
    url.hash = "overview";
    try {
      await navigator.clipboard.writeText(url.href);
      setToast(t("community.copied"));
    } catch {
      setCopyLink(url.href);
      open("copy");
    }
  };
  const nav = views.map((target) => (
    <a
      key={target}
      href={`#${target}`}
      aria-current={target === view ? "page" : undefined}
    >
      <Icon name={target} />
      <span>{t(`nav.${target}`)}</span>
    </a>
  ));
  const titleKey: Key =
    view === "overview"
      ? "overview.title"
      : view === "community"
        ? "community.page.title"
        : view === "network"
          ? "network.page.title"
          : `${view}.title`;
  const descriptionKey: Key =
    view === "overview"
      ? "overview.description"
      : view === "community"
        ? "community.page.description"
        : view === "network"
          ? "network.page.description"
          : `${view}.description`;
  const stamp = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(snapshot);
  const walletAction = () => open("wallet");
  const liveContent = (
    <Suspense fallback={<p role="status">{t("demo.loading")}</p>}>
      <DemoDashboard view={view} openWallet={walletAction} />
    </Suspense>
  );
  return (
    <>
      <a href="#main-content" className="skip-link">
        {t("skip")}
      </a>
      <div className="reviewbar" aria-label={t("review.controls")}>
        <div>
          <strong>{t(isLocalDemo ? "demo.local" : "demo.testnet")}</strong>
          <span>{t(mode === "sample" ? "app.sample" : "demo.label")}</span>
        </div>
        <div className="review-controls">
          <label htmlFor="data-mode">
            <span>{t("app.view")}</span>
            <Select
              id="data-mode"
              label={t("app.view")}
              value={mode}
              onChange={(value) => setMode(value as DataMode)}
            >
              <option value="sample">{t("app.sample")}</option>
              <option value="wallet">{t("app.wallet")}</option>
            </Select>
          </label>
          {mode === "sample" && (
            <label htmlFor="preview-state">
              <span>{t("review.state")}</span>
              <Select
                id="preview-state"
                label={t("review.state")}
                value={account}
                onChange={(value) => setAccount(value as AccountPreview)}
              >
                <option value="active">{t("review.active")}</option>
                <option value="setup">{t("review.setup")}</option>
                <option value="public">{t("review.public")}</option>
              </Select>
            </label>
          )}
        </div>
      </div>
      <div className="app-shell">
        <aside className="sidebar">
          <a
            className="brand"
            href="#overview"
            aria-label={`NARO ${t("nav.overview")}`}
          >
            <img src={logo} alt="NARO" width="118" height="30" />
          </a>
          <p className="sidebar-caption">{t("nav.workspace")}</p>
          <nav id="desktop-nav" aria-label={t("nav.main")}>
            {nav}
          </nav>
          <div className="sidebar-bottom">
            <a
              href="#help"
              onClick={(event) => {
                event.preventDefault();
                open("help");
              }}
            >
              <Icon name="help" />
              {t("help.label")}
            </a>
            <div className="sidebar-network">
              <span className="network-dot" aria-hidden="true" />
              <span>{isLocalDemo ? "NARO Local Demo" : "BNB Smart Chain"}</span>
              <span>{isLocalDemo ? "31337" : t("network.testnet")}</span>
            </div>
          </div>
        </aside>
        <div className="workspace">
          <header className="topbar">
            <div className="mobile-brand">
              <a href="#overview" aria-label={`NARO ${t("nav.overview")}`}>
                <img src={logo} alt="NARO" width="92" height="24" />
              </a>
            </div>
            <div className="breadcrumb">{t(`nav.${view}`)}</div>
            <div className="header-actions">
              <span className="naro-badge naro-badge--info chain-label">
                {t(isLocalDemo ? "demo.local" : "demo.testnet")}
              </span>
              <Select
                id="locale"
                label={t("language")}
                value={locale}
                onChange={(value) => {
                  setLocale(value as Locale);
                  setToast(
                    value === "en"
                      ? "Language changed to English."
                      : "已切换为简体中文。",
                  );
                }}
              >
                <option value="en">EN</option>
                <option value="zh-Hans">中文</option>
              </Select>
              <button
                id="wallet-button"
                className="naro-button naro-button--secondary naro-button--compact"
                onClick={walletAction}
              >
                <Icon name="wallet" />
                <span>
                  {wallet.state.address
                    ? shortAddress(wallet.state.address)
                    : t("wallet.connect")}
                </span>
              </button>
            </div>
          </header>
          <main
            ref={main}
            id="main-content"
            className="page-content"
            tabIndex={-1}
          >
            <div className="page-heading">
              <div>
                <h1>{t(titleKey)}</h1>
                <p>{t(descriptionKey)}</p>
              </div>
              <span className="sample-label">
                <Icon name={mode === "sample" ? "sample" : "wallet"} />
                {t(mode === "sample" ? "demo.only" : "app.wallet")}
              </span>
            </div>
            {invitation && (
              <div className="invitation-notice">
                <strong>{t("app.inviteReceived")}</strong>
                <p>{t("app.inviteReceivedNote", { code: invitation })}</p>
                <button
                  className="text-button"
                  onClick={() => open("activation")}
                >
                  {t("hero.setup.action")}
                </button>
              </div>
            )}
            {mode === "sample" ? (
              <Dashboard
                view={view}
                account={account}
                openWallet={walletAction}
                openActivation={() => open("activation")}
                copyInvite={() => void copyInvite()}
              />
            ) : (
              liveContent
            )}
            {mode === "sample" && (
              <div className="snapshot">
                <span>
                  {t("snapshot.label")}{" "}
                  <time dateTime={snapshot.toISOString()}>{stamp}</time>
                </span>
                <span>{t("snapshot.timezone")}</span>
              </div>
            )}
          </main>
          <footer className="app-footer">
            <span>
              {t(
                mode === "sample"
                  ? "footer.test"
                  : isLocalDemo
                    ? "demo.local"
                    : "demo.testnet",
              )}
            </span>
            <button className="footer-help" onClick={() => open("help")}>
              {t("help.label")}
              <Icon name="help" />
            </button>
          </footer>
        </div>
      </div>
      <nav id="mobile-nav" className="mobile-nav" aria-label={t("nav.main")}>
        {nav}
      </nav>
      {modal && (
        <Modal
          returnFocus={returnFocus.current}
          onDismiss={() => setModal(null)}
        >
          {modal === "wallet" ? (
            <WalletPicker />
          ) : modal === "activation" ? (
            <Activation />
          ) : modal === "help" ? (
            <Help />
          ) : (
            <>
              <h2 id="dialog-title">{t("copy.label")}</h2>
              <p>{t("community.copyFallback")}</p>
              <label className="naro-field">
                {t("copy.label")}
                <input
                  className="naro-input"
                  value={copyLink}
                  readOnly
                  onFocus={(event) => event.target.select()}
                />
              </label>
            </>
          )}
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </>
  );
}
