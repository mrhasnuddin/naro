import { useI18n } from "../context";
import { Icon } from "./ui";
import { NaroSculpture } from "./NaroSculpture";
export function WelcomeHero({
  openWallet,
  connected = false,
  onNavigate,
}: {
  openWallet: () => void;
  connected?: boolean;
  onNavigate?: (view: string) => void;
}) {
  const { t } = useI18n();
  return (
    <section className="portal-hero welcome-hero">
      <div className="portal-copy">
        <span className="hero-kicker">
          <span className="network-dot" aria-hidden="true" />
          {t("product.onchain")}
        </span>
        <h2>
          {t("product.welcome")}
          <br />
          <span>{t("product.connected")}</span>
        </h2>
        <p className="portal-description">{t("product.welcomeNote")}</p>
        <div className="portal-actions">
          <button
            className="naro-button naro-button--primary"
            onClick={openWallet}
          >
            <Icon name="wallet" />
            {t(connected ? "product.connectedWallet" : "wallet.connect")}
            <Icon name="arrow" />
          </button>
          <a
            className="text-link"
            href="#test-lab"
            onClick={(event) => {
              event.preventDefault();
              onNavigate?.("network");
            }}
          >
            {t("nav.network")}
            <Icon name="arrow" />
          </a>
        </div>
        <p className="hero-trust">
          <Icon name="account" />
          {t("product.selfCustody")}
        </p>
      </div>
      <NaroSculpture />
    </section>
  );
}
