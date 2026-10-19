import { createContext, useContext } from "react";
import type { Locale, Key } from "./locales";
export type { Locale, Key } from "./locales";
export const I18nContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: Key, values?: Record<string, string | number>) => string;
  number: (value: number | bigint, digits?: number) => string;
}>(null!);
export const useI18n = () => useContext(I18nContext);
