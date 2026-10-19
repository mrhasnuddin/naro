import { useState, useRef, useEffect } from "react";
import { ZeroAddress, isAddress, type TransactionReceipt } from "ethers";
import { useI18n, type Key } from "../context";
import { Icon, Panel } from "../components/ui";
import { Modal } from "../components/Modal";
import { WalletAccount } from "../features/wallet/WalletAccount";
import { useWallet } from "../features/wallet/store";
import { formatRawAmount } from "../data/amounts";
import { TARGET_NETWORK, isLocalDemo, chainId } from "./network";
import { useDemoData } from "./useDemoData";
import { waitFailure } from "./transactions";
import { WelcomeHero } from "../components/WelcomeHero";
import { NaroSculpture } from "../components/NaroSculpture";
import {
  deployment,
  prepareAction,
  sendQuote,
  saveDeployment,
  readProvider,
  errorKey,
  type Action,
  type Quote,
} from "./client";
type Phase =
  | "idle"
  | "preparing"
  | "wallet"
  | "pending"
  | "confirmed"
  | "error"
  | "unknown";
export function DemoDashboard({
  view,
  openWallet,
}: {
  view: string;
  openWallet: () => void;
}) {
  const { t, locale, number } = useI18n(),
    wallet = useWallet(),
    live = useDemoData(wallet.state.address, view === "rewards");
  const [inviter, setInviter] = useState(() => {
    const value = new URLSearchParams(location.search).get("inviter");
    return value && isAddress(value) ? value : "";
  });
  const [phase, setPhase] = useState<Phase>("idle"),
    [error, setError] = useState<string | null>(null),
    [quote, setQuote] = useState<Quote | null>(null),
    [hash, setHash] = useState(""),
    [notice, setNotice] = useState(""),
    [clock, setClock] = useState(Date.now());
  const lock = useRef(false),
    trigger = useRef<HTMLElement | null>(null),
    sent = useRef<Quote | null>(null);
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const busy = ["preparing", "wallet", "pending", "unknown"].includes(phase);
  const correct = wallet.state.chainId === TARGET_NETWORK.chainId;
  const data = live.data;
  const amount = (value: bigint, decimals = data?.decimals ?? 18) =>
    formatRawAmount(value, decimals, locale);
  const errorMessage = error ? t(`demo.error.${error}` as Key) : "";
  const start = async (kind: Action) => {
    if (lock.current || !wallet.state.address) return;
    lock.current = true;
    trigger.current = document.activeElement as HTMLElement;
    setError(null);
    setHash("");
    setPhase("preparing");
    try {
      setQuote(await prepareAction(kind, wallet.state.address, inviter));
      setPhase("idle");
    } catch (e) {
      setError(errorKey(e));
      setPhase("error");
    } finally {
      lock.current = false;
    }
  };
  const complete = async (receipt: TransactionReceipt, action: Quote) => {
    if (receipt.status !== 1) throw new Error("TransactionFailed");
    if (action.kind === "deploy") await saveDeployment(receipt, action.sender);
    setPhase("confirmed");
    setQuote(null);
    live.refresh();
    lock.current = false;
  };
  const confirm = async () => {
    if (!quote || lock.current) return;
    lock.current = true;
    sent.current = quote;
    setError(null);
    setPhase("wallet");
    let broadcast = false;
    try {
      const transaction = await sendQuote(quote);
      broadcast = true;
      setHash(transaction.hash);
      setPhase("pending");
      const receipt = await transaction.wait(1, 120000);
      if (!receipt) throw new Error("ConfirmationUnknown");
      await complete(receipt, quote);
    } catch (e) {
      const result = waitFailure(e);
      if (broadcast && result.hash) setHash(result.hash);
      if (broadcast && result.kind === "confirmed") {
        try {
          await complete(result.receipt, quote);
        } catch {
          setPhase("unknown");
        }
      } else if (
        broadcast &&
        (result.kind === "cancelled" || result.kind === "failed")
      ) {
        setPhase("error");
        setError(result.kind === "cancelled" ? "Cancelled" : "failed");
        setQuote(null);
        sent.current = null;
        lock.current = false;
        live.refresh();
      } else if (broadcast) {
        setPhase("unknown");
      } else {
        setError(errorKey(e));
        setPhase("error");
        lock.current = false;
      }
    }
  };
  const checkTx = async () => {
    if (!hash || !sent.current) return;
    try {
      const receipt = await readProvider.getTransactionReceipt(hash);
      if (receipt) await complete(receipt, sent.current);
    } catch (e) {
      setError(errorKey(e));
      if ((e as Error).message === "TransactionFailed") {
        setPhase("error");
        lock.current = false;
      }
    }
  };
  const claimReady = !!data && data.claimable > 0n;
  const chainNow = data
    ? data.timestamp + Math.max(0, Math.floor((clock - data.loadedAt) / 1000))
    : 0;
  const wait = data ? Math.max(0, data.nextClaimAt - chainNow) : 0;
  const share = async () => {
    if (!wallet.state.address) return;
    const url = new URL(location.href);
    url.searchParams.delete("invite");
    url.searchParams.delete("scenario");
    url.searchParams.set("inviter", wallet.state.address);
    if (url.pathname.includes("/tests/"))
      url.pathname = url.pathname.replace(/\/tests\/.*$/, "/dist/");
    url.hash = "overview";
    try {
      await navigator.clipboard.writeText(url.href);
      setNotice(t("demo.copied"));
    } catch {
      setNotice(t("demo.copyFallback") + " " + url.href);
    }
  };
  const exportDeployment = () => {
    const config = deployment();
    if (!config) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(config, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `naro-demo-${chainId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const primary = () =>
    !wallet.state.address ? (
      <button className="naro-button naro-button--primary" onClick={openWallet}>
        {t("wallet.connect")}
      </button>
    ) : !correct ? (
      <button
        className="naro-button naro-button--primary"
        disabled={wallet.state.busy}
        onClick={() => void wallet.switchNetwork()}
      >
        {t("demo.switchNetwork", { network: TARGET_NETWORK.chainName })}
      </button>
    ) : !data?.active ? (
      <button
        className="naro-button naro-button--primary"
        disabled={busy || wallet.state.busy}
        onClick={() => void start("activate")}
      >
        {busy ? (
          <>
            <span className="button-spinner" aria-hidden="true" />
            {t(
              phase === "preparing"
                ? "product.reviewing"
                : "product.processing",
            )}
          </>
        ) : (
          t("demo.activate")
        )}
      </button>
    ) : (
      <button
        className="naro-button naro-button--primary"
        disabled={busy || !claimReady || wallet.state.busy}
        onClick={() => void start("claim")}
      >
        {busy ? (
          <>
            <span className="button-spinner" aria-hidden="true" />
            {t(
              phase === "preparing"
                ? "product.reviewing"
                : "product.processing",
            )}
          </>
        ) : (
          t("demo.reviewClaim")
        )}
      </button>
    );
  const status = (
    <div className={`demo-tx-status tx-${phase}`} aria-live="polite">
      {phase !== "idle" && phase !== "error" && (
        <p>
          {t(
            `demo.${phase === "preparing" ? "preparing" : phase === "wallet" ? "walletWait" : phase}` as Key,
          )}
        </p>
      )}
      {error && (
        <p className="wallet-error" role="alert">
          {errorMessage}
        </p>
      )}
      {hash && (
        <p className="small">
          <span>{t("demo.txHash")}</span>
          <br />
          {isLocalDemo ? (
            <bdi className="address">{hash}</bdi>
          ) : (
            <a
              className="address"
              href={`https://testnet.bscscan.com/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {hash}
            </a>
          )}
        </p>
      )}
      {phase === "unknown" && (
        <button
          className="naro-button naro-button--secondary"
          onClick={() => void checkTx()}
        >
          {t("demo.checkTx")}
        </button>
      )}
    </div>
  );
  const config = deployment();
  return (
    <>
      {!quote && status}
      {!config ? (
        <>
          {view === "overview" && (
            <WelcomeHero
              openWallet={openWallet}
              connected={!!wallet.state.address}
            />
          )}
          {(view === "overview" || view === "rewards") && (
            <div className="summary-grid product-metrics">
              <Panel title="demo.balance" icon="holdings">
                <p className="demo-metric naro-number">
                  — <span className="unit">dNARO</span>
                </p>
              </Panel>
              <Panel title="demo.claimed" icon="rewards">
                <p className="demo-metric naro-number">
                  — <span className="unit">dNARO</span>
                </p>
              </Panel>
              <Panel title="demo.pool" icon="network">
                <p className="demo-metric naro-number">
                  — <span className="unit">dNARO</span>
                </p>
              </Panel>
            </div>
          )}
          {view === "rewards" && (
            <Panel title="demo.history" className="demo-spaced">
              <p className="muted">{t("product.networkWaiting")}</p>
            </Panel>
          )}
          {view === "community" && (
            <Panel title="demo.direct" icon="community">
              <p className="muted">{t("product.networkWaiting")}</p>
              <div className="naro-actions demo-spaced">
                {!wallet.state.address ? (
                  <button
                    className="naro-button naro-button--primary"
                    onClick={openWallet}
                  >
                    {t("wallet.connect")}
                  </button>
                ) : (
                  <a className="text-link" href="#account">
                    {t("product.networkSetup")}
                    <Icon name="arrow" />
                  </a>
                )}
              </div>
            </Panel>
          )}
          {view === "network" && (
            <Panel title="demo.public" icon="network">
              <dl className="account-list">
                <div>
                  <dt>{t("demo.network")}</dt>
                  <dd>{TARGET_NETWORK.chainName}</dd>
                </div>
                <div>
                  <dt>{t("product.poolStatus")}</dt>
                  <dd>{t("product.awaiting")}</dd>
                </div>
              </dl>
              <a
                className="text-link demo-spaced"
                href="https://docs.bnbchain.org/bnb-smart-chain/developers/faucet/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("product.faucet")}
                <Icon name="external" />
              </a>
            </Panel>
          )}
          {view === "account" && (
            <>
              <WalletAccount openWallet={openWallet} />
              <details className="network-setup naro-panel demo-spaced">
                <summary>{t("product.networkSetup")}</summary>
                <p className="muted demo-spaced">{t("demo.deployNote")}</p>
                <div className="account-actions naro-actions">
                  {!isLocalDemo && (
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
                  {!wallet.state.address ? (
                    <button
                      className="naro-button naro-button--primary"
                      onClick={openWallet}
                    >
                      {t("wallet.connect")}
                    </button>
                  ) : !correct ? (
                    <button
                      className="naro-button naro-button--primary"
                      disabled={wallet.state.busy}
                      onClick={() => void wallet.switchNetwork()}
                    >
                      {t("demo.switchNetwork", {
                        network: TARGET_NETWORK.chainName,
                      })}
                    </button>
                  ) : (
                    <button
                      className="naro-button naro-button--primary"
                      disabled={busy}
                      onClick={() => void start("deploy")}
                    >
                      {busy ? t("product.reviewing") : t("demo.deploy")}
                    </button>
                  )}
                </div>
              </details>
            </>
          )}
        </>
      ) : live.loading ? (
        <div className="loading-surface" role="status">
          <span className="loading-orbit" aria-hidden="true" />
          {t("demo.loading")}
        </div>
      ) : live.error ? (
        <Panel title="demo.error" icon="info">
          <p className="wallet-error">{t(`demo.error.${live.error}` as Key)}</p>
          <button
            className="naro-button naro-button--secondary demo-spaced"
            onClick={live.refresh}
          >
            {t("demo.refresh")}
          </button>
        </Panel>
      ) : !wallet.state.address && view !== "network" ? (
        <WelcomeHero openWallet={openWallet} />
      ) : data ? (
        <>
          {(view === "overview" || view === "rewards") && (
            <>
              <div className="overview-grid">
                <section className="reward-hero portal-hero">
                  <div className="reward-copy">
                    <div className="hero-top">
                      <h2 className="section-label">{t("demo.reward")}</h2>
                      <span
                        className={`naro-badge naro-badge--${data.active ? "success" : "info"}`}
                      >
                        {data.active
                          ? t(claimReady ? "demo.eligible" : "account.active")
                          : t("account.pending")}
                      </span>
                    </div>
                    <div className="hero-balance">
                      <span className="naro-number">
                        {amount(data.claimable)}
                      </span>
                      <span className="unit">dNARO</span>
                    </div>
                    <p className="hero-description">
                      {!data.active
                        ? t("demo.inactive")
                        : data.pool < data.reward
                          ? t("demo.poolEmpty")
                          : !claimReady
                            ? t("demo.wait", { seconds: wait })
                            : t("product.claimNote")}
                    </p>
                    <div className="hero-actions naro-actions">
                      {primary()}
                      <a className="text-link" href="#rewards">
                        {t("product.viewRewards")}
                        <Icon name="arrow" />
                      </a>
                    </div>
                    <div className="claim-meta">
                      <span>
                        10 dNARO{" "}
                        <span className="muted">
                          / {t("product.rewardRate")}
                        </span>
                      </span>
                      <span>
                        60s{" "}
                        <span className="muted">/ {t("product.interval")}</span>
                      </span>
                    </div>
                  </div>
                  <NaroSculpture />
                </section>
                {!data.active && (
                  <Panel title="demo.rules" icon="info">
                    <p className="muted">{t("demo.rulesNote")}</p>
                    {!data.active && (
                      <div className="naro-field demo-spaced">
                        <label htmlFor="demo-inviter">
                          {t("demo.inviter")}
                        </label>
                        <input
                          id="demo-inviter"
                          className="naro-input address"
                          value={inviter}
                          onChange={(event) => setInviter(event.target.value)}
                          placeholder="0x…"
                          aria-describedby="demo-inviter-hint"
                          aria-invalid={!!inviter && !isAddress(inviter.trim())}
                        />
                        <p id="demo-inviter-hint" className="naro-field__hint">
                          {inviter && !isAddress(inviter.trim())
                            ? t("demo.inviterInvalid")
                            : t("demo.inviterHint")}
                        </p>
                      </div>
                    )}
                  </Panel>
                )}
              </div>
              <div className="summary-grid product-metrics">
                <Panel title="demo.balance" icon="holdings">
                  <p className="demo-metric naro-number">
                    {amount(data.balance)} <span className="unit">dNARO</span>
                  </p>
                </Panel>
                <Panel title="demo.claimed" icon="rewards">
                  <p className="demo-metric naro-number">
                    {amount(data.claimed)} <span className="unit">dNARO</span>
                  </p>
                </Panel>
                <Panel title="demo.pool" icon="network">
                  <p className="demo-metric naro-number">
                    {amount(data.pool)} <span className="unit">dNARO</span>
                  </p>
                </Panel>
              </div>
            </>
          )}
          {view === "rewards" && (
            <Panel title="demo.history" className="history-panel">
              <p className="muted small">{t("demo.historyNote")}</p>
              {data.historyError ? (
                <p className="wallet-error">{t("demo.historyError")}</p>
              ) : data.history.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>{t("demo.block")}</th>
                        <th>{t("rewards.amount")}</th>
                        <th>{t("demo.txHash")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.history.map((record) => (
                        <tr key={record.hash}>
                          <td>{record.blockNumber}</td>
                          <td>{amount(record.amount)} dNARO</td>
                          <td>
                            {isLocalDemo ? (
                              <bdi className="address">
                                {record.hash.slice(0, 10)}…
                              </bdi>
                            ) : (
                              <a
                                href={`https://testnet.bscscan.com/tx/${record.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {record.hash.slice(0, 10)}…
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="empty-message">{t("demo.emptyHistory")}</p>
              )}
            </Panel>
          )}
          {view === "community" && (
            <div className="summary-grid page-summary-grid">
              <Panel title="demo.direct" icon="community">
                <p className="demo-metric naro-number">
                  {number(data.directCount)}
                </p>
                <p className="muted small demo-spaced">{t("demo.listLimit")}</p>
                {data.referrals.length ? (
                  <ul className="demo-members">
                    {data.referrals.map((address) => (
                      <li key={address}>
                        <bdi className="address">{address}</bdi>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-message">{t("demo.emptyMembers")}</p>
                )}
                {data.active && (
                  <button
                    className="naro-button naro-button--secondary"
                    onClick={() => void share()}
                  >
                    {t("demo.invite")}
                    <Icon name="copy" />
                  </button>
                )}
              </Panel>
              <Panel title="account.inviter" icon="account">
                <p className="address">
                  {data.inviter === ZeroAddress ? t("demo.none") : data.inviter}
                </p>
                <p className="muted small demo-spaced">
                  {t("demo.publicRecord")}
                </p>
              </Panel>
            </div>
          )}
          {view === "network" && (
            <Panel title="demo.public" icon="network">
              <dl className="network-stats">
                {(
                  [
                    ["demo.supply", amount(data.totalSupply), "dNARO"],
                    [
                      "demo.burned",
                      amount(data.initialSupply - data.totalSupply),
                      "dNARO",
                    ],
                    ["demo.pool", amount(data.pool), "dNARO"],
                    ["demo.totalClaimed", amount(data.totalClaimed), "dNARO"],
                    ["demo.members", number(data.memberCount), ""],
                  ] as const
                ).map(([key, value, unit]) => (
                  <div key={key}>
                    <dt>{t(key)}</dt>
                    <dd className="naro-number">
                      {value}
                      <span className="unit">{unit}</span>
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="demo-spaced">
                <span className="small muted">{t("demo.address")}</span>
                <p className="address">{config.address}</p>
                <span className="small muted">{t("demo.tokenAddress")}</span>
                <p className="address">{config.token}</p>
              </div>
            </Panel>
          )}
          {view === "account" && (
            <>
              <WalletAccount openWallet={openWallet} />
              <Panel title="demo.label" className="demo-spaced">
                <dl className="account-list">
                  <div>
                    <dt>{t("account.activation")}</dt>
                    <dd>
                      {t(data.active ? "account.active" : "account.pending")}
                    </dd>
                  </div>
                  <div>
                    <dt>{t("account.inviter")}</dt>
                    <dd className="address">
                      {data.inviter === ZeroAddress
                        ? t("demo.none")
                        : data.inviter}
                    </dd>
                  </div>
                  <div>
                    <dt>{t("demo.balance")}</dt>
                    <dd>{amount(data.balance)} dNARO</dd>
                  </div>
                </dl>
                <div className="account-actions naro-actions">
                  {primary()}
                  <a
                    className="text-link"
                    href="https://www.bnbchain.org/en/testnet-faucet"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("product.faucet")}
                    <Icon name="external" />
                  </a>
                </div>
              </Panel>
              <details className="network-setup demo-spaced">
                <summary>{t("product.networkSetup")}</summary>
                <button className="text-button" onClick={exportDeployment}>
                  {t("demo.export")}
                </button>
              </details>
            </>
          )}
          <div className="snapshot">
            <span>
              {t("demo.block")}: {number(data.blockNumber)}
            </span>
            <button className="text-button" onClick={live.refresh}>
              {t("demo.refresh")}
            </button>
          </div>
        </>
      ) : null}
      {notice && (
        <p className="demo-notice address" role="status">
          {notice}
        </p>
      )}
      {quote && (
        <Modal returnFocus={trigger.current} onDismiss={() => setQuote(null)}>
          <h2 id="dialog-title">
            {t(
              quote.kind === "activate"
                ? "demo.activateTitle"
                : quote.kind === "claim"
                  ? "demo.claimTitle"
                  : "demo.deployTitle",
            )}
          </h2>
          <p>
            {t(
              quote.kind === "deploy"
                ? "demo.deployNote"
                : quote.kind === "activate"
                  ? "demo.publicRecord"
                  : "demo.rulesNote",
            )}
          </p>
          <dl className="quote-list">
            <div>
              <dt>{t("demo.network")}</dt>
              <dd>
                {TARGET_NETWORK.chainName} ({chainId})
              </dd>
            </div>
            <div>
              <dt>{t("demo.sender")}</dt>
              <dd className="address">{quote.sender}</dd>
            </div>
            {quote.kind === "activate" && (
              <>
                <div>
                  <dt>{t("demo.reviewInviter")}</dt>
                  <dd className="address">
                    {quote.inviter === ZeroAddress
                      ? t("demo.none")
                      : quote.inviter}
                  </dd>
                </div>
                <div>
                  <dt>{t("demo.activationFee")}</dt>
                  <dd>{t("demo.gasOnly")}</dd>
                </div>
              </>
            )}
            {quote.kind === "claim" && (
              <div>
                <dt>{t("demo.reward")}</dt>
                <dd>{amount(data?.reward ?? 0n)} dNARO</dd>
              </div>
            )}
            <div>
              <dt>{t("demo.gas")}</dt>
              <dd>
                {formatRawAmount(quote.maxGasCost, 18, locale, 9)}{" "}
                {TARGET_NETWORK.nativeCurrency.symbol}
              </dd>
            </div>
          </dl>
          <p className="muted small">{t("demo.gasNote")}</p>
          {status}
          <button
            className="naro-button naro-button--primary"
            disabled={
              busy ||
              wallet.state.address?.toLowerCase() !==
                quote.sender.toLowerCase() ||
              !correct
            }
            onClick={() => void confirm()}
          >
            {t("demo.confirm")}
          </button>
        </Modal>
      )}
    </>
  );
}
