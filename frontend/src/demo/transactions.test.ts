import { test } from "node:test";
import assert from "node:assert/strict";
import { assertBoundChain, waitFailure } from "./transactions.ts";
test("prepared chain remains explicit across asynchronous wallet network changes", async () => {
  const request = { chainId: 97 };
  let walletChain = 97;
  await Promise.resolve().then(() => {
    walletChain = 56;
  });
  assertBoundChain(request, 97);
  // A wallet must reject this explicit chain instead of silently submitting on its current chain.
  assert.notEqual(BigInt(request.chainId), BigInt(walletChain));
  assert.throws(
    () => assertBoundChain({ chainId: 56 }, 97),
    /WrongWalletNetwork/,
  );
  assert.throws(() => assertBoundChain({}, 97), /WrongWalletNetwork/);
});
test("repriced receipt completes while cancelled replacement never reports success", () => {
  const receipt = { status: 1, hash: "replacement" };
  assert.equal(
    waitFailure({ code: "TRANSACTION_REPLACED", cancelled: false, receipt })
      .kind,
    "confirmed",
  );
  const cancelled = waitFailure({
    code: "TRANSACTION_REPLACED",
    cancelled: true,
    receipt,
  });
  assert.equal(cancelled.kind, "cancelled");
  assert.equal(cancelled.hash, "replacement");
});
test("mined failure releases retry path while timeout keeps confirmation unknown", () => {
  assert.equal(
    waitFailure({ receipt: { status: 0, hash: "failed" } }).kind,
    "failed",
  );
  assert.equal(waitFailure({ code: "TIMEOUT" }).kind, "unknown");
});
