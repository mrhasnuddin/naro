import { useI18n, type Key } from "../../context";
import { useWallet, TESTNET } from "./store";
import { useNativeBalance } from "./useNativeBalance";
import { formatRawAmount } from "../../data/amounts";
import { Panel, Icon } from "../../components/ui";
export function WalletAccount({ openWallet }: { openWallet: () => void }) {
  const { t, locale } = useI18n(),
    wallet = useWallet(),
    balance = useNativeBalance();
  const { address, chainId } = wallet.state;
  if (!address)
    return (
      <Panel title="wallet.real" icon="wallet">
        <p className="muted">{t("app.noWallet")}</p>
        <div className="account-actions naro-actions">
          <button
            className="naro-button naro-button--primary"
            onClick={openWallet}
          >
            {t("wallet.connect")}
            <Icon name="arrow" />
          </button>
        </div>
      </Panel>
    );
  return (
    <Panel
      title="wallet.real"
      icon="wallet"
      className="account-panel live-wallet-panel"
    >
      <dl className="account-list">
        <div>
          <dt>{t("account.wallet")}</dt>
          <dd>
            <bdi className="address">{address}</bdi>
          </dd>
        </div>
        <div>
          <dt>{t("account.chain")}</dt>
          <dd>
            {chainId === TESTNET.chainId ? (
              <span className="wallet-success">{TESTNET.chainName}</span>
            ) : (
              <span className="wallet-warning">
                {t("wallet.wrong", { chain: chainId || "?" })}
              </span>
            )}
          </dd>
        </div>
        {chainId === TESTNET.chainId && (
          <div>
            <dt>
              {t("demo.nativeBalance", {
                symbol: TESTNET.nativeCurrency.symbol,
              })}
            </dt>
            <dd aria-live="polite">
              {balance.result?.status === "ready"
                ? `${formatRawAmount(balance.result.value!, 18, locale)} ${TESTNET.nativeCurrency.symbol}`
                : balance.result?.status === "error"
                  ? t("app.balanceError")
                  : t("app.balanceLoading")}
            </dd>
          </div>
        )}
      </dl>
      {wallet.state.error && (
        <p className="wallet-error" role="alert">
          {t(`wallet.error.${wallet.state.error}` as Key)}
        </p>
      )}
      <div className="account-actions naro-actions">
        {TESTNET.chainId === "0x61" && (
          <a
            className="text-link"
            href="https://docs.bnbchain.org/bnb-smart-chain/developers/faucet/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("product.faucet")}
            <Icon name="external" />
          </a>
        )}
        {chainId === TESTNET.chainId ? (
          <>
            <button
              className="naro-button naro-button--secondary"
              onClick={balance.refresh}
              disabled={balance.result?.status === "loading"}
            >
              {t("app.refresh")}
            </button>
            {TESTNET.blockExplorerUrls.length > 0 && (
              <a
                className="text-link"
                href={`https://testnet.bscscan.com/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("app.explorer")}
                <Icon name="external" />
              </a>
            )}
          </>
        ) : (
          <button
            className="naro-button naro-button--primary"
            disabled={wallet.state.busy}
            onClick={() => void wallet.switchNetwork()}
          >
            {t("demo.switchNetwork", { network: TESTNET.chainName })}
          </button>
        )}
        <button className="text-button" onClick={openWallet}>
          {t("wallet.connected")}
        </button>
      </div>
    </Panel>
  );
}
