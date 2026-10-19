import { useState, useRef } from "react";
import { useI18n } from "../context";
import { inviteCode } from "../data/amounts";
import { Icon } from "./ui";
export function Activation() {
  const { t } = useI18n();
  const [code, setCode] = useState(() => inviteCode(location.search) || "");
  const [valid, setValid] = useState<boolean | null>(null);
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <h2 id="dialog-title">{t("activation.title")}</h2>
      <p>{t("activation.note")}</p>
      <form
        id="activation-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const next = /^[a-z0-9]{4,16}$/i.test(code.trim());
          setValid(next);
          if (!next) input.current?.focus();
        }}
      >
        <div className="naro-field">
          <label htmlFor="activation-code">{t("activation.code")}</label>
          <input
            ref={input}
            id="activation-code"
            className="naro-input"
            maxLength={16}
            autoComplete="off"
            spellCheck={false}
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setValid(null);
            }}
            aria-invalid={valid === false || undefined}
            aria-describedby="activation-feedback"
            placeholder={t("activation.placeholder")}
          />
          <p
            id="activation-feedback"
            className="naro-field__hint"
            data-state={
              valid === null ? undefined : valid ? "success" : "error"
            }
            aria-live="polite"
          >
            {t(
              valid === null
                ? "activation.hint"
                : valid
                  ? "activation.valid"
                  : "activation.invalid",
            )}
          </p>
        </div>
        <button className="naro-button naro-button--secondary" type="submit">
          {t("activation.check")}
        </button>
      </form>
      <dl className="quote-list">
        <div>
          <dt>{t("activation.fee")}</dt>
          <dd>{t("activation.unavailable")}</dd>
        </div>
        <div>
          <dt>{t("activation.gas")}</dt>
          <dd>{t("activation.gasNote")}</dd>
        </div>
      </dl>
      <button
        className="naro-button"
        disabled
        aria-describedby="activation-limit"
      >
        {t("activation.disabled")}
      </button>
      <p id="activation-limit" className="muted small">
        {t("activation.boundary")}
      </p>
    </>
  );
}
export function Help() {
  const { t } = useI18n();
  return (
    <>
      <h2 id="dialog-title">{t("help.title")}</h2>
      <p>{t("help.intro")}</p>
      <details open>
        <summary>{t("help.rewards")}</summary>
        <p>{t("help.rewardsAnswer")}</p>
      </details>
      <details>
        <summary>{t("help.inviter")}</summary>
        <p>{t("help.inviterAnswer")}</p>
      </details>
      <div className="official-links">
        <a
          href="https://naro-jh2z240.gamma.site/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("help.docs")}
          <Icon name="external" />
        </a>
        <a
          href="https://x.com/Naro_Officials"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("help.x")}
          <Icon name="external" />
        </a>
      </div>
    </>
  );
}
