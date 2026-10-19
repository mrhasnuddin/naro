import { TESTNET as BSC_TESTNET } from "../../../prototype/wallet.js";
export const isLocalDemo =
  new URLSearchParams(location.search).get("network") === "local";
export const TARGET_NETWORK = isLocalDemo
  ? {
      chainId: "0x7a69",
      chainName: "NARO Local Demo",
      nativeCurrency: { name: "Local test ETH", symbol: "ETH", decimals: 18 },
      rpcUrls: ["http://127.0.0.1:8545"],
      blockExplorerUrls: [],
    }
  : BSC_TESTNET;
export const chainId = Number(BigInt(TARGET_NETWORK.chainId));
