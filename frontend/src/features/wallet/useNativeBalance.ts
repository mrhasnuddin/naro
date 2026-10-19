import { useEffect, useState } from "react";
import { connection, useWallet, TESTNET } from "./store";
import { parseBalance } from "../../data/amounts";
export function useNativeBalance() {
  const { state } = useWallet();
  const [attempt, retry] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    status: "loading" | "ready" | "error";
    value: bigint | null;
  } | null>(null);
  const key = `${state.address}:${state.chainId}`;
  useEffect(() => {
    const provider = connection.provider;
    if (
      !provider ||
      !state.address ||
      state.chainId !== TESTNET.chainId ||
      state.busy
    )
      return;
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled) {
        cancelled = true;
        setResult({ key, status: "error", value: null });
      }
    }, 15000);
    setResult({ key, status: "loading", value: null });
    provider
      .request({ method: "eth_getBalance", params: [state.address, "latest"] })
      .then((value) => {
        const amount = parseBalance(value);
        if (!cancelled) setResult({ key, status: "ready", value: amount });
      })
      .catch(() => {
        if (!cancelled) setResult({ key, status: "error", value: null });
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [key, state.address, state.chainId, state.busy, attempt]);
  return {
    result: result?.key === key ? result : null,
    refresh: () => retry((value) => value + 1),
  };
}
