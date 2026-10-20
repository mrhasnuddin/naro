import { I18nContext } from "./context";
import { useState, useEffect, type ReactNode } from "react";
import { catalogs, type Locale, type Key } from "./locales";
export type { Locale, Key } from "./locales";
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem("naro:locale");
      return saved && Object.hasOwn(catalogs, saved) ? (saved as Locale) : "en";
    } catch {
      return "en";
    }
  });
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ur" ? "rtl" : "ltr";
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
