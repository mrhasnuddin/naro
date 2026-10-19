import type { TransactionReceipt, TransactionRequest } from "ethers";

export function assertBoundChain(
  request: TransactionRequest,
  intended: number,
) {
  if (request.chainId == null || BigInt(request.chainId) !== BigInt(intended))
    throw new Error("WrongWalletNetwork");
}

export function waitFailure(error: unknown) {
  const e = error as {
    code?: string;
    cancelled?: boolean;
    receipt?: TransactionReceipt;
    replacement?: { hash: string };
  };
  const hash = e.receipt?.hash || e.replacement?.hash;
  if (e.code === "TRANSACTION_REPLACED" && e.cancelled)
    return { kind: "cancelled" as const, hash };
  if (e.receipt?.status === 0) return { kind: "failed" as const, hash };
  if (
    e.code === "TRANSACTION_REPLACED" &&
    e.cancelled === false &&
    e.receipt?.status === 1
  )
    return { kind: "confirmed" as const, hash, receipt: e.receipt };
  return { kind: "unknown" as const, hash };
}
