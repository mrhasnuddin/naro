import { useEffect, useRef, useState, type ReactNode } from "react";
import { useI18n, type Key } from "../context";
import { Icon } from "../components/ui";
import { Modal } from "../components/Modal";
import { WalletAccount } from "../features/wallet/WalletAccount";
import { useWallet } from "../features/wallet/store";
import { formatRawAmount } from "../data/amounts";
import { Highlights, AboutNaro } from "./BrandContent";
import { decimalRaw, sumDecimals, holdingZone } from "./amounts";
import { NaroMascot } from "./NaroMascot";
import { brandAsset } from "./assets";
import { inviteFromSearch, validInvite, type View } from "./routes";
import { useNaroRecords, type RewardRecord, type Branch } from "./records";

function Section({
  title,
  children,
  className = "",
}: {
  title: Key;
  children: ReactNode;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <section className={`naro-panel parity-section ${className}`}>
      <h2>{t(title)}</h2>
      {children}
    </section>
  );
}
function Metric({
  label,
  value,
  unit,
}: {
  label: Key;
  value?: ReactNode;
  unit?: string;
}) {
  const { t } = useI18n();
  return (
    <div className="parity-metric">
      <dt>{t(label)}</dt>
      <dd>
        <span className="naro-number">{value ?? "—"}</span>
        {unit && <span className="unit">{unit}</span>}
      </dd>
    </div>
  );
}
function Back({ to = "account" }: { to?: string }) {
  const { t } = useI18n();
  return (
    <a className="text-link parity-back" href={`#${to}`}>
      ← {t("parity.back")}
    </a>
  );
}
export function NaroDashboard({
  view,
  openWallet,
}: {
  view: View;
  openWallet: () => void;
}) {
  const { t, locale } = useI18n(),
    wallet = useWallet();
  const records = useNaroRecords(wallet.state.address, view),
    d = records.dashboard,
    n = records.network,
    m = d?.mining;
  const [tab, setTab] = useState<"Static" | "Promo" | "Rank">("Static"),
    [filter, setFilter] = useState("all");
  const [dialog, setDialog] = useState<"tour" | "poster" | null>(null),
    [step, setStep] = useState(0),
    [pose, setPose] = useState("idle"),
    [qr, setQr] = useState<{ url: string; value: string } | null>(null);
  const [notice, setNotice] = useState(""),
    [code, setCode] = useState(() => inviteFromSearch(location.search)),
    [locked, setLocked] = useState(() => !!inviteFromSearch(location.search)),
    [attempted, setAttempted] = useState(false);
  const focus = useRef<HTMLElement | null>(null),
    guideSeen = useRef(false);
  const [reverse, setReverse] = useState(false),
    [input, setInput] = useState(""),
    [slippage, setSlippage] = useState("1");
  const active =
      typeof d?.ledgerRegistered === "boolean" ? d.ledgerRegistered : null,
    connected = !!wallet.state.address;
  const amount = (v: string | number | undefined | null, digits = 2) => {
    if (v === undefined || v === null) return "—";
    const raw = decimalRaw(String(v));
    return raw === null ? "—" : formatRawAmount(raw, 18, locale, digits);
  };
  const ratio = (value: number | undefined) =>
    value !== undefined && Number.isFinite(value) && value >= 0 && value <= 100
      ? `${value}%`
      : "—";
  const open = (kind: "tour" | "poster") => {
    focus.current = document.activeElement as HTMLElement;
    setDialog(kind);
    setStep(0);
  };
  useEffect(() => {
    setNotice("");
    if (
      view === "overview" &&
      !guideSeen.current &&
      new URLSearchParams(location.search).get("guide") === "1"
    ) {
      guideSeen.current = true;
      setDialog("tour");
    }
  }, [view]);
  const inviteCode =
    active && /^[A-Za-z0-9]{4,16}$/.test(d?.invitationCode ?? "")
      ? d!.invitationCode!
      : "";
  const inviteUrl = inviteCode
    ? (() => {
        const u = new URL("/", location.origin);
        u.searchParams.set("ref", inviteCode);
        u.hash = "activate";
        return u.href;
      })()
    : "";
  useEffect(() => {
    let cancelled = false;
    setQr(null);
    if (dialog === "poster" && inviteUrl)
      void import("qrcode")
        .then((q) =>
          q.toDataURL(inviteUrl, {
            width: 240,
            margin: 2,
            errorCorrectionLevel: "M",
          }),
        )
        .then((url) => {
          if (!cancelled) setQr({ url: inviteUrl, value: url });
        })
        .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [dialog, inviteUrl]);
  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(t("orig.common.copied"));
    } catch {
      setNotice(t("orig.common.copyFailed"));
    }
  };
  const status = (kind: "account" | "network" = "account") => (
    <div className="record-status" role="status">
      <span
        className={`network-dot ${records.loading ? "is-loading" : "is-unavailable"}`}
        aria-hidden="true"
      />
      {records.loading
        ? t("orig.common.loading")
        : kind === "account" && !connected
          ? t("parity.connectRecords")
          : t(
              kind === "network"
                ? "parity.networkUnavailable"
                : "parity.recordUnavailable",
            )}
      <button
        className="text-button"
        disabled={records.loading}
        onClick={records.refresh}
      >
        {t("orig.common.refresh")}
      </button>
    </div>
  );
  const connectAction = () => (
    <button className="naro-button naro-button--primary" onClick={openWallet}>
      {t("orig.common.connectWallet")}
      <Icon name="wallet" />
    </button>
  );
  const miniLinks = (
    <div className="parity-shortcuts">
      {[
        ["rewards", "orig.nav.mining", "rewards"],
        ["community", "orig.team.title", "community"],
        ["earnings", "orig.mine.earnings", "holdings"],
        ["ieo", "orig.home.joinIeo", "arrow"],
      ].map(([to, label, icon]) => (
        <a href={`#${to}`} key={to}>
          <Icon name={icon} />
          {t(label as Key)}
          <Icon name="arrow" />
        </a>
      ))}
    </div>
  );
  const miningHero = (
    <section className="naro-panel mining-hero">
      <div className="mining-hero-main">
        <p className="section-label">{t("orig.mining.pendingClaim")}</p>
        <p className="mining-total">
          <span className="naro-number">{amount(d?.accrued)}</span>
          <span className="unit">NARO</span>
        </p>
        <p className="muted">{t("orig.mining.claimDaily")}</p>
        <div className="naro-actions">
          {!connected ? (
            connectAction()
          ) : (
            <button
              className="naro-button naro-button--primary"
              disabled
              aria-describedby="claim-availability"
            >
              {t("orig.mining.claimNow")}
            </button>
          )}
          <a className="text-link" href="#earnings">
            {t("orig.mine.earnings")}
            <Icon name="arrow" />
          </a>
        </div>
        {connected && (
          <p id="claim-availability" className="small muted">
            {t("parity.claimUnavailable")}
          </p>
        )}
      </div>
      <dl className="reward-categories">
        <Metric label="orig.mining.static" value={amount(m?.staticReward)} />
        <Metric label="orig.mining.promo" value={amount(m?.dynamicReward)} />
        <Metric label="orig.mining.rank" value={amount(m?.daoRankingReward)} />
      </dl>
    </section>
  );
  const body = () => {
    if (view === "overview")
      return (
        <>
          <Highlights
            openWallet={openWallet}
            connected={connected}
            active={active}
            completed={d?.ieoCompleted === true}
            onTour={() => open("tour")}
          />
          {miniLinks}
          <AboutNaro />
        </>
      );
    if (view === "rewards")
      return (
        <>
          {miningHero}
          {(!d || records.error) && status()}
          <div className="section-title mining-tabs-title">
            <div
              role="tablist"
              className="parity-tabs"
              aria-label={t("orig.mining.title")}
            >
              {(["Static", "Promo", "Rank"] as const).map((key, i) => (
                <button
                  key={key}
                  id={`mining-tab-${key}`}
                  role="tab"
                  aria-selected={tab === key}
                  aria-controls="mining-details"
                  tabIndex={tab === key ? 0 : -1}
                  onKeyDown={(e) => {
                    if (
                      ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
                    ) {
                      e.preventDefault();
                      const tabs = ["Static", "Promo", "Rank"] as const;
                      const next =
                        e.key === "Home"
                          ? 0
                          : e.key === "End"
                            ? 2
                            : (i + (e.key === "ArrowRight" ? 1 : 2)) % 3;
                      setTab(tabs[next]);
                      document
                        .getElementById(`mining-tab-${tabs[next]}`)
                        ?.focus();
                    }
                  }}
                  onClick={() => setTab(key)}
                >
                  {t(`orig.mining.${key.toLowerCase()}`)}
                  <span>
                    {ratio(
                      key === "Static"
                        ? n?.staticRatio
                        : key === "Promo"
                          ? n?.dynamicRatio
                          : n?.rankingRatio,
                    )}
                  </span>
                </button>
              ))}
            </div>
            <a className="text-link" href="#community">
              {t("orig.mining.communityInviteCta")}
            </a>
          </div>
          <section
            className="naro-panel mining-details"
            id="mining-details"
            role="tabpanel"
            aria-labelledby={`mining-tab-${tab}`}
            tabIndex={0}
          >
            <dl className="metric-pair">
              {tab === "Static" ? (
                <>
                  <Metric
                    label="orig.mining.todayStaticPool"
                    value={amount(m?.staticPool)}
                    unit="NARO"
                  />
                  <Metric
                    label="orig.mining.myRankWeight"
                    value={amount(m?.holdingRankWeight)}
                  />
                </>
              ) : tab === "Promo" ? (
                <>
                  <Metric
                    label="orig.mining.todayPromoPool"
                    value={amount(m?.dynamicPool)}
                    unit="NARO"
                  />
                  <Metric
                    label="orig.mining.myNetworkShare"
                    value={amount(m?.dynamicPower)}
                  />
                </>
              ) : (
                <>
                  <Metric
                    label="orig.mining.myDynamicRank"
                    value={amount(m?.daoRankingWeight)}
                  />
                  <Metric
                    label="orig.mining.todayRankPool"
                    value={amount(m?.daoRankingPool)}
                    unit="NARO"
                  />
                </>
              )}
            </dl>
            {tab === "Static" ? (
              <>
                <h3>{t("orig.mining.holdZone")}</h3>
                <div className="holding-zones">
                  {["Mass", "Best", "Anti"].map((k) => (
                    <span key={k}>{t(`orig.mining.zone${k}`)}</span>
                  ))}
                </div>
                <p className="small muted zone-current">
                  {t(
                    holdingZone(m?.balance) === null
                      ? "parity.noVerifiedBalance"
                      : holdingZone(m?.balance) === "none"
                        ? "orig.mining.zoneNone"
                        : holdingZone(m?.balance) === "mass"
                          ? "orig.mining.zoneInMass"
                          : holdingZone(m?.balance) === "best"
                            ? "orig.mining.zoneInBest"
                            : "orig.mining.zoneInAnti",
                  )}
                </p>
                <p className="muted">{t("orig.mining.jumpRankHint")}</p>
              </>
            ) : tab === "Promo" ? (
              <>
                <p className="muted">{t("orig.team.formulaNote")}</p>
                <a
                  className="naro-button naro-button--secondary"
                  href="#community"
                >
                  {t("orig.team.inviteFriends")}
                  <Icon name="arrow" />
                </a>
              </>
            ) : (
              <p className="muted">{t("orig.mining.rankHint")}</p>
            )}
          </section>
          <p className="small muted">{t("orig.mining.settleNote")}</p>
        </>
      );
    if (view === "community") {
      const invitation = records.invitation,
        branches = m?.community?.branches ?? [],
        members: Branch[] | undefined = invitation?.directInvitees?.length
          ? invitation.directInvitees.map((member) => ({
              ...member,
              address: member.walletAddress ?? member.address,
              memberCount: member.communityMemberCount ?? member.memberCount,
            }))
          : branches.length
            ? branches.map((branch) => ({
                ...branch,
                userId: branch.directInviteeId ?? branch.userId,
              }))
            : invitation?.directInviteeIds?.length
              ? invitation.directInviteeIds.map((userId) => ({ userId }))
              : invitation?.directInvitees;
      return (
        <>
          <Back to="rewards" />
          <section className="naro-panel community-hero">
            <div>
              <p className="section-label">{t("orig.team.communityPower")}</p>
              <p className="mining-total naro-number">
                {amount(
                  invitation?.communityPower ?? m?.community?.dynamicPower,
                )}
              </p>
            </div>
            <NaroMascot small />
            <dl className="metric-pair">
              <Metric
                label="orig.team.directCount"
                value={invitation?.directCount ?? "—"}
              />
              <Metric
                label="orig.team.communityHolding"
                value={amount(sumDecimals(branches.map((b) => b.holding)))}
                unit="NARO"
              />
            </dl>
          </section>
          {(!d || records.error) && status()}
          <div className="parity-two-col">
            <Section title="orig.team.inviteFriends">
              <p className="muted">
                {t(
                  connected
                    ? active === null
                      ? "parity.recordUnavailable"
                      : active
                        ? "orig.team.shareHint"
                        : "orig.team.registerHint"
                    : "orig.team.connectHint",
                )}
              </p>
              <div className="invite-fields">
                <label>
                  {t("orig.team.inviteCode")}
                  <span className="invite-code address">
                    {inviteCode || "—"}
                    <button
                      className="icon-button"
                      disabled={!inviteCode}
                      aria-label={t("orig.team.copyCode")}
                      onClick={() => void copy(inviteCode)}
                    >
                      <Icon name="copy" />
                    </button>
                  </span>
                </label>
                <label>
                  {t("orig.team.inviteLinkLabel")}
                  <input
                    className="naro-input"
                    readOnly
                    value={inviteUrl}
                    placeholder="—"
                  />
                </label>
              </div>
              <div className="naro-actions">
                {!connected ? (
                  connectAction()
                ) : active === null ? (
                  <button
                    className="naro-button naro-button--primary"
                    onClick={records.refresh}
                  >
                    {t("parity.refresh")}
                  </button>
                ) : !active ? (
                  <a
                    className="naro-button naro-button--primary"
                    href="#activate"
                  >
                    {t("orig.common.goActivate")}
                  </a>
                ) : (
                  <button
                    className="naro-button naro-button--primary"
                    disabled={!inviteUrl}
                    onClick={() => void copy(inviteUrl)}
                  >
                    {t("orig.team.copyLink")}
                  </button>
                )}
                <button
                  className="naro-button naro-button--secondary"
                  onClick={() => open("poster")}
                >
                  {t(inviteCode ? "orig.team.poster" : "parity.previewPoster")}
                </button>
              </div>
            </Section>
            <Section title="orig.team.howPowerTitle">
              <ol className="power-rules">
                {[1, 2, 3].map((i) => (
                  <li key={i}>
                    <span>{i.toString().padStart(2, "0")}</span>
                    <div>
                      <h3>{t(`orig.team.powerStep${i}Title`)}</h3>
                      <p className="muted">
                        {t(`orig.team.powerStep${i}Desc`)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="small muted">{t("orig.team.powerTip")}</p>
            </Section>
          </div>
          <Section title="orig.team.members">
            <div className="section-title">
              <p className="muted small">{t("orig.team.subtitle")}</p>
              <button
                className="text-button"
                disabled={records.loading}
                onClick={records.refresh}
              >
                {t("orig.team.refreshMembers")}
              </button>
            </div>
            {members?.length ? (
              <ul className="direct-members">
                {members.map((member, i) => (
                  <li key={member.address ?? member.userId ?? i}>
                    <div className="member-top">
                      <bdi className="address">
                        {member.address ??
                          t("orig.team.memberId", {
                            id: member.userId ?? i + 1,
                          })}
                      </bdi>
                      {member.largest && (
                        <span className="naro-badge naro-badge--success">
                          {t("orig.team.largest")}
                        </span>
                      )}
                      {member.frozen && (
                        <span className="naro-badge">
                          {t("orig.team.frozen")}
                        </span>
                      )}
                      <button
                        className="icon-button"
                        disabled={!member.address}
                        aria-label={t("parity.copyAddress")}
                        onClick={() =>
                          member.address && void copy(member.address)
                        }
                      >
                        <Icon name="copy" />
                      </button>
                    </div>
                    <dl className="metric-trio">
                      <Metric
                        label="orig.team.personalHolding"
                        value={amount(member.personalHolding ?? member.holding)}
                        unit="NARO"
                      />
                      <Metric
                        label="orig.team.communityHoldingCol"
                        value={amount(member.communityHolding)}
                        unit="NARO"
                      />
                      <Metric
                        label="orig.team.teamMembers"
                        value={member.memberCount ?? "—"}
                      />
                    </dl>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="parity-empty">
                <NaroMascot small />
                <p>
                  {t(
                    !connected
                      ? "orig.team.connectCommunity"
                      : active === null
                        ? "parity.recordUnavailable"
                        : !active
                          ? "orig.team.activateToView"
                          : members
                            ? "orig.team.emptyWake"
                            : "parity.inviteUnavailable",
                  )}
                </p>
              </div>
            )}
          </Section>
        </>
      );
    }
    if (view === "network") {
      const stats = records.stats;
      const today = stats
        ? sumDecimals([stats.staticPool, stats.referralPool, stats.rankingPool])
        : undefined;
      return (
        <>
          <div className="section-title">
            <p className="muted small">
              {t("orig.data.snapshotSub", { date: n?.lastSettled ?? "—" })}
            </p>
            <button
              className="text-button"
              disabled={records.loading}
              onClick={records.refresh}
            >
              {t("parity.refresh")}
            </button>
          </div>
          {(!n || records.error) && status("network")}
          <section className="naro-panel supply-panel">
            <div>
              <p className="section-label">{t("orig.data.circulation")}</p>
              <p className="mining-total naro-number">
                {amount(n?.chainCirculatingSupply)}
              </p>
            </div>
            <div className="mining-progress">
              <span>{t("orig.data.minedProgress")}</span>
              <b className="naro-number">
                {t("orig.data.minedTotal", { mined: amount(n?.mined) })}
              </b>
              <progress
                max={990000000}
                value={
                  n?.mined && Number.isFinite(Number(n.mined))
                    ? Number(n.mined)
                    : 0
                }
                aria-label={t("orig.data.minedProgress")}
              />
              <div className="section-title">
                <span>{t("orig.data.stage1Progress")}</span>
                <b>—</b>
              </div>
            </div>
          </section>
          <dl className="network-metric-grid">
            {(
              [
                [
                  "orig.data.nextBurn",
                  n?.nextBurnAt && Number.isFinite(Date.parse(n.nextBurnAt))
                    ? new Date(n.nextBurnAt).toLocaleString(locale)
                    : "—",
                  "orig.data.nextBurnSub",
                ],
                [
                  "orig.data.todayOutput",
                  amount(today),
                  "orig.data.todayOutputSub",
                ],
                ["orig.data.dailyBurn", "≈0.39%", "orig.data.dailyBurnSub"],
                ["orig.data.totalBurned", amount(n?.chainBurnedSupply), "NARO"],
                [
                  "orig.data.holders",
                  n?.chainHolderCount ?? "—",
                  "orig.data.holdersUnit",
                ],
              ] as const
            ).map(([label, value, sub]) => (
              <div className="naro-panel" key={label}>
                <Metric label={label} value={value} />
                <p className="small muted">{sub === "NARO" ? sub : t(sub)}</p>
              </div>
            ))}
          </dl>
          <div className="parity-two-col">
            <Section title="orig.data.phases">
              <p className="muted small">{t("orig.data.phasesSub")}</p>
              <ol className="output-stages">
                {[1, 2, 3].map((i) => (
                  <li key={i}>
                    <span>
                      <b>{t(`orig.data.phase${i}`)}</b>
                      <small className="muted">{t("parity.phaseRate")}</small>
                    </span>
                    <strong className="naro-number">
                      {n?.outputStages?.[i - 1]?.rate ?? "—"}
                    </strong>
                  </li>
                ))}
              </ol>
              <p className="small muted">{t("orig.data.phaseFoot")}</p>
            </Section>
            <Section title="orig.data.dailyAlloc">
              <div className="allocation-bar" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <dl className="allocation-list">
                {[
                  ["orig.data.staticHold", n?.staticRatio],
                  ["orig.data.dynamicPromo", n?.dynamicRatio],
                  ["orig.data.dynamicRank", n?.rankingRatio],
                ].map(([key, value]) => (
                  <div key={key as string}>
                    <dt>{t(key as Key)}</dt>
                    <dd className="naro-number">
                      {ratio(value as number | undefined)}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="muted small">{t("parity.dataNote")}</p>
            </Section>
          </div>
          <Section title="orig.data.tokenAlloc" className="tokenomics">
            <div className="token-supply">
              <div
                className="allocation-ring"
                role="img"
                aria-label={t("orig.tokenAlloc.aria")}
              >
                <span>
                  <b className="naro-number">1B</b>
                  <small>{t("orig.tokenAlloc.totalLabel")}</small>
                </span>
              </div>
              <dl className="token-alloc-list">
                <div>
                  <dt>{t("orig.tokenAlloc.mineLabel")}</dt>
                  <dd>
                    <b className="naro-number">990M</b>
                    <span>99%</span>
                  </dd>
                </div>
                <div>
                  <dt>{t("orig.tokenAlloc.initLabel")}</dt>
                  <dd>
                    <b className="naro-number">10M</b>
                    <span>1%</span>
                  </dd>
                </div>
              </dl>
            </div>
            <div className="initial-allocation">
              {[
                ["ieo", "5M", "50%"],
                ["community", "1M", "10%"],
                ["lp", "4M", "40%"],
              ].map(([key, value, pct]) => (
                <div key={key}>
                  <span>{t(`orig.tokenAlloc.${key}`)}</span>
                  <b className="naro-number">{value}</b>
                  <small className="muted">
                    {pct} · {t("orig.tokenAlloc.initCall")}
                  </small>
                </div>
              ))}
            </div>
            <p className="token-deflation">
              {t("orig.tokenAlloc.totalLine")}
              <span aria-hidden="true">→</span>
              <strong>{t("orig.tokenAlloc.deflateLine")}</strong>
            </p>
          </Section>
          <section>
            <div className="section-title">
              <h2>{t("orig.data.stability")}</h2>
              <span className="naro-badge">
                {t("orig.data.stabilityBadge")}
              </span>
            </div>
            <div className="stability-grid">
              {["fee", "poolBurn", "circuit", "rbs"].map((k, i) => (
                <article className="naro-panel" key={k}>
                  <span className="cap-number">0{i + 1}</span>
                  <h3>{t(`orig.data.${k}Title`)}</h3>
                  <p className="stability-value naro-number">
                    {t(`orig.data.${k}Value`)}
                  </p>
                  <p className="muted small">{t(`orig.data.${k}Note`)}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      );
    }
    if (view === "earnings") {
      const fields: {
        key: string;
        field: keyof RewardRecord;
        label: Key;
        title: Key;
      }[] = [
        {
          key: "static",
          field: "static_reward",
          label: "orig.earnings.static",
          title: "orig.earnings.staticTitle",
        },
        {
          key: "promo",
          field: "referral_reward",
          label: "orig.earnings.promo",
          title: "orig.earnings.promoTitle",
        },
        {
          key: "rank",
          field: "top_reward",
          label: "orig.earnings.rank",
          title: "orig.earnings.rankTitle",
        },
        {
          key: "claim",
          field: "claimed_reward",
          label: "orig.earnings.claim",
          title: "orig.earnings.claimTitle",
        },
      ];
      const rows =
        records.history
          ?.flatMap((record, i) =>
            fields
              .filter((f) => filter === "all" || filter === f.key)
              .filter((f) => Number(record[f.field] ?? 0) > 0)
              .map((f) => ({ record, field: f, id: `${i}-${f.key}` })),
          )
          .reverse() ?? [];
      return (
        <>
          <Back to="rewards" />
          <section className="naro-panel">
            <dl className="metric-trio">
              <Metric label="orig.earnings.totalLabel" value="—" />
              <Metric label="orig.earnings.claimed" value="—" />
              <Metric
                label="orig.earnings.toClaim"
                value={amount(d?.accrued)}
              />
            </dl>
          </section>
          <div
            className="parity-tabs earnings-filters"
            role="group"
            aria-label={t("orig.earnings.filterAria")}
          >
            {[{ key: "all", label: "orig.earnings.all" }, ...fields].map(
              (f) => (
                <button
                  key={f.key}
                  aria-pressed={filter === f.key}
                  onClick={() => setFilter(f.key)}
                >
                  {t(f.label as Key)}
                </button>
              ),
            )}
          </div>
          {records.loading ? (
            <p role="status">{t("orig.earnings.reading")}</p>
          ) : rows.length ? (
            <ol className="earnings-list">
              {rows.map(({ record, field, id }) => (
                <li className="naro-panel" key={id}>
                  <span className={`earnings-type earnings-type-${field.key}`}>
                    {field.key.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <h3>{t(field.title)}</h3>
                    <p className="small muted">
                      {record.business_date} · {t("orig.earnings.dailySnap")}
                    </p>
                  </div>
                  <strong className="naro-number">
                    {field.key === "claim" ? "−" : "+"}
                    {amount(record[field.field])} <small>NARO</small>
                  </strong>
                  {field.key === "claim" &&
                    /^0x[a-fA-F0-9]{64}$/.test(record.txHash ?? "") && (
                      <a
                        className="text-link"
                        href={`https://testnet.bscscan.com/tx/${record.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("orig.earnings.claimSub")}
                      </a>
                    )}
                </li>
              ))}
            </ol>
          ) : (
            <section className="naro-panel parity-empty">
              <NaroMascot small />
              <p>
                {t(
                  records.history
                    ? "orig.earnings.emptyType"
                    : connected
                      ? "parity.recordUnavailable"
                      : "parity.connectRecords",
                )}
              </p>
              {!connected && connectAction()}
            </section>
          )}
          <p className="small muted">{t("orig.earnings.foot")}</p>
        </>
      );
    }
    if (view === "activate")
      return (
        <>
          <Back />
          <ol className="activation-steps">
            {["Connect", "Invite", "Pay"].map((k, i) => (
              <li
                key={k}
                data-complete={(i === 0 && connected) || active === true}
              >
                <span>{(i === 0 && connected) || active ? "✓" : i + 1}</span>
                {t(`orig.activate.steps${k}`)}
              </li>
            ))}
          </ol>
          <Section title="orig.activate.joinTitle" className="activation-card">
            <p className="muted">{t("orig.activate.joinDesc")}</p>
            <div className="naro-field">
              <label htmlFor="invite-code">
                {t("orig.activate.inviteCode")}
              </label>
              <div className="invite-input-row">
                <input
                  id="invite-code"
                  className="naro-input"
                  value={code}
                  readOnly={locked || active === true}
                  maxLength={16}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={t("orig.activate.codePlaceholder")}
                  onChange={(e) => setCode(e.target.value)}
                  aria-describedby="invite-code-hint"
                  aria-invalid={
                    (!!code && !validInvite(code)) ||
                    (attempted && !validInvite(code))
                  }
                />
                {locked && !active && (
                  <button
                    className="naro-button naro-button--secondary"
                    onClick={() => {
                      setLocked(false);
                      const url = new URL(location.href);
                      for (const k of [
                        "ref",
                        "invite",
                        "code",
                        "invitation",
                        "inviteCode",
                      ])
                        url.searchParams.delete(k);
                      history.replaceState(null, "", url);
                    }}
                  >
                    {t("orig.activate.unlock")}
                  </button>
                )}
              </div>
              <p
                className={`naro-field__hint ${attempted && !validInvite(code) ? "wallet-error" : ""}`}
                id="invite-code-hint"
              >
                {t(
                  locked
                    ? "orig.activate.hintLockedEditable"
                    : code && !validInvite(code)
                      ? "orig.activate.codeBad"
                      : validInvite(code)
                        ? "orig.activate.hintConfirmCode"
                        : "orig.activate.hintCode",
                )}
              </p>
            </div>
            <p className="small muted">{t("parity.inviterUnverified")}</p>
            <dl className="account-list activation-details">
              <div>
                <dt>{t("orig.activate.network")}</dt>
                <dd>{t("parity.network")}</dd>
              </div>
              <div>
                <dt>{t("orig.activate.status")}</dt>
                <dd>
                  {t(
                    active === null
                      ? "parity.activeUnknown"
                      : active
                        ? "orig.common.activated"
                        : "orig.activate.pendingConfirm",
                  )}
                </dd>
              </div>
              <div>
                <dt>{t("orig.activate.fee")}</dt>
                <dd>
                  — tBNB{" "}
                  <button
                    className="text-button"
                    onClick={() => {
                      records.refresh();
                      setNotice(t("parity.quoteUnavailable"));
                    }}
                    disabled={active === true}
                  >
                    {t("orig.activate.refreshFee")}
                  </button>
                </dd>
              </div>
              <div>
                <dt>{t("orig.activate.inviterAddr")}</dt>
                <dd>
                  <bdi className="address">{d?.inviterAddress ?? "—"}</bdi>
                </dd>
              </div>
              <div>
                <dt>{t("orig.activate.activateTx")}</dt>
                <dd>{t("orig.activate.activateTxPending")}</dd>
              </div>
            </dl>
            <div className="naro-actions">
              {!connected ? (
                connectAction()
              ) : (
                <button
                  className="naro-button naro-button--primary"
                  disabled={active === true}
                  onClick={() => {
                    setAttempted(true);
                    if (!validInvite(code)) {
                      document.getElementById("invite-code")?.focus();
                      setNotice(t("orig.activate.msgCheckCode"));
                      return;
                    }
                    setNotice(t("parity.quoteUnavailable"));
                  }}
                >
                  {t(active ? "orig.common.activated" : "parity.verifyInviter")}
                </button>
              )}
              <a className="text-link" href="#community">
                {t("orig.team.inviteFriends")}
                <Icon name="arrow" />
              </a>
            </div>
            <p className="small muted">{t("orig.activate.foot")}</p>
          </Section>
        </>
      );
    if (view === "account")
      return (
        <>
          <WalletAccount openWallet={openWallet} />
          <div className="parity-two-col">
            <Section title="orig.mine.holding">
              <p className="mining-total naro-number">{amount(m?.balance)}</p>
              <p className="muted small">{t("orig.mine.holdingHint")}</p>
              <a className="text-link" href="#rewards">
                {t("orig.home.goMining")}
                <Icon name="arrow" />
              </a>
            </Section>
            <Section title="orig.activate.status">
              <dl className="account-list">
                <div>
                  <dt>{t("orig.activate.wallet")}</dt>
                  <dd>
                    <bdi className="address">{wallet.state.address ?? "—"}</bdi>
                  </dd>
                </div>
                <div>
                  <dt>{t("orig.activate.status")}</dt>
                  <dd>
                    {d
                      ? t(
                          active
                            ? "orig.common.activated"
                            : "orig.common.notActivated",
                        )
                      : t("parity.activeUnknown")}
                  </dd>
                </div>
                <div>
                  <dt>{t("orig.activate.inviter")}</dt>
                  <dd>
                    <bdi className="address">{d?.inviterAddress ?? "—"}</bdi>
                  </dd>
                </div>
              </dl>
            </Section>
          </div>
          <nav className="account-menu" aria-label={t("orig.mine.title")}>
            {[
              ["earnings", "orig.mine.earnings", "rewards"],
              ["activate", "orig.mine.activate", "account"],
              ["community", "orig.mine.invite", "community"],
            ].map(([to, label, icon]) => (
              <a className="naro-panel" key={to} href={`#${to}`}>
                <Icon name={icon} />
                {t(label as Key)}
                <Icon name="arrow" />
              </a>
            ))}
            <button className="naro-panel" onClick={() => open("tour")}>
              <Icon name="help" />
              {t("orig.mine.guide")}
              <Icon name="arrow" />
            </button>
          </nav>
          <details className="naro-panel testnet-tools-entry">
            <summary>{t("parity.tools")}</summary>
            <p className="small muted">{t("parity.testToolsNote")}</p>
            <a className="naro-button naro-button--secondary" href="#test-lab">
              {t("parity.tools")}
              <Icon name="arrow" />
            </a>
          </details>
        </>
      );
    if (view === "ieo")
      return (
        <>
          <Back to="overview" />
          <section className="naro-panel ieo-closed">
            <NaroMascot />
            <span className="naro-badge">{t("orig.closed.title")}</span>
            <h2>{t("orig.ieoUi.title")}</h2>
            <p className="muted">{t("orig.closed.desc")}</p>
            <a className="naro-button naro-button--primary" href="#overview">
              {t("orig.closed.home")}
              <Icon name="arrow" />
            </a>
          </section>
        </>
      );
    if (view === "swap") {
      const numeric = /^(?:\d+\.?\d*|\.\d+)$/.test(input) ? Number(input) : 0;
      const raw = reverse ? numeric * 0.1 : numeric / 0.1,
        fee = raw * 0.03,
        out = raw - fee,
        min = out * (1 - Number(slippage) / 100),
        unit = reverse ? "USDT" : "NARO";
      const estimate = (v: number) =>
        v > 0 && Number.isFinite(v)
          ? v.toLocaleString(locale, { maximumFractionDigits: 4 })
          : "—";
      return (
        <div className="swap-layout">
          <section className="naro-panel parity-swap">
            <div className="section-title">
              <span className="naro-badge">{t("orig.closed.title")}</span>
              <label className="slippage-label" htmlFor="slippage">
                {t("orig.swap.slip")}
                <select
                  id="slippage"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                >
                  {["0.5", "1", "3"].map((v) => (
                    <option key={v} value={v}>
                      {v}%
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="swap-token-box">
              <div className="section-title">
                <label htmlFor="swap-amount">{t("orig.swap.pay")}</label>
                <span className="muted small">{t("orig.swap.balance")} —</span>
              </div>
              <div className="swap-amount-row">
                <input
                  id="swap-amount"
                  aria-describedby="swap-availability"
                  placeholder="0.00"
                  inputMode="decimal"
                  value={input}
                  onChange={(e) => {
                    if (/^\d*\.?\d{0,18}$/.test(e.target.value))
                      setInput(e.target.value);
                  }}
                />
                <b>{reverse ? "NARO" : "USDT"}</b>
              </div>
              <div className="swap-percentages">
                {["25%", "50%", "75%", t("orig.swap.max")].map((v) => (
                  <button
                    key={v}
                    disabled
                    title={t("parity.percentUnavailable")}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="swap-reverse icon-button"
              aria-label={t("parity.switchPair")}
              onClick={() => {
                setReverse(!reverse);
                setInput("");
              }}
            >
              ⇅
            </button>
            <div className="swap-token-box">
              <span className="small muted">{t("orig.swap.receive")}</span>
              <p className="swap-estimate naro-number">
                {estimate(out)}
                <span className="unit">{unit}</span>
              </p>
            </div>
            <dl className="swap-quote">
              <div>
                <dt>{t("orig.swap.price")}</dt>
                <dd>1 NARO = 0.1 USDT</dd>
              </div>
              <div>
                <dt>{t(reverse ? "orig.swap.sellFee" : "orig.swap.buyFee")}</dt>
                <dd>
                  {estimate(fee)} {unit}
                </dd>
              </div>
              <div>
                <dt>{t("orig.swap.minReceive")}</dt>
                <dd>
                  {estimate(min)} {unit}
                </dd>
              </div>
              <div>
                <dt>{t("orig.swap.route")}</dt>
                <dd>{t("orig.swap.routeValue")}</dd>
              </div>
            </dl>
            <button
              className="naro-button naro-button--primary swap-submit"
              disabled
            >
              {t(reverse ? "orig.swap.sellAction" : "orig.swap.buyAction")}
            </button>
            <p className="small muted" id="swap-availability">
              {t("parity.swapUnavailable")}. {t("parity.reference")}
            </p>
          </section>
          <div className="swap-notes">
            <NaroMascot bubble={t("orig.mascot.hi")} />
            <h2>{t("orig.mining.holdZone")}</h2>
            <p className="muted">
              {t(reverse ? "orig.swap.sellNote" : "orig.swap.buyNote")}
            </p>
            <a className="text-link" href="#rewards">
              {t("orig.nav.mining")}
              <Icon name="arrow" />
            </a>
          </div>
        </div>
      );
    }
    return null;
  };
  const guideTips = ["tip1", "tip2", "tip3", "tip4", "tip5", "tip6"],
    guideTargets = ["account", "activate", "ieo", "swap", "rewards", "network"];
  return (
    <div className="naro-parity">
      {body()}
      {notice && (
        <p className="parity-notice" role="status">
          {notice}
        </p>
      )}
      {dialog && (
        <Modal returnFocus={focus.current} onDismiss={() => setDialog(null)}>
          {dialog === "tour" ? (
            <div className="naro-tour">
              <p className="page-eyebrow">
                {t("parity.guideProgress", { step: step + 1, total: 6 })}
              </p>
              <h2 id="dialog-title">{t("parity.guideTitle")}</h2>
              <NaroMascot bubble={t("orig.mascot.hi")} />
              <p className="tour-tip">{t(`orig.guide.${guideTips[step]}`)}</p>
              {(step === 2 || step === 3) && (
                <p className="naro-badge">{t("orig.closed.title")}</p>
              )}
              <div className="tour-progress" aria-hidden="true">
                {guideTips.map((tip, i) => (
                  <i key={tip} data-current={i === step} />
                ))}
              </div>
              <div className="naro-actions">
                <button className="text-button" onClick={() => setDialog(null)}>
                  {t("orig.guide.skip")}
                </button>
                <a
                  className="naro-button naro-button--secondary"
                  href={`#${guideTargets[step]}`}
                  onClick={() => setDialog(null)}
                >
                  {t("orig.common.continue")}
                </a>
                <button
                  className="naro-button naro-button--primary"
                  onClick={() =>
                    step === 5 ? setDialog(null) : setStep(step + 1)
                  }
                >
                  {t(step === 5 ? "orig.guide.start" : "orig.common.continue")}
                  <Icon name="arrow" />
                </button>
              </div>
            </div>
          ) : (
            <div className="poster-dialog">
              <h2 id="dialog-title">{t("parity.posterPreview")}</h2>
              <div className={`invitation-poster pose-${pose}`}>
                <img
                  className="poster-logo"
                  src={brandAsset("logo.png")}
                  width="118"
                  height="30"
                  alt="NARO"
                />
                <h3>{t("orig.poster.title")}</h3>
                <p>{t("orig.poster.sub")}</p>
                <NaroMascot />
                <div className="poster-footer">
                  <div>
                    <span className="small muted">
                      {t("orig.poster.inviter")}
                    </span>
                    <p className="naro-number">{inviteCode || "—"}</p>
                    <p className="small">{t("orig.poster.scan")}</p>
                  </div>
                  {qr?.url === inviteUrl ? (
                    <img
                      src={qr.value}
                      width="104"
                      height="104"
                      alt={t("orig.posterExtra.qrAlt")}
                    />
                  ) : (
                    <span
                      className="poster-qr-placeholder"
                      aria-label={t("parity.posterLocked")}
                    >
                      N
                    </span>
                  )}
                </div>
              </div>
              <div
                className="parity-tabs"
                role="group"
                aria-label={t("orig.team.poster")}
              >
                {["idle", "happy", "load"].map((k) => (
                  <button
                    key={k}
                    aria-pressed={pose === k}
                    onClick={() => setPose(k)}
                  >
                    {t(`orig.poster.pose${k[0].toUpperCase() + k.slice(1)}`)}
                  </button>
                ))}
              </div>
              <p className="small muted">
                {t(inviteCode ? "orig.poster.saveHint" : "parity.posterLocked")}
              </p>
              <button
                className="naro-button naro-button--primary"
                disabled={!inviteUrl}
                onClick={() => void copy(inviteUrl)}
              >
                {t("orig.poster.copyLink")}
              </button>
              {notice && <p role="status">{notice}</p>}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
