import { test } from "node:test";
import assert from "node:assert/strict";
import { inviteFromSearch, validInvite, legacyRoutes } from "./routes.ts";
import { testnetApiUrl } from "./api-config.ts";
import { decimalRaw, sumDecimals, holdingZone } from "./amounts.ts";
import original from "./original-catalogs.json" with { type: "json" };

test("all original public routes retain a destination, including invite and IEO aliases", () => {
  assert.equal(legacyRoutes["/mining"], "rewards");
  assert.equal(legacyRoutes["/mine/invite"], "community");
  assert.equal(legacyRoutes["/mine/activate"], "activate");
  for (const route of ["/ieo", "/ieo/claim", "/subscribe"])
    assert.equal(legacyRoutes[route], "ieo");
  assert.equal(legacyRoutes["/mine/earnings"], "earnings");
  assert.equal(Object.keys(legacyRoutes).length, 13);
});
test("original invite aliases accept 4–16 alphanumeric characters and reject address/markup payloads", () => {
  for (const alias of ["ref", "invite", "code", "invitation", "inviteCode"])
    assert.equal(inviteFromSearch(`?${alias}=Naro2026`), "Naro2026");
  for (const invalid of [
    "abc",
    "x".repeat(17),
    "0x" + "1".repeat(40),
    "<script>",
    "a_b_c",
  ])
    assert.equal(validInvite(invalid), false);
  assert.equal(inviteFromSearch("?ref=bad!&code=GOOD123"), "GOOD123");
});
test("testnet records cannot use mainnet chain IDs, production ledger, credentials or insecure remote endpoints", () => {
  assert.equal(
    testnetApiUrl("https://example.com/api", "97"),
    "https://example.com/api",
  );
  assert.equal(
    testnetApiUrl("http://localhost:9000/api/", "97"),
    "http://localhost:9000/api",
  );
  for (const chain of [undefined, "56", "31337"])
    assert.equal(testnetApiUrl("https://example.com/api", chain), null);
  for (const url of [
    "https://back.naroradar.net/api",
    "http://example.com",
    "https://user:password@example.com",
    "https://example.com?key=abc",
    "javascript:alert(1)",
  ])
    assert.equal(testnetApiUrl(url, "97"), null);
});
test("community and output amounts keep wei precision and do not turn unavailable values into zero", () => {
  assert.equal(
    sumDecimals([
      "9007199254740993.123456789012345678",
      "0.000000000000000001",
    ]),
    "9007199254740993.123456789012345679",
  );
  assert.equal(sumDecimals([undefined, "0"]), undefined);
  assert.equal(sumDecimals([]), undefined);
  assert.equal(decimalRaw("Infinity"), null);
  assert.equal(decimalRaw("-1"), null);
  assert.equal(holdingZone(undefined), null);
  assert.equal(holdingZone("0"), "none");
  assert.equal(holdingZone("999.999999999999999999"), "mass");
  assert.equal(holdingZone("1000"), "best");
  assert.equal(holdingZone("100000"), "best");
  assert.equal(holdingZone("100000.000000000000000001"), "anti");
});
test("all nine original catalogs retain every original banner, FAQ, network and invitation key", () => {
  const keys = Object.keys(original.en).sort();
  assert.equal(Object.keys(original).length, 9);
  for (const copy of Object.values(original)) {
    assert.deepEqual(Object.keys(copy).sort(), keys);
    for (const part of [
      "slide1",
      "slide2",
      "slide3",
      "slide4",
      "guide1",
      "guide2",
      "guide3",
      "guideDone",
    ])
      for (const field of ["Eye", "Title", "Sub", "Bubble"])
        assert.ok(copy[`orig.home.${part}${field}` as keyof typeof copy]);
    for (const i of [1, 2, 3, 4, 5, 7])
      assert.ok(copy[`orig.home.faq${i}a` as keyof typeof copy]);
    assert.ok(copy["orig.team.poster"]);
    assert.ok(copy["orig.data.rbsNote"]);
    assert.ok(copy["orig.tokenAlloc.aria"]);
  }
});
