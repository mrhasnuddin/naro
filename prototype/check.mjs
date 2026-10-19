import en from './locales/en.js';
import zh from './locales/zh-Hans.js';
import { readFile } from 'node:fs/promises';

const keys = Object.keys(en).sort();
const translatedKeys = Object.keys(zh).sort();
if (JSON.stringify(keys) !== JSON.stringify(translatedKeys)) throw new Error('Locale keys differ.');
const placeholders = value => [...value.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort().join(',');
for (const key of keys) {
  if (typeof en[key] !== 'string' || !en[key].trim() || typeof zh[key] !== 'string' || !zh[key].trim()) throw new Error(`Empty or invalid string: ${key}`);
  if (placeholders(en[key]) !== placeholders(zh[key])) throw new Error(`Interpolation mismatch: ${key}`);
  if (/[\u2013\u2014]/.test(en[key] + zh[key])) throw new Error(`Copy contains an em or en dash: ${key}`);
}
const html = await readFile(new URL('./index.html', import.meta.url), 'utf8');
for (const match of html.matchAll(/data-i18n="([^"]+)"/g)) if (!(match[1] in en)) throw new Error(`HTML key missing: ${match[1]}`);
console.log(`PASS: ${keys.length} complete strings per locale; key and interpolation parity; HTML translation keys resolve.`);
console.log('Scope: English and draft Simplified Chinese. This does not validate translation quality or other locales.');
