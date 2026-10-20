import type { ReactNode } from "react";
import { useI18n, type Key } from "../context";
export const Icon = ({ name }: { name: string }) => (
  <span className={`icon icon-${name}`} aria-hidden="true" />
);
export function RouteLink({
  view,
  label,
  button = false,
}: {
  view: string;
  label: Key;
  button?: boolean;
}) {
  const { t } = useI18n();
  return (
    <a
      className={button ? "naro-button naro-button--secondary" : "text-link"}
      href={`#${view}`}
    >
      {t(label)}
      <Icon name="arrow" />
    </a>
  );
}
export function Panel({
  title,
  icon,
  children,
  className = "",
}: {
  title: Key;
  icon?: string;
  children: ReactNode;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <section className={`naro-panel ${className}`}>
      <div className="panel-heading">
        <h2>{t(title)}</h2>
        {icon && <Icon name={icon} />}
      </div>
      {children}
    </section>
  );
}
export function Select({
  id,
  label,
  value,
  onChange,
  children,
  displayValue,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  displayValue?: string;
}) {
  return (
    <span
      className={`naro-select-wrap ${displayValue ? "naro-select-wrap--display" : ""}`}
    >
      {displayValue && (
        <span className="naro-select-display" aria-hidden="true">
          {displayValue}
        </span>
      )}
      <select
        id={id}
        className="naro-select"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </span>
  );
}
