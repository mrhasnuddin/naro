import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initialDataMode,
  testDashboard,
  testHistory,
  testInvitation,
  testNetwork,
  testRewardTotals,
  TEST_ADDRESS,
  TEST_BALANCES,
} from "./test-data.ts";
import { balancePortion, referenceQuote, rawDecimal } from "./swap-math.ts";
import { decimalRaw, sumDecimals } from "./amounts.ts";
import { mobileCopy } from "./mobile-copy.ts";

test("new mobile controls have complete copy in all nine supported languages", () => {
  const keys = Object.keys(mobileCopy.en).sort();
  for (const copy of Object.values(mobileCopy))
    assert.deepEqual(Object.keys(copy).sort(), keys);
});

test("test source is explicit and live URL overrides remembered test mode", () => {
  assert.equal(initialDataMode("", null), "test");
  assert.equal(initialDataMode("?data=live", "test"), "live");
  assert.equal(initialDataMode("?data=test", "live"), "test");
  assert.equal(initialDataMode("", "live"), "live");
});
test("fixtures use fictional identities and contain no fake transaction receipts", () => {
  assert.equal(testDashboard.walletAddress, TEST_ADDRESS);
  assert.equal(testDashboard.chainId, 97);
  assert.equal(testNetwork.chainId, 97);
  assert.ok(testHistory.every((row) => !row.txHash));
  assert.equal(
    testHistory[0].top_reward,
    testDashboard.mining!.daoRankingReward,
  );
  assert.equal(
    decimalRaw(testRewardTotals.earned)! -
      decimalRaw(testRewardTotals.claimed)!,
    decimalRaw(testDashboard.accrued),
  );
  assert.equal(
    testInvitation.directCount,
    testInvitation.directInvitees?.length,
  );
  assert.equal(
    decimalRaw(testDashboard.accrued),
    decimalRaw(
      sumDecimals([
        testDashboard.mining!.staticReward,
        testDashboard.mining!.dynamicReward,
        testDashboard.mining!.daoRankingReward,
      ]),
    ),
  );
  assert.equal(
    sumDecimals(
      testDashboard.mining!.community!.branches!.map((b) => b.communityHolding),
    ),
    "86400.000000000000000000",
  );
});
test("balance percentages keep decimal precision and cannot exceed balance", () => {
  assert.equal(balancePortion(TEST_BALANCES.USDT, 50), "625.25");
  assert.equal(balancePortion(TEST_BALANCES.NARO, 100), "12500");
  assert.equal(balancePortion("0.000000000000000001", 25), "0");
  assert.equal(balancePortion("1", 101), "");
});
test("reference quote applies fee and slippage exactly in both directions", () => {
  const buy = referenceQuote("625.25", false, "1")!;
  assert.equal(rawDecimal(buy.output), "6064.925");
  assert.equal(rawDecimal(buy.minimum), "6004.27575");
  const sell = referenceQuote("12500", true, "0.5")!;
  assert.equal(rawDecimal(sell.fee), "37.5");
  assert.equal(rawDecimal(sell.output), "1212.5");
  assert.equal(rawDecimal(sell.minimum), "1206.4375");
  for (const bad of ["-1", "NaN", "Infinity", "1e18"])
    assert.equal(referenceQuote(bad, false, "1"), null);
  assert.equal(referenceQuote("1", false, "100"), null);
  assert.equal(referenceQuote("12.", false, "3")?.value, 12n * 10n ** 18n);
});
