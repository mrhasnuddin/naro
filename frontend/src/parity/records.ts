import { useEffect, useState } from "react";
import { testnetApiUrl } from "./api-config";
import { testRecords, type DataMode } from "./test-data";
export type Branch = {
  address?: string;
  walletAddress?: string;
  userId?: number;
  directInviteeId?: number;
  holding?: string;
  personalHolding?: string;
  communityHolding?: string;
  memberCount?: number;
  communityMemberCount?: number;
  power?: string;
  largest?: boolean;
  frozen?: boolean;
};
export type NaroDashboard = {
  chainId: number;
  walletAddress: string;
  userId?: number;
  ledgerRegistered: boolean;
  accrued?: string;
  invitationCode?: string;
  inviterAddress?: string;
  lastSettled?: string;
  ieoCompleted?: boolean;
  mining?: {
    balance?: string;
    staticReward?: string;
    dynamicReward?: string;
    daoRankingReward?: string;
    staticPool?: string;
    holdingRankWeight?: string;
    dynamicPool?: string;
    dynamicPower?: string;
    daoRankingWeight?: string;
    daoRankingPool?: string;
    community?: { dynamicPower?: string; branches?: Branch[] };
  };
};
export type NetworkRecords = {
  chainId: number;
  lastSettled?: string;
  chainCirculatingSupply?: string;
  chainBurnedSupply?: string;
  chainHolderCount?: number;
  mined?: string;
  staticRatio?: number;
  dynamicRatio?: number;
  rankingRatio?: number;
  nextBurnAt?: string;
  outputStages?: { rate: string }[];
};
export type Invitation = {
  chainId: number;
  communityPower?: string;
  personalPower?: string;
  directCount?: number;
  directInvitees?: Branch[];
  directInviteeIds?: number[];
};
export type RewardRecord = {
  business_date: string;
  static_reward?: string;
  referral_reward?: string;
  ranking_reward?: string;
  top_reward?: string;
  claimed_reward?: string;
  txHash?: string;
};
export type MiningStats = {
  chainId: number;
  staticPool?: string;
  referralPool?: string;
  rankingPool?: string;
};
type Records = {
  identity?: string;
  dashboard: NaroDashboard | null;
  network: NetworkRecords | null;
  invitation: Invitation | null;
  history: RewardRecord[] | null;
  stats: MiningStats | null;
  loading: boolean;
  error: boolean;
};
const empty: Records = {
  dashboard: null,
  network: null,
  invitation: null,
  history: null,
  stats: null,
  loading: false,
  error: false,
};
// A separate BSC-testnet backend is required. Never send rebuilt-app wallets to the original mainnet ledger.
const base = testnetApiUrl(
  import.meta.env.VITE_NARO_TESTNET_API_URL,
  import.meta.env.VITE_NARO_API_CHAIN_ID,
);
export function useNaroRecords(
  address: string | null | undefined,
  view: string,
  mode: DataMode = "live",
) {
  const [records, setRecords] = useState<Records>(empty),
    [revision, setRevision] = useState(0);
  const identity = `${address?.toLowerCase() ?? ""}:${view}:${revision}`;
  useEffect(() => {
    const controller = new AbortController();
    if (mode === "test") return () => controller.abort();
    setRecords({ ...empty, identity, loading: !!base });
    if (!base) return () => controller.abort();
    const get = async <T extends { chainId: number }>(
      path: string,
    ): Promise<T> => {
      const r = await fetch(base + path, {
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(15000),
        ]),
        headers: { Accept: "application/json" },
      });
      if (!r.ok) throw Error("Unavailable");
      const data = (await r.json()) as T;
      if (data.chainId !== 97) throw Error("Wrong network");
      return data;
    };
    void (async () => {
      let failed = false;
      const network = await get<NetworkRecords>("/network/overview").catch(
        () => {
          failed = true;
          return null;
        },
      );
      const dashboard = address
        ? await get<NaroDashboard>(`/wallets/${address}/dashboard`)
            .then((d) => {
              if (d.walletAddress?.toLowerCase() !== address.toLowerCase())
                throw Error("Wrong account");
              return d;
            })
            .catch(() => {
              failed = true;
              return null;
            })
        : null;
      const invitation =
        dashboard?.userId && view === "community"
          ? await get<Invitation>(
              `/users/${dashboard.userId}/invitation`,
            ).catch(() => {
              failed = true;
              return null;
            })
          : null;
      const date = network?.lastSettled;
      const stats =
        date && /^\d{4}-\d{2}-\d{2}$/.test(date)
          ? await get<MiningStats>(`/mining/statistics?date=${date}`).catch(
              () => {
                failed = true;
                return null;
              },
            )
          : null;
      let history: RewardRecord[] | null = null;
      if (
        view === "earnings" &&
        dashboard?.userId &&
        date &&
        /^\d{4}-\d{2}-\d{2}$/.test(date)
      ) {
        const from = new Date(date + "T00:00:00Z");
        from.setUTCDate(from.getUTCDate() - 29);
        const result = await get<{ chainId: number; rewards: RewardRecord[] }>(
          `/users/${dashboard.userId}/rewards?from=${from.toISOString().slice(0, 10)}&to=${date}`,
        ).catch(() => {
          failed = true;
          return null;
        });
        history = result?.rewards ?? null;
      }
      if (!controller.signal.aborted)
        setRecords({
          identity,
          dashboard,
          network,
          invitation,
          stats,
          history,
          loading: false,
          error: failed,
        });
    })();
    return () => controller.abort();
  }, [address, view, revision, identity, mode]);
  return {
    ...(mode === "test"
      ? testRecords
      : records.identity === identity
        ? records
        : { ...empty, loading: !!base }),
    configured: !!base,
    refresh: () => setRevision((n) => n + 1),
  };
}
