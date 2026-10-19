import { I18nContext } from "./context";
import { useState, useEffect, type ReactNode } from "react";
import { catalogs, type Locale, type Key } from "./locales";
export type { Locale, Key } from "./locales";
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    try {
      return localStorage.getItem("naro:locale") === "zh-Hans"
        ? "zh-Hans"
        : "en";
    } catch {
      return "en";
    }
  });
  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      localStorage.setItem("naro:locale", locale);
    } catch {
      /* Preferences are optional. */
    }
  }, [locale]);
  const t = (key: Key, values: Record<string, string | number> = {}) =>
    (catalogs[locale][key] ?? catalogs.en[key] ?? key).replace(
      /\{(\w+)\}/g,
      (_, name: string) => String(values[name] ?? `{${name}}`),
    );
  const number = (value: number | bigint, digits = 0) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  return (
    <I18nContext.Provider value={{ locale, setLocale, t, number }}>
      {children}
    </I18nContext.Provider>
  );
}
