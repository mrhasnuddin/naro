import {
  Contract,
  ContractFactory,
  JsonRpcProvider,
  BrowserProvider,
  ZeroAddress,
  getAddress,
  isAddress,
  keccak256,
  id,
  type TransactionRequest,
  type TransactionReceipt,
  FetchRequest,
  type Eip1193Provider,
} from "ethers";
import artifacts from "./abi.json";
import bundled from "./deployments.json";
import { chainId, TARGET_NETWORK } from "./network";
import { connection } from "../features/wallet/store";
import { assertBoundChain } from "./transactions";
export interface Deployment {
  chainId: number;
  address: string;
  token: string;
  blockNumber: number;
  transactionHash: string;
  systemCodeHash: string;
  tokenCodeHash: string;
  deployer: string;
}
export interface DemoData {
  deployment: Deployment;
  blockNumber: number;
  timestamp: number;
  loadedAt: number;
  active: boolean;
  inviter: string;
  nextClaimAt: number;
  claimed: bigint;
  balance: bigint;
  claimable: bigint;
  pool: bigint;
  totalSupply: bigint;
  initialSupply: bigint;
  totalClaimed: bigint;
  memberCount: bigint;
  directCount: bigint;
  referrals: string[];
  decimals: number;
  reward: bigint;
  cooldown: number;
  history: { hash: string; blockNumber: number; amount: bigint }[];
  historyError: boolean;
}
export type Action = "activate" | "claim" | "deploy";
export interface Quote {
  kind: Action;
  sender: string;
  inviter: string;
  gas: bigint;
  maxGasCost: bigint;
  request: TransactionRequest;
  wallet: unknown;
  chainId: number;
}
const endpoint = new FetchRequest(TARGET_NETWORK.rpcUrls[0]);
endpoint.timeout = 15000;
export const readProvider = new JsonRpcProvider(endpoint, undefined, {
  cacheTimeout: 250,
});
readProvider.pollingInterval = 1000;
export function deployment(): Deployment | null {
  try {
    const saved = localStorage.getItem(`naro:demo:${chainId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (
        parsed.chainId === chainId &&
        isAddress(parsed.address) &&
        isAddress(parsed.token) &&
        Number.isSafeInteger(parsed.blockNumber) &&
        parsed.blockNumber >= 0 &&
        /^0x[0-9a-f]{64}$/i.test(parsed.systemCodeHash) &&
        /^0x[0-9a-f]{64}$/i.test(parsed.tokenCodeHash)
      )
        return parsed;
    }
  } catch {}
  return (bundled as Record<string, Deployment>)[String(chainId)] || null;
}
export async function checkChain() {
  if (Number(BigInt(await readProvider.send("eth_chainId", []))) !== chainId)
    throw new Error("WrongRpcNetwork");
}
export async function verifyDeployment(config: Deployment) {
  await checkChain();
  const [systemCode, tokenCode] = await Promise.all([
    readProvider.getCode(config.address),
    readProvider.getCode(config.token),
  ]);
  if (
    systemCode === "0x" ||
    tokenCode === "0x" ||
    keccak256(systemCode) !== config.systemCodeHash ||
    keccak256(tokenCode) !== config.tokenCodeHash
  )
    throw new Error("DeploymentMismatch");
  const system = new Contract(config.address, artifacts.system, readProvider);
  if (
    (await system.DEMO_ID()) !== id("NARO_LEARNING_DEMO_V1") ||
    getAddress(await system.token()) !== getAddress(config.token)
  )
    throw new Error("DeploymentMismatch");
  return system;
}
export async function readDemo(
  address: string | null,
  history = false,
): Promise<DemoData | null> {
  const config = deployment();
  if (!config) return null;
  const system = await verifyDeployment(config),
    token = new Contract(config.token, artifacts.token, readProvider);
  const block = await readProvider.getBlock("latest");
  if (!block) throw new Error("ReadFailed");
  const who = address || ZeroAddress,
    opts = { blockTag: block.number };
  const [
    member,
    balance,
    claimable,
    pool,
    totalSupply,
    initialSupply,
    totalClaimed,
    memberCount,
    directCount,
    referrals,
    decimals,
    reward,
    cooldown,
  ] = await Promise.all([
    system.members(who, opts),
    token.balanceOf(who, opts),
    system.claimable(who, opts),
    token.balanceOf(config.address, opts),
    token.totalSupply(opts),
    token.INITIAL_SUPPLY(opts),
    system.totalClaimed(opts),
    system.memberCount(opts),
    system.directCount(who, opts),
    system.referrals(who, 0, 20, opts),
    token.decimals(opts),
    system.CLAIM_REWARD(opts),
    system.CLAIM_COOLDOWN(opts),
  ]);
  let records: DemoData["history"] = [],
    historyError = false;
  if (history && address) {
    try {
      const events = await system.queryFilter(
        system.filters.Claimed(address),
        Math.max(config.blockNumber, block.number - 2000),
        block.number,
      );
      records = events
        .slice(-10)
        .reverse()
        .map((log) => {
          const parsed = system.interface.parseLog(log);
          return {
            hash: log.transactionHash,
            blockNumber: log.blockNumber,
            amount: BigInt(parsed!.args.amount),
          };
        });
    } catch {
      historyError = true;
    }
  }
  return {
    deployment: config,
    blockNumber: block.number,
    timestamp: block.timestamp,
    loadedAt: Date.now(),
    active: member.active,
    inviter: member.inviter,
    nextClaimAt: Number(member.nextClaimAt),
    claimed: BigInt(member.claimed),
    balance: BigInt(balance),
    claimable: BigInt(claimable),
    pool: BigInt(pool),
    totalSupply: BigInt(totalSupply),
    initialSupply: BigInt(initialSupply),
    totalClaimed: BigInt(totalClaimed),
    memberCount: BigInt(memberCount),
    directCount: BigInt(directCount),
    referrals: Array.from(referrals),
    decimals: Number(decimals),
    reward: BigInt(reward),
    cooldown: Number(cooldown),
    history: records,
    historyError,
  };
}
async function walletSigner(sender: string) {
  const provider = connection.provider;
  if (
    !provider ||
    connection.state.address?.toLowerCase() !== sender.toLowerCase()
  )
    throw new Error("WalletChanged");
  if (
    Number(
      BigInt((await provider.request({ method: "eth_chainId" })) as string),
    ) !== chainId
  )
    throw new Error("WrongWalletNetwork");
  const browser = new BrowserProvider(provider as Eip1193Provider, "any");
  browser.pollingInterval = 1000;
  return { browser, signer: await browser.getSigner(sender), provider };
}
export async function prepareAction(
  kind: Action,
  sender: string,
  inviterInput = "",
): Promise<Quote> {
  if (chainId !== 97 && chainId !== 31337)
    throw new Error("WrongWalletNetwork");
  const { signer, provider } = await walletSigner(sender);
  let inviter = ZeroAddress,
    request: TransactionRequest;
  if (kind === "deploy")
    request = await new ContractFactory(
      artifacts.system,
      artifacts.bytecode,
      signer,
    ).getDeployTransaction();
  else {
    const config = deployment();
    if (!config) throw new Error("NotDeployed");
    await verifyDeployment(config);
    const system = new Contract(config.address, artifacts.system, signer);
    if (kind === "activate") {
      if (inviterInput.trim()) {
        if (!isAddress(inviterInput.trim())) throw new Error("InvalidInviter");
        inviter = getAddress(inviterInput.trim());
      }
      await system.activate.staticCall(inviter);
      request = await system.activate.populateTransaction(inviter);
    } else {
      await system.claim.staticCall();
      request = await system.claim.populateTransaction();
    }
  }
  request.value = 0n;
  request.chainId = chainId;
  const gas = await signer.estimateGas(request),
    fee = await signer.provider.getFeeData();
  const maxPrice = fee.maxFeePerGas ?? fee.gasPrice;
  if (maxPrice === null) throw new Error("ReadFailed");
  return {
    kind,
    sender,
    inviter,
    gas,
    maxGasCost: ((gas * 120n) / 100n) * maxPrice,
    request: { ...request, gasLimit: (gas * 120n) / 100n },
    wallet: provider,
    chainId,
  };
}
export async function sendQuote(quote: Quote) {
  assertBoundChain(quote.request, chainId);
  if (quote.wallet !== connection.provider || quote.chainId !== chainId)
    throw new Error("WalletChanged");
  const { signer } = await walletSigner(quote.sender);
  return signer.sendTransaction(quote.request);
}
export async function saveDeployment(
  receipt: TransactionReceipt,
  sender: string,
) {
  const address = receipt.contractAddress;
  if (!address || receipt.status !== 1) throw new Error("DeployFailed");
  const system = new Contract(address, artifacts.system, readProvider),
    token = await system.token();
  const config: Deployment = {
    chainId,
    address,
    token,
    blockNumber: receipt.blockNumber,
    transactionHash: receipt.hash,
    systemCodeHash: keccak256(await readProvider.getCode(address)),
    tokenCodeHash: keccak256(await readProvider.getCode(token)),
    deployer: sender,
  };
  await verifyDeployment(config);
  localStorage.setItem(`naro:demo:${chainId}`, JSON.stringify(config));
  window.dispatchEvent(new Event("naro:deployment"));
  return config;
}
export function errorKey(error: unknown): string {
  const e = error as {
    code?: string | number;
    data?: string;
    error?: { data?: string };
    message?: string;
    shortMessage?: string;
    info?: { error?: { code?: number; data?: string } };
  };
  if (
    e?.code === 4001 ||
    e?.code === "ACTION_REJECTED" ||
    e?.info?.error?.code === 4001
  )
    return "rejected";
  if (e?.code === "INSUFFICIENT_FUNDS") return "funds";
  const known = [
    "AlreadyActive",
    "NotActive",
    "InvalidInviter",
    "ClaimNotReady",
    "PoolExhausted",
    "WrongWalletNetwork",
    "WalletChanged",
    "DeploymentMismatch",
    "WrongRpcNetwork",
    "NotDeployed",
  ];
  for (const name of known) {
    if (e?.message?.includes(name) || e?.shortMessage?.includes(name))
      return name;
  }
  const data = e?.data || e?.error?.data || e?.info?.error?.data;
  if (typeof data === "string") {
    try {
      const parsed = new Contract(
        ZeroAddress,
        artifacts.system,
      ).interface.parseError(data);
      if (parsed && known.includes(parsed.name)) return parsed.name;
    } catch {}
  }
  return "failed";
}
