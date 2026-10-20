import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useI18n, type Locale } from "./context";
import { Icon, Select } from "./components/ui";
import { Modal } from "./components/Modal";
import { NaroHelp } from "./parity/BrandContent";
import {
  primaryViews,
  currentView,
  parentView,
  titles,
  type View,
} from "./parity/routes";
import { languages } from "./locales";
import { WalletPicker } from "./features/wallet/WalletPicker";
import { isLocalDemo } from "./demo/network";
import { useWallet, shortAddress } from "./features/wallet/store";
import logo from "../../design-system/assets/naro-logo.png";
import { initialDataMode, type DataMode } from "./parity/test-data";
const DemoDashboard = lazy(() =>
  import("./demo/DemoDashboard").then((m) => ({ default: m.DemoDashboard })),
);
const NaroDashboard = lazy(() =>
  import("./parity/NaroDashboard").then((m) => ({ default: m.NaroDashboard })),
);
export function App() {
  const { t, locale, setLocale } = useI18n(),
    wallet = useWallet();
  const [view, setView] = useState<View>(currentView);
  const [dataMode, setDataMode] = useState<DataMode>(() => {
    try {
      return initialDataMode(
        location.search,
        localStorage.getItem("naro:data-mode"),
      );
    } catch {
      return initialDataMode(location.search, null);
    }
  });
  const [labView, setLabView] = useState("overview");
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
      if (location.hash === "#main-content") return;
      setView(currentView());
      requestAnimationFrame(() => {
        main.current?.focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: "instant" });
      });
    };
    window.addEventListener("hashchange", listener);
    window.addEventListener("popstate", listener);
    return () => {
      window.removeEventListener("hashchange", listener);
      window.removeEventListener("popstate", listener);
    };
  }, []);
  useEffect(() => {
    document.title = `NARO | ${t(titles[view])}`;
  }, [view, locale, t]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  const nav = primaryViews.map((target) => (
    <a
      key={target}
      href={`#${target}`}
      onClick={() => {
        if (view === target) {
          main.current?.focus({ preventScroll: true });
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      }}
      aria-current={target === parentView(view) ? "page" : undefined}
    >
      <Icon name={target} />
      <span>
        {t(
          target === "overview"
            ? "orig.nav.home"
            : target === "rewards"
              ? "orig.nav.mining"
              : target === "network"
                ? "orig.nav.data"
                : target === "swap"
                  ? "orig.nav.swap"
                  : "orig.nav.mine",
        )}
      </span>
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
          <p className="sidebar-caption">NARO</p>
          <nav id="desktop-nav" aria-label={t("nav.main")}>
            {nav}
            <a
              href="#community"
              aria-current={view === "community" ? "page" : undefined}
            >
              <Icon name="community" />
              <span>{t("orig.nav.team")}</span>
              <span className="nav-indicator" aria-hidden="true" />
            </a>
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
              {t(titles[view])}
            </div>
            <div className="header-actions">
              <span className="naro-badge naro-badge--info chain-label">
                <span className="network-dot" aria-hidden="true" />
                {t(isLocalDemo ? "demo.local" : "demo.testnet")}
              </span>
              <Select
                id="locale"
                label={t("orig.lang.title")}
                value={locale}
                displayValue={
                  {
                    en: "EN",
                    "zh-Hans": "中文",
                    "zh-Hant": "繁中",
                    ko: "한국어",
                    ja: "日本語",
                    vi: "VI",
                    hi: "HI",
                    ur: "UR",
                    id: "ID",
                  }[locale]
                }
                onChange={(value) => {
                  setLocale(value as Locale);
                  setToast(
                    languages.find((l) => l.value === value)?.label ?? value,
                  );
                }}
              >
                {languages.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
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
                    : t("orig.common.connectWallet")}
                </span>
              </button>
            </div>
          </header>
          <main
            ref={main}
            id="main-content"
            className={`page-content page-${view}`}
            tabIndex={-1}
          >
            <div className="page-heading">
              <div>
                <h1>{t(titles[view])}</h1>
              </div>
              {view !== "test-lab" ? (
                <label className="data-source">
                  <span className="sr-only">{t("mobile.source")}</span>
                  <select
                    aria-label={t("mobile.source")}
                    value={dataMode}
                    onChange={(e) => {
                      const next = e.target.value as DataMode;
                      setDataMode(next);
                      try {
                        localStorage.setItem("naro:data-mode", next);
                      } catch {
                        /* optional persistence */
                      }
                      const url = new URL(location.href);
                      url.searchParams.set("data", next);
                      history.replaceState(null, "", url);
                    }}
                  >
                    <option value="test">{t("mobile.test")}</option>
                    <option value="live">{t("mobile.live")}</option>
                  </select>
                </label>
              ) : (
                <span className="workspace-status">
                  <span className="network-dot" aria-hidden="true" />
                  {t(isLocalDemo ? "demo.local" : "demo.testnet")}
                </span>
              )}
            </div>
            <Suspense
              fallback={
                <div className="loading-surface" role="status">
                  {t("orig.common.loading")}
                </div>
              }
            >
              {view === "test-lab" ? (
                <>
                  <a className="text-link" href="#account">
                    ← {t("parity.closeTools")}
                  </a>
                  <p className="muted">{t("parity.testToolsNote")}</p>
                  <div className="parity-tabs lab-tabs">
                    {[
                      "overview",
                      "rewards",
                      "community",
                      "network",
                      "account",
                    ].map((v) => (
                      <button
                        key={v}
                        aria-pressed={labView === v}
                        onClick={() => setLabView(v)}
                      >
                        {t(`nav.${v}` as import("./context").Key)}
                      </button>
                    ))}
                  </div>
                  <DemoDashboard
                    view={labView}
                    openWallet={() => open("wallet")}
                    onNavigate={(value) => {
                      setLabView(value);
                      main.current?.focus({ preventScroll: true });
                      window.scrollTo({ top: 0, behavior: "instant" });
                    }}
                  />
                </>
              ) : (
                <NaroDashboard
                  key={dataMode}
                  view={view}
                  dataMode={dataMode}
                  openWallet={() => open("wallet")}
                />
              )}
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
          {modal === "wallet" ? <WalletPicker /> : <NaroHelp />}
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
