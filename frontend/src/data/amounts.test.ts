import { test } from "node:test";
import assert from "node:assert/strict";
import { formatRawAmount, parseBalance, inviteCode } from "./amounts.ts";
test("large balances retain all whole digits beyond Number precision", () =>
  assert.equal(
    formatRawAmount(123456789012345678901234567890123456n, 18),
    "123,456,789,012,345,678.901234",
  ));
test("format handles zero, negative values and zero-decimal tokens", () => {
  assert.equal(formatRawAmount(0n, 18), "0");
  assert.equal(formatRawAmount(-1234567000000000000n, 18), "-1.234567");
  assert.equal(formatRawAmount(12500n, 0), "12,500");
});
test("format uses locale separators while preserving exact integers", () =>
  assert.equal(
    formatRawAmount(1234500000000000000000n, 18, "de-DE"),
    "1.234,5",
  ));
test("invalid decimal configuration is rejected", () => {
  assert.throws(() => formatRawAmount(1n, -1), RangeError);
  assert.throws(() => formatRawAmount(1n, 256), RangeError);
});
test("provider balance must be a hex quantity", () => {
  assert.equal(parseBalance("0xde0b6b3a7640000"), 1000000000000000000n);
  for (const value of ["1", "0x", null, {}, "0xno"])
    assert.throws(() => parseBalance(value));
});
test("invitation query preserves only valid 4 to 16 character codes", () => {
  assert.equal(inviteCode("?invite=DEMONARO"), "DEMONARO");
  assert.equal(inviteCode("?invite=%3Cscript%3E"), null);
  assert.equal(inviteCode("?invite=abc"), null);
  assert.equal(inviteCode("?invite=" + "a".repeat(17)), null);
  assert.equal(inviteCode(""), null);
});

test("tiny nonzero balances are not misrepresented as zero", () => {
  assert.equal(formatRawAmount(1n, 18), "<0.000001");
  assert.equal(formatRawAmount(-1n, 18), ">-0.000001");
});
