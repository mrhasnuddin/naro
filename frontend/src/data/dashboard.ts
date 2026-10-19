export type AccountPreview = "active" | "setup" | "public";
export type DataMode = "sample" | "wallet";
// Fixtures are never merged with connected-wallet records.
export const sample = Object.freeze({
  total: 1240.5,
  holdingsReward: 880.25,
  communityReward: 280.25,
  rankReward: 80,
  settled: 12500,
  wallet: 12650,
  members: 12,
  community: 86400,
  supply: 987200000,
  burned: 12800000,
  holders: 8420,
});
export const snapshot = new Date("2026-10-18T16:00:00Z");
export const SAMPLE_ADDRESS = "0x1111111111111111111111111111111111111111";
export const SAMPLE_INVITER = "0x2222222222222222222222222222222222222222";
// Supply verified deployments and ABIs before implementing contract reads/writes.
export interface NaroAccount {
  address: `0x${string}`;
  activation: "unknown" | "active" | "inactive";
  inviter: `0x${string}` | null;
  settledBalance: bigint | null;
  claimableRewards: bigint | null;
  decimals: number | null;
  blockNumber: bigint | null;
}
export const contractAvailability = {
  account: false,
  rewards: false,
  community: false,
  network: false,
} as const;
