import { useI18n, type Key } from "../../context";
import { Icon, Panel, RouteLink } from "../../components/ui";
import {
  sample,
  snapshot,
  SAMPLE_ADDRESS,
  SAMPLE_INVITER,
  type AccountPreview,
} from "../../data/dashboard";
interface Actions {
  account: AccountPreview;
  openWallet: () => void;
  openActivation: () => void;
  copyInvite: () => void;
}
export function Amount({
  value,
  digits = 2,
}: {
  value: number;
  digits?: number;
}) {
  const { number } = useI18n();
  return (
    <>
      <span className="naro-number">{number(value, digits)}</span>
      <span className="unit">
        <bdi>NARO</bdi>
      </span>
    </>
  );
}
export function Hero({
  account,
  openWallet,
  openActivation,
  onRewards = false,
}: Omit<Actions, "copyInvite"> & { onRewards?: boolean }) {
  const { t, number } = useI18n();
  if (account !== "active") {
    const isPublic = account === "public";
    return (
      <section className="reward-hero intro-hero" aria-labelledby="hero-title">
        <div className="hero-top">
          <span className="section-label">{t("setup.title")}</span>
          <span
            className={`naro-badge naro-badge--${isPublic ? "info" : "warning"}`}
          >
            {t(`overview.${account}`)}
          </span>
        </div>
        <h2 id="hero-title">
          {t(isPublic ? "hero.public.title" : "hero.setup.title")}
        </h2>
        <p className="hero-description">
          {t(isPublic ? "hero.public.note" : "hero.setup.note")}
        </p>
        <div className="hero-actions naro-actions">
          <button
            className="naro-button naro-button--primary"
            onClick={isPublic ? openWallet : openActivation}
          >
            {t(isPublic ? "wallet.connect" : "hero.setup.action")}
            <Icon name="arrow" />
          </button>
          <RouteLink view="network" label="hero.public.browse" />
        </div>
        <div className="hero-foot">
          <Icon name="info" />
          <p>{t(isPublic ? "app.note" : "activation.boundary")}</p>
        </div>
      </section>
    );
  }
  return (
    <section className="reward-hero" aria-labelledby="hero-title">
      <div className="hero-top">
        <h2 id="hero-title" className="section-label">
          {t("hero.claimable")}
        </h2>
        <span className="naro-badge naro-badge--success">
          <Icon name="check" />
          {t("overview.active")}
        </span>
      </div>
      <div className="hero-balance">
        <Amount value={sample.total} />
      </div>
      <p className="hero-description">{t("hero.note")}</p>
      <div className="hero-actions naro-actions">
        {onRewards ? (
          <button
            className="naro-button"
            disabled
            aria-describedby="claim-limit"
          >
            {t("rewards.preview")}
          </button>
        ) : (
          <a className="naro-button naro-button--primary" href="#rewards">
            {t("hero.review")}
            <Icon name="arrow" />
          </a>
        )}
      </div>
      <dl className="reward-split">
        {(
          [
            ["hero.holdings", sample.holdingsReward],
            ["hero.community", sample.communityReward],
            ["hero.rank", sample.rankReward],
          ] as const
        ).map(([key, value]) => (
          <div key={key}>
            <dt>{t(key)}</dt>
            <dd>{number(value, 2)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
export function Participation({ account }: { account: AccountPreview }) {
  const { t } = useI18n();
  const completed = account === "active" ? 3 : account === "setup" ? 1 : 0;
  return (
    <Panel title="setup.title" icon="account" className="participation">
      <ol className="steps">
        {(["connected", "inviter", "activated"] as const).map((step, index) => (
          <li key={step} className={index < completed ? "is-complete" : ""}>
            <span className="step-marker" aria-hidden="true">
              {index < completed ? <Icon name="check" /> : index + 1}
            </span>
            <span>
              {t(`setup.${step}${index < completed ? "" : ".action"}` as Key)}
            </span>
            {index < completed && (
              <span className="sr-only">{t("setup.completed")}</span>
            )}
          </li>
        ))}
      </ol>
      <p className="muted small">
        {t(
          account === "active"
            ? "setup.ready"
            : account === "setup"
              ? "setup.incomplete"
              : "setup.public",
        )}
      </p>
      <RouteLink view="account" label="setup.account" />
    </Panel>
  );
}
export function Holdings({ account }: { account: AccountPreview }) {
  const { t } = useI18n();
  return (
    <Panel title="holdings.title" icon="holdings" className="holdings-panel">
      {account === "active" ? (
        <>
          <dl className="balance-list">
            <div>
              <dt>{t("holdings.settled")}</dt>
              <dd>
                <Amount value={sample.settled} />
              </dd>
            </div>
            <div>
              <dt>{t("holdings.live")}</dt>
              <dd>
                <Amount value={sample.wallet} />
              </dd>
            </div>
          </dl>
          <p className="muted small">{t("holdings.note")}</p>
        </>
      ) : (
        <div className="empty-state">
          <Icon name="wallet" />
          <p>
            {t(account === "public" ? "holdings.pending" : "holdings.none")}
          </p>
        </div>
      )}
    </Panel>
  );
}
export function CommunitySummary({
  account,
  copyInvite,
}: Pick<Actions, "account" | "copyInvite">) {
  const { t, number } = useI18n();
  return (
    <Panel title="community.title" icon="community" className="community-panel">
      {account === "active" ? (
        <div className="community-stats">
          <div>
            <span className="muted small">{t("community.direct")}</span>
            <strong className="naro-number">{number(sample.members)}</strong>
          </div>
          <div>
            <span className="muted small">{t("community.balance")}</span>
            <strong className="naro-number">
              {number(sample.community)} <span className="unit">NARO</span>
            </strong>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <p>
            {t(account === "public" ? "empty.private" : "community.locked")}
          </p>
        </div>
      )}
      <div className="panel-footer">
        <RouteLink view="community" label="community.open" />
        {account === "active" && (
          <button className="copy-button" onClick={copyInvite}>
            <Icon name="copy" />
            {t("community.invite")}
          </button>
        )}
      </div>
    </Panel>
  );
}
export function NetworkSummary({ full = false }: { full?: boolean }) {
  const { t, number } = useI18n();
  const rows = [
    ["network.supply", number(sample.supply), "NARO"],
    ["network.burned", number(sample.burned), "NARO"],
    ["network.holders", number(sample.holders), ""],
    ["network.stage", t("network.phase"), ""],
  ];
  return (
    <section className={`network-panel ${full ? "naro-panel" : ""}`}>
      <div className="section-heading">
        <div>
          <h2>{t("network.title")}</h2>
          <p className="muted small">{t("network.note")}</p>
        </div>
        {full ? (
          <span className="naro-badge naro-badge--info">{t("demo.only")}</span>
        ) : (
          <RouteLink view="network" label="network.open" />
        )}
      </div>
      <dl className="network-stats">
        {rows.map(([key, value, unit]) => (
          <div key={key}>
            <dt>{t(key as Key)}</dt>
            <dd className="naro-number">
              {value}
              {unit && <span className="unit">{unit}</span>}
            </dd>
          </div>
        ))}
      </dl>
      {full && (
        <p className="muted small network-disclaimer">
          {t("network.disclaimer")}
        </p>
      )}
    </section>
  );
}
export function SampleAccount({
  account,
  openWallet,
  openActivation,
}: Omit<Actions, "copyInvite">) {
  const { t } = useI18n();
  return (
    <section className="naro-panel account-panel">
      <dl className="account-list">
        <div>
          <dt>{t("account.wallet")}</dt>
          <dd>
            {account !== "public" ? (
              <>
                <bdi className="address">{SAMPLE_ADDRESS}</bdi>
                <span className="muted small">{t("account.placeholder")}</span>
              </>
            ) : (
              t("account.noWallet")
            )}
          </dd>
        </div>
        <div>
          <dt>{t("account.chain")}</dt>
          <dd>BNB Smart Chain Testnet</dd>
        </div>
        <div>
          <dt>{t("account.activation")}</dt>
          <dd>
            <span
              className={`naro-badge naro-badge--${account === "active" ? "success" : "warning"}`}
            >
              {t(account === "active" ? "account.active" : "account.pending")}
            </span>
          </dd>
        </div>
        <div>
          <dt>{t("account.inviter")}</dt>
          <dd>
            {account === "active" ? (
              <bdi className="address">{SAMPLE_INVITER}</bdi>
            ) : (
              t("account.unbound")
            )}
          </dd>
        </div>
      </dl>
      <div className="account-actions naro-actions">
        {account === "setup" && (
          <button
            className="naro-button naro-button--primary"
            onClick={openActivation}
          >
            {t("hero.setup.action")}
          </button>
        )}
        <RouteLink view="rewards" label="account.history" button />
        <button className="text-button" onClick={openWallet}>
          {t("wallet.connect")}
        </button>
      </div>
    </section>
  );
}
export function History({ account }: { account: AccountPreview }) {
  const { t, number, locale } = useI18n();
  const date = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(snapshot);
  return (
    <Panel title="rewards.history" className="history-panel">
      {account === "active" ? (
        <div className="table-wrap">
          <table>
            <caption className="sr-only">{t("rewards.history")}</caption>
            <thead>
              <tr>
                {(
                  [
                    "rewards.date",
                    "rewards.category",
                    "rewards.amount",
                    "rewards.status",
                  ] as const
                ).map((key) => (
                  <th key={key} scope="col">
                    {t(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["hero.holdings", sample.holdingsReward],
                  ["hero.community", sample.communityReward],
                  ["hero.rank", sample.rankReward],
                ] as const
              ).map(([key, value]) => (
                <tr key={key}>
                  <td>{date}</td>
                  <td>{t(key)}</td>
                  <td className="numeric">{number(value, 2)} NARO</td>
                  <td>
                    <span className="naro-badge naro-badge--warning">
                      {t("rewards.unclaimed")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-message">{t("empty.private")}</p>
      )}
      <p className="muted small">{t("rewards.historyNote")}</p>
    </Panel>
  );
}
export function Dashboard({ view, ...actions }: Actions & { view: string }) {
  const { t, locale, number } = useI18n();
  if (view === "overview")
    return (
      <>
        <div className="overview-grid">
          <Hero {...actions} />
          <Participation account={actions.account} />
        </div>
        <div className="summary-grid">
          <Holdings account={actions.account} />
          <CommunitySummary {...actions} />
        </div>
        <NetworkSummary />
      </>
    );
  if (view === "rewards")
    return (
      <>
        <div className="overview-grid">
          <Hero {...actions} onRewards />
          <section className="naro-panel notice-panel">
            <Icon name="info" />
            <h2>{t("rewards.preview")}</h2>
            <p className="muted" id="claim-limit">
              {t("rewards.previewNote")}
            </p>
          </section>
        </div>
        <History account={actions.account} />
      </>
    );
  if (view === "community")
    return (
      <>
        <div className="summary-grid page-summary-grid">
          <CommunitySummary {...actions} />
          <Panel title="community.inviter" icon="account">
            <p className="address">
              {actions.account === "active"
                ? SAMPLE_INVITER
                : t("account.unbound")}
            </p>
            <p className="muted small">
              {t(
                actions.account === "active"
                  ? "community.inviterNote"
                  : "community.locked",
              )}
            </p>
          </Panel>
        </div>
        <Panel title="community.members" className="members-panel">
          <p className="member-count">
            {actions.account === "active"
              ? t(
                  `community.members.${new Intl.PluralRules(locale).select(sample.members)}` as Key,
                  { count: number(sample.members) },
                )
              : t("community.empty")}
          </p>
          <p className="muted small">{t("community.membersNote")}</p>
        </Panel>
      </>
    );
  if (view === "network")
    return (
      <>
        <NetworkSummary full />
        <Panel title="network.rules" className="rules-panel">
          <p className="muted">{t("network.rulesNote")}</p>
        </Panel>
      </>
    );
  return (
    <>
      <p className="sample-account-note muted">
        {t("wallet.sample")}. {t("wallet.sampleNote")}
      </p>
      <SampleAccount {...actions} />
    </>
  );
}
