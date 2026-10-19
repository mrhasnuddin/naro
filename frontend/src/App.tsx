import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useI18n, type Locale } from "./context";
import { Icon, Select } from "./components/ui";
import { Modal } from "./components/Modal";
import { Help } from "./components/Support";
import { WalletPicker } from "./features/wallet/WalletPicker";
import { isLocalDemo } from "./demo/network";
import { useWallet, shortAddress } from "./features/wallet/store";
import logo from "../../design-system/assets/naro-logo.png";
const DemoDashboard = lazy(() =>
  import("./demo/DemoDashboard").then((m) => ({ default: m.DemoDashboard })),
);
const views = [
  "overview",
  "rewards",
  "community",
  "network",
  "account",
] as const;
type View = (typeof views)[number];
const isView = (value: string): value is View =>
  views.some((view) => view === value);
export function App() {
  const { t, locale, setLocale } = useI18n(),
    wallet = useWallet();
  const [view, setView] = useState<View>(() =>
    isView(location.hash.slice(1))
      ? (location.hash.slice(1) as View)
      : "overview",
  );
  const [modal, setModal] = useState<"wallet" | "help" | null>(null),
    [toast, setToast] = useState("");
  const returnFocus = useRef<HTMLElement | null>(null),
    main = useRef<HTMLElement>(null);
  const open = (kind: "wallet" | "help") => {
    returnFocus.current = document.activeElement as HTMLElement;
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
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  const nav = views.map((target) => (
    <a
      key={target}
      href={`#${target}`}
      aria-current={target === view ? "page" : undefined}
    >
      <Icon name={target} />
      <span>{t(`nav.${target}`)}</span>
      <span className="nav-indicator" aria-hidden="true" />
    </a>
  ));
  return (
    <>
      <a href="#main-content" className="skip-link">
        {t("skip")}
      </a>
      <div className="app-shell product-shell">
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
              <span>BNB Smart Chain</span>
              <span>{t(isLocalDemo ? "demo.local" : "demo.testnet")}</span>
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
            <div className="breadcrumb">
              <span className="breadcrumb-root">NARO</span>
              <span aria-hidden="true">/</span>
              {t(`nav.${view}`)}
            </div>
            <div className="header-actions">
              <span className="naro-badge naro-badge--info chain-label">
                <span className="network-dot" aria-hidden="true" />
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
                className={`naro-button naro-button--compact ${wallet.state.address ? "naro-button--secondary" : "naro-button--primary"}`}
                onClick={() => open("wallet")}
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
                <p className="page-eyebrow">{t("product.workspace")}</p>
                <h1>{t(`nav.${view}`)}</h1>
              </div>
              <span className="workspace-status">
                <span className="network-dot" aria-hidden="true" />
                {t(isLocalDemo ? "demo.local" : "demo.testnet")}
              </span>
            </div>
            <Suspense
              fallback={
                <div className="loading-surface" role="status">
                  {t("demo.loading")}
                </div>
              }
            >
              <DemoDashboard view={view} openWallet={() => open("wallet")} />
            </Suspense>
          </main>
          <footer className="app-footer">
            <span>
              © NARO <span aria-hidden="true">·</span>{" "}
              {t(isLocalDemo ? "demo.local" : "demo.testnet")}
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
          {modal === "wallet" ? <WalletPicker /> : <Help />}
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
