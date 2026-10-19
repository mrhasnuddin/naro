import { useEffect, useState, useCallback } from "react";
import { readDemo, type DemoData, errorKey } from "./client";
export function useDemoData(address: string | null, history: boolean) {
  const [attempt, setAttempt] = useState(0),
    [result, setResult] = useState<{
      key: string;
      data: DemoData | null;
      error: string | null;
      loading: boolean;
    }>({ key: "", data: null, error: null, loading: true });
  const key = `${address}:${history}`;
  useEffect(() => {
    let stopped = false,
      inFlight = false;
    const refresh = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const data = await readDemo(address, history);
        if (!stopped) setResult({ key, data, error: null, loading: false });
      } catch (error) {
        if (!stopped)
          setResult({
            key,
            data: null,
            error: errorKey(error),
            loading: false,
          });
      } finally {
        inFlight = false;
      }
    };
    void refresh();
    const timer = setInterval(() => void refresh(), 5000);
    const changed = () => setAttempt((value) => value + 1);
    window.addEventListener("naro:deployment", changed);
    return () => {
      stopped = true;
      clearInterval(timer);
      window.removeEventListener("naro:deployment", changed);
    };
  }, [key, address, history, attempt]);
  const refresh = useCallback(() => setAttempt((value) => value + 1), []);
  return {
    ...(result.key === key
      ? result
      : { key, data: null, error: null, loading: true }),
    refresh,
  };
}
