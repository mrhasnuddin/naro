import { test } from "node:test";
import assert from "node:assert/strict";
import { catalogs } from "../locales.ts";
test("frontend English and Chinese catalogs have complete key and token parity", () => {
  const keys = Object.keys(catalogs.en).sort();
  assert.deepEqual(keys, Object.keys(catalogs["zh-Hans"]).sort());
  for (const key of keys) {
    const source = catalogs.en[key],
      translation = catalogs["zh-Hans"][key];
    assert.ok(source.trim() && translation.trim(), key);
    assert.deepEqual(
      [...source.matchAll(/\{(\w+)\}/g)].map((match) => match[1]),
      [...translation.matchAll(/\{(\w+)\}/g)].map((match) => match[1]),
      key,
    );
    assert.ok(!/[\u2013\u2014]/.test(source + translation), key);
  }
});
