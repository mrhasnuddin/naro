import { useEffect, useRef, useState } from "react";
import { useI18n, type Key } from "../context";
import { Icon } from "../components/ui";
import { NaroMascot } from "./NaroMascot";
import { brandAsset } from "./assets";

export const officialLinks = [
  {
    name: "X",
    url: "https://x.com/Naro_Officials",
    desc: "socialXDesc",
    action: "socialXAct",
  },
  {
    name: "Telegram",
    url: "https://t.me/NARO_OFFICIALS",
    desc: "socialTgDesc",
    action: "socialTgAct",
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@NARO_Officials",
    desc: "socialYtDesc",
    action: "socialYtAct",
  },
  {
    name: "Docs",
    url: "https://naro-26smrol.gamma.site/",
    desc: "socialDocsDesc",
    action: "socialDocsAct",
  },
];
export const faqNumbers = [1, 2, 3, 4, 5, 7];
export function PlainTitle({ text }: { text: string }) {
  return (
    <>
      {text.split(/<br\s*\/?>/i).map((s, i) => (
        <span key={i}>
          {s.replace(/<[^>]*>/g, "")}
          {i < text.split(/<br\s*\/?>/i).length - 1 && <br />}
        </span>
      ))}
    </>
  );
}
export function Highlights({
  openWallet,
  connected,
  active,
  completed = false,
  onTour,
}: {
  openWallet: () => void;
  connected: boolean;
  active: boolean | null;
  completed?: boolean;
  onTour: () => void;
}) {
  const { t, locale } = useI18n();
  const [index, setIndex] = useState(1),
    [paused, setPaused] = useState(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    [hover, setHover] = useState(false),
    [visible, setVisible] = useState(true);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) =>
      setVisible(e.isIntersecting),
    );
    if (root.current) observer.observe(root.current);
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      if (motion.matches) setPaused(true);
    };
    motion.addEventListener("change", change);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", change);
    };
  }, []);
  useEffect(() => {
    if (paused || hover || !visible) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") setIndex((i) => (i + 1) % 5);
    }, 7000);
    return () => clearInterval(timer);
  }, [paused, hover, visible]);
  const stage = !connected
    ? "guide1"
    : active === null
      ? "account"
      : !active
        ? "guide2"
        : !completed
          ? "guide3"
          : "guideDone";
  const key = index === 0 ? stage : `slide${index}`;
  const choose = (i: number) => {
    setIndex((i + 5) % 5);
    setPaused(true);
  };
  return (
    <section
      ref={root}
      className={`naro-highlights campaign-carousel ${index === 0 ? "campaign-guide" : "campaign-artwork"}`}
      aria-label={t("parity.banners")}
      aria-roledescription="carousel"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setHover(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHover(false);
      }}
    >
      <div className="highlight-top">
        <div className="highlight-copy" key={key}>
          <p className="hero-kicker">
            {index === 1 ? (
              <span
                className="campaign-partners"
                aria-label={t("orig.home.partnerAlt")}
              >
                <img
                  src={brandAsset("logo-uxuy.png")}
                  alt="UXUY"
                  width="73"
                  height="24"
                />
                <span aria-hidden="true">×</span>
                <img
                  src={brandAsset(
                    locale === "zh-Hans" || locale === "zh-Hant"
                      ? "logo-radar-dao.png"
                      : "logo-radar-dao-en.png",
                  )}
                  alt="Radar DAO"
                  width="104"
                  height="24"
                />
              </span>
            ) : (
              t(key === "account" ? "orig.mine.title" : `orig.home.${key}Eye`)
            )}
          </p>
          <h2>
            <PlainTitle
              text={t(
                key === "account"
                  ? "parity.accountTitle"
                  : `orig.home.${key}Title`,
              )}
            />
          </h2>
          <p className="highlight-sub">
            {t(
              key === "account"
                ? "parity.recordUnavailable"
                : key === "guide3"
                  ? "orig.closed.desc"
                  : `orig.home.${key}Sub`,
            )}
          </p>
          <div className="naro-actions">
            {!connected ? (
              <button
                className="naro-button naro-button--primary"
                onClick={openWallet}
              >
                {t("orig.common.connectWallet")}
                <Icon name="arrow" />
              </button>
            ) : (
              <a
                className="naro-button naro-button--primary"
                href={
                  active === null
                    ? "#account"
                    : !active
                      ? "#activate"
                      : completed
                        ? "#rewards"
                        : "#ieo"
                }
              >
                {t(
                  active === null
                    ? "orig.nav.mine"
                    : !active
                      ? "orig.home.ctaActivate"
                      : completed
                        ? "orig.home.goMining"
                        : "orig.home.joinIeo",
                )}
                <Icon name="arrow" />
              </a>
            )}
            <button className="text-button" onClick={onTour}>
              {t("orig.mine.guide")}
            </button>
          </div>
        </div>
        {index === 0 ? (
          <NaroMascot
            bubble={t(
              key === "account" ? "orig.mascot.hi" : `orig.home.${key}Bubble`,
            )}
            paused={paused || hover || !visible}
          />
        ) : (
          <div className="campaign-visual" key={index}>
            <img
              src={`${import.meta.env.BASE_URL}banners/${["", "launchpad", "holding", "burn", "community"][index]}.webp`}
              alt=""
              width="800"
              height="800"
              style={{
                animationPlayState:
                  paused || hover || !visible ? "paused" : "running",
              }}
              fetchPriority={index === 1 ? "high" : "auto"}
            />
            <span className="campaign-caption">
              {t(`orig.home.${key}Bubble`)}
            </span>
          </div>
        )}
      </div>
      <div className="highlight-controls">
        <div
          className="banner-dots"
          role="group"
          aria-label={t("parity.banners")}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <button
              key={i}
              aria-label={t("orig.home.slideAria", { n: i + 1 })}
              aria-pressed={i === index}
              onClick={() => choose(i)}
            >
              <span />
            </button>
          ))}
        </div>
        <span className="onboarding-progress">
          <b>{!connected ? 0 : active ? (completed ? 3 : 2) : 1} / 3</b>
          {t(
            !connected
              ? "orig.home.nextConnect"
              : active === null
                ? "parity.recordUnavailable"
                : active
                  ? completed
                    ? "orig.home.doneGuide"
                    : "orig.home.nextSubscribe"
                  : "orig.home.nextActivate",
          )}
        </span>
        <div className="banner-arrows">
          <button
            className="icon-button"
            aria-label={t("parity.previous")}
            onClick={() => choose(index - 1)}
          >
            ←
          </button>
          <button
            className="icon-button motion-toggle"
            aria-label={t(paused ? "parity.play" : "parity.pause")}
            onClick={() => setPaused(!paused)}
          >
            {paused ? "▶" : "Ⅱ"}
          </button>
          <button
            className="icon-button"
            aria-label={t("parity.next")}
            onClick={() => choose(index + 1)}
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
export function Faq() {
  const { t } = useI18n();
  return (
    <section className="naro-panel naro-faq" id="naro-faq">
      <h2>{t("orig.home.faqTitle")}</h2>
      {faqNumbers.map((n) => (
        <details key={n}>
          <summary>
            {t(`orig.home.faq${n}q`)}
            <span aria-hidden="true">+</span>
          </summary>
          <p>{t(`orig.home.faq${n}a`)}</p>
        </details>
      ))}
    </section>
  );
}
export function OfficialCommunity() {
  const { t } = useI18n();
  return (
    <section className="official-community">
      <div className="section-title">
        <h2>{t("orig.home.socialTitle")}</h2>
        <span className="muted small">{t("orig.home.socialTip")}</span>
      </div>
      <div className="social-grid">
        {officialLinks.map((link) => (
          <a
            className="naro-panel social-card"
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div>
              <h3>
                {link.name === "Docs" ? t("orig.home.socialDocs") : link.name}
              </h3>
              <p className="small muted">{t(`orig.home.${link.desc}`)}</p>
            </div>
            <span className="text-link">
              {t(`orig.home.${link.action}`)}
              <Icon name="external" />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
export function AboutNaro() {
  const { t, locale } = useI18n();
  return (
    <div className="naro-about" id="about-naro">
      <section className="naro-panel ecosystem-panel">
        <div className="section-title">
          <h2>{t("orig.home.aboutTitle")}</h2>
          <span className="naro-badge naro-badge--success">BSC</span>
        </div>
        <p className="about-lead">{t("orig.home.aboutLead")}</p>
        <p className="muted">{t("orig.home.aboutRest")}</p>
        <div className="partner-grid">
          <div>
            <img
              src={brandAsset("logo-uxuy.png")}
              alt="UXUY"
              width="130"
              height="38"
            />
            <p>{t("orig.home.ecoTrade")}</p>
            <p className="muted small">{t("orig.home.ecoLiq")}</p>
          </div>
          <div>
            <img
              src={brandAsset(
                locale.startsWith("zh")
                  ? "logo-radar-dao.png"
                  : "logo-radar-dao-en.png",
              )}
              alt="Radar DAO"
              width="130"
              height="38"
            />
            <p>{t("orig.home.ecoCommunity")}</p>
            <p className="muted small">{t("orig.home.ecoConsensus")}</p>
          </div>
        </div>
        <div className="protocol-tags">
          {["ecoIssue", "ecoConnect", "ecoCycle"].map((k) => (
            <span key={k}>{t(`orig.home.${k}`)}</span>
          ))}
        </div>
      </section>
      <div className="principles-strip">
        {[
          "tagDecentralized",
          "tagFair",
          "tagDeflation",
          "tagAnti",
          "tagMine",
          "tagCircuit",
        ].map((k) => (
          <span key={k}>
            <i aria-hidden="true" />
            {t(`orig.home.${k}`)}
          </span>
        ))}
      </div>
      <section className="capabilities-section">
        <div className="section-title">
          <div>
            <p className="page-eyebrow">{t("orig.home.capsEyebrow")}</p>
            <h2>{t("orig.home.capsTitle")}</h2>
          </div>
          <NaroMascot small />
        </div>
        <p className="muted">{t("orig.home.capsLead")}</p>
        <div className="capability-grid">
          {["Issue", "Community", "Join", "Trade", "Liq", "Ai"].map((k, i) => (
            <article className="naro-panel capability-card" key={k}>
              <span className="cap-number">0{i + 1}</span>
              <h3>{t(`orig.home.cap${k}`)}</h3>
              <p className="muted">{t(`orig.home.cap${k}Desc`)}</p>
            </article>
          ))}
        </div>
        <p className="capability-foot">{t("orig.home.capsFoot")}</p>
      </section>
      <Faq />
      <OfficialCommunity />
      <p className="risk-copy small muted">{t("orig.home.risk")}</p>
    </div>
  );
}
export function NaroHelp() {
  const { t } = useI18n();
  return (
    <div className="parity-help">
      <h2 id="dialog-title">{t("help.label")}</h2>
      <Faq />
      <OfficialCommunity />
    </div>
  );
}
