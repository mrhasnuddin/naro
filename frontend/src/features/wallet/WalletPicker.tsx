import { useI18n, type Key } from "../../context";
import { useWallet, TESTNET } from "./store";
import { Icon } from "../../components/ui";
import metamask from "../../../../prototype/assets/wallets/metamask.svg";
import trust from "../../../../prototype/assets/wallets/trust-wallet.svg";
import rabby from "../../../../prototype/assets/wallets/rabby.png";
import coinbase from "../../../../prototype/assets/wallets/coinbase-wallet.png";
const downloads = [
  { name: "MetaMask", url: "https://metamask.io/download/", logo: metamask },
  {
    name: "Trust Wallet",
    url: "https://trustwallet.com/download",
    logo: trust,
  },
  { name: "Rabby Wallet", url: "https://rabby.io/", logo: rabby },
  {
    name: "Coinbase Wallet",
    url: "https://www.coinbase.com/wallet/downloads",
    logo: coinbase,
  },
];
export function WalletPicker() {
  const { t } = useI18n();
  const wallet = useWallet();
  const { address, busy, error } = wallet.state;
  return (
    <>
      <h2 id="dialog-title">
        {t(address ? "wallet.connected" : "wallet.title")}
      </h2>
      <p>{t(address ? "demo.walletNote" : "wallet.note")}</p>
      <div id="wallet-feedback" role="status" aria-live="polite">
        {busy ? (
          <p>
            <Icon name="wallet" />
            {t("wallet.waiting")}
          </p>
        ) : error ? (
          <p className="wallet-error">{t(`wallet.error.${error}` as Key)}</p>
        ) : null}
      </div>
      {address ? (
        <>
          <div className="wallet-session">
            <span className="section-label">{wallet.state.name}</span>
            <bdi className="address">{address}</bdi>
            <span
              className={
                wallet.state.chainId === TESTNET.chainId
                  ? "wallet-success"
                  : "wallet-warning"
              }
            >
              {wallet.state.chainId === TESTNET.chainId
                ? TESTNET.chainName
                : t("wallet.wrong", { chain: wallet.state.chainId || "?" })}
            </span>
          </div>
          {wallet.state.chainId !== TESTNET.chainId && (
            <button
              className="naro-button naro-button--primary"
              disabled={busy}
              onClick={() => void wallet.switchNetwork()}
            >
              {t("demo.switchNetwork", { network: TESTNET.chainName })}
            </button>
          )}
          <button
            className="naro-button naro-button--secondary"
            disabled={busy}
            onClick={wallet.forget}
          >
            {t("wallet.disconnect")}
          </button>
          <p className="muted small">{t("wallet.forgetNote")}</p>
        </>
      ) : (
        <>
          <section className="wallet-group">
            <h3>{t("wallet.available")}</h3>
            {wallet.entries.length ? (
              <ul className="wallet-list">
                {wallet.entries.map((entry) => (
                  <li key={entry.id}>
                    <button
                      className="naro-wallet-option"
                      disabled={busy}
                      onClick={() => void wallet.connect(entry)}
                    >
                      {entry.image ? (
                        <img src={entry.image} alt="" width="40" height="40" />
                      ) : (
                        <span className="wallet-avatar">
                          <Icon name="wallet" />
                        </span>
                      )}
                      <span className="wallet-option-copy">
                        <strong>{entry.name}</strong>
                        <span>{t("wallet.detected")}</span>
                      </span>
                      <Icon name="arrow" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="wallet-empty">{t("wallet.none")}</p>
            )}
            <button
              className="text-button text-link"
              disabled={busy}
              onClick={wallet.refresh}
            >
              {t("wallet.refresh")}
            </button>
          </section>
          <section className="wallet-group">
            <h3>{t("wallet.getHelp")}</h3>
            <ul className="wallet-list wallet-install-list">
              {downloads.map((item) => (
                <li key={item.name}>
                  <a
                    className="naro-wallet-option"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src={item.logo} width="40" height="40" alt="" />
                    <span className="wallet-option-copy">
                      <strong>{item.name}</strong>
                      <span>{t("wallet.install", { name: item.name })}</span>
                    </span>
                    <Icon name="external" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
      <p className="wallet-security small muted">{t("wallet.security")}</p>
    </>
  );
}
