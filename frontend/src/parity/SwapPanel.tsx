import { useState } from "react";
import { useI18n } from "../context";
import { Icon } from "../components/ui";
import { useWallet } from "../features/wallet/store";
import { formatRawAmount } from "../data/amounts";
import { brandAsset } from "./assets";
import { decimalRaw } from "./amounts";
import { TEST_BALANCES, type DataMode } from "./test-data";
import { balancePortion, referenceQuote } from "./swap-math";

function Token({ symbol }: { symbol: "NARO" | "USDT" }) {
  return (
    <span className="trade-token" dir="ltr">
      {symbol === "NARO" ? (
        <img src={brandAsset("logo.png")} width="27" height="12" alt="" />
      ) : (
        <span className="trade-usdt" aria-hidden="true">
          ₮
        </span>
      )}
      <b>{symbol}</b>
    </span>
  );
}
export function SwapPanel({
  dataMode,
  openWallet,
}: {
  dataMode: DataMode;
  openWallet: () => void;
}) {
  const { t, locale } = useI18n();
  const wallet = useWallet();
  const [reverse, setReverse] = useState(false),
    [input, setInput] = useState(""),
    [slippage, setSlippage] = useState("1");
  const pay = reverse ? "NARO" : "USDT",
    receive = reverse ? "USDT" : "NARO";
  const balance = dataMode === "test" ? TEST_BALANCES[pay] : null;
  const quote = referenceQuote(input, reverse, slippage);
  const insufficient =
    balance !== null && !!quote && quote.value > decimalRaw(balance)!;
  const fmt = (value: bigint | undefined, digits = 4) =>
    value === undefined ? "—" : formatRawAmount(value, 18, locale, digits);
  return (
    <section className="trade-card naro-panel" aria-label={t("orig.nav.swap")}>
      <div className="trade-toolbar">
        <span className="trade-chain">
          <span className="network-dot" />
          BNB Testnet
        </span>
        <label className="trade-slippage">
          {t("orig.swap.slip")}
          <select
            aria-label={t("orig.swap.slip")}
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
      <div className="trade-pair">
        <div className="trade-box" data-token-side="pay">
          <div className="trade-box-label">
            <label htmlFor="trade-amount">{t("orig.swap.pay")}</label>
            <span>
              {t("orig.swap.balance")}{" "}
              <bdi>{balance === null ? "—" : fmt(decimalRaw(balance)!, 2)}</bdi>
            </span>
          </div>
          <div className="trade-amount">
            <input
              id="trade-amount"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              value={input}
              aria-invalid={insufficient}
              aria-describedby="trade-status"
              onChange={(e) => {
                if (/^\d{0,12}(\.\d{0,18})?$/.test(e.target.value))
                  setInput(
                    e.target.value.startsWith(".")
                      ? `0${e.target.value}`
                      : e.target.value,
                  );
              }}
            />
            <Token symbol={pay} />
          </div>
          <div className="trade-portions">
            {[25, 50, 75, 100].map((percent) => (
              <button
                key={percent}
                disabled={balance === null}
                onClick={() => setInput(balancePortion(balance!, percent))}
              >
                {percent === 100 ? t("orig.swap.max") : `${percent}%`}
              </button>
            ))}
          </div>
        </div>
        <button
          className="trade-flip"
          aria-label={t("parity.switchPair")}
          onClick={() => {
            setReverse(!reverse);
            setInput("");
          }}
        >
          <Icon name="swap" />
        </button>
        <div className="trade-box" data-token-side="receive">
          <div className="trade-box-label">
            <span>{t("orig.swap.receive")}</span>
            <span>{t("mobile.estimate")}</span>
          </div>
          <div className="trade-amount">
            <output className="naro-number" htmlFor="trade-amount" dir="ltr">
              {input ? fmt(quote?.output) : "0.00"}
            </output>
            <Token symbol={receive} />
          </div>
          <div className="trade-receive-foot">
            <span>{t("orig.swap.price")}</span>
            <bdi>1 NARO = 0.1 USDT</bdi>
          </div>
        </div>
      </div>
      <details className="trade-details">
        <summary>
          <span>{t("mobile.details")}</span>
          <span className="trade-fee">
            3% <span aria-hidden="true">⌄</span>
          </span>
        </summary>
        <dl>
          {[
            [
              t(reverse ? "orig.swap.sellFee" : "orig.swap.buyFee"),
              `${fmt(quote?.fee)} ${receive}`,
            ],
            [t("orig.swap.minReceive"), `${fmt(quote?.minimum)} ${receive}`],
            [t("orig.swap.route"), t("orig.swap.routeValue")],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <p>{t(reverse ? "orig.swap.sellNote" : "orig.swap.buyNote")}</p>
      </details>
      <button
        className="naro-button naro-button--primary trade-action"
        onClick={openWallet}
        disabled={!!wallet.state.address}
      >
        {t(
          wallet.state.address
            ? "orig.closed.title"
            : "orig.common.connectWallet",
        )}
        {!wallet.state.address && <Icon name="wallet" />}
      </button>
      <p
        className={`trade-status ${insufficient ? "trade-error" : ""}`}
        id="trade-status"
        role="status"
      >
        {t(
          insufficient
            ? "mobile.insufficient"
            : dataMode === "test"
              ? "mobile.testQuote"
              : "parity.swapUnavailable",
        )}
      </p>
    </section>
  );
}
