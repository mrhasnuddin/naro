import type {
  NaroDashboard,
  NetworkRecords,
  Invitation,
  MiningStats,
  RewardRecord,
} from "./records";
import { sumDecimals } from "./amounts.ts";

export type DataMode = "test" | "live";
export const TEST_ADDRESS = "0x1111111111111111111111111111111111111111";
export const TEST_BALANCES = { USDT: "1250.50", NARO: "12500" } as const;
export function initialDataMode(
  search: string,
  saved: string | null,
): DataMode {
  const requested = new URLSearchParams(search).get("data");
  return (requested ?? saved) === "live" ? "live" : "test";
}
// Deliberately fictional identities. Never use the connected address in these fixtures.
const branches = [
  {
    userId: 2041,
    address: "0x2222222222222222222222222222222222222222",
    holding: "4500",
    communityHolding: "42000",
    memberCount: 24,
    power: "42000",
    largest: true,
  },
  {
    userId: 2042,
    address: "0x3333333333333333333333333333333333333333",
    holding: "3200",
    communityHolding: "28000",
    memberCount: 18,
    power: "28000",
  },
  {
    userId: 2043,
    address: "0x4444444444444444444444444444444444444444",
    holding: "800",
    communityHolding: "8400",
    memberCount: 9,
    power: "84000",
  },
  {
    userId: 2044,
    address: "0x5555555555555555555555555555555555555555",
    holding: "1200",
    communityHolding: "8000",
    memberCount: 6,
    power: "80000",
    frozen: true,
  },
];
export const testDashboard: NaroDashboard = {
  chainId: 97,
  walletAddress: TEST_ADDRESS,
  userId: 2040,
  ledgerRegistered: true,
  ieoCompleted: true,
  invitationCode: "NARO2040",
  inviterAddress: "0x6666666666666666666666666666666666666666",
  accrued: "1240.50",
  lastSettled: "2026-10-19",
  mining: {
    balance: TEST_BALANCES.NARO,
    staticReward: "880.25",
    dynamicReward: "280.25",
    daoRankingReward: "80",
    staticPool: "125000",
    holdingRankWeight: "12500",
    dynamicPool: "75000",
    dynamicPower: "112000",
    daoRankingWeight: "24000",
    daoRankingPool: "50000",
    community: { dynamicPower: "112000", branches },
  },
};
export const testNetwork: NetworkRecords = {
  chainId: 97,
  lastSettled: "2026-10-19",
  chainCirculatingSupply: "864000000",
  chainBurnedSupply: "136000000",
  chainHolderCount: 24816,
  mined: "48250000",
  staticRatio: 50,
  dynamicRatio: 30,
  rankingRatio: 20,
  nextBurnAt: "2026-10-20T08:00:00+08:00",
  outputStages: [
    { rate: "0.1" },
    { rate: "0.08" },
    { rate: "0.06" },
    { rate: "0.04" },
    { rate: "0.02" },
  ],
};
export const testInvitation: Invitation = {
  chainId: 97,
  communityPower: "112000",
  personalPower: "12500",
  directCount: branches.length,
  directInvitees: branches,
};
export const testStats: MiningStats = {
  chainId: 97,
  staticPool: "125000",
  referralPool: "75000",
  rankingPool: "50000",
};
// No transaction hashes: these are UI records, never fabricated chain receipts.
export const testHistory: RewardRecord[] = Array.from(
  { length: 14 },
  (_, i) => ({
    business_date: `2026-10-${String(19 - i).padStart(2, "0")}`,
    static_reward: i === 0 ? "880.25" : `${780 + i * 7}.25`,
    referral_reward: i === 0 ? "280.25" : `${210 + i * 3}.25`,
    ranking_reward: i === 0 ? "80" : `${60 + i}`,
    top_reward: i === 0 ? "80" : `${60 + i}`,
    claimed_reward: i === 0 ? "0" : `${1050 + i * 11}.50`,
  }),
);
export const testRewardTotals = {
  earned: sumDecimals(
    testHistory.flatMap((row) => [
      row.static_reward,
      row.referral_reward,
      row.top_reward,
    ]),
  ),
  claimed: sumDecimals(testHistory.map((row) => row.claimed_reward)),
};
export const testRecords = {
  dashboard: testDashboard,
  network: testNetwork,
  invitation: testInvitation,
  stats: testStats,
  history: testHistory,
  loading: false,
  error: false,
};
