import { useSyncExternalStore } from "react";
import {
  WalletConnection,
  discoverWallets,
} from "../../../../prototype/wallet.js";
import { TARGET_NETWORK } from "../../demo/network";
export { TARGET_NETWORK as TESTNET };
export interface EvmProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}
export interface WalletEntry {
  id: string;
  name: string;
  image: string;
  provider: EvmProvider;
}
export interface WalletState {
  address: string | null;
  chainId: string | null;
  name: string | null;
  busy: boolean;
  error: string | null;
}
interface Controller {
  state: WalletState;
  provider: EvmProvider | null;
  connect(entry: WalletEntry): Promise<void>;
  switchNetwork(): Promise<void>;
  forget(): void;
}
const listeners = new Set<() => void>();
let entries: WalletEntry[] = [];
let state: WalletState = {
  address: null,
  chainId: null,
  name: null,
  busy: false,
  error: null,
};
let snapshot = { state, entries };
const publish = () => {
  snapshot = { state, entries };
  listeners.forEach((listener) => listener());
};
const Constructor = WalletConnection as unknown as {
  new (
    callback: (state: WalletState) => void,
    network: typeof TARGET_NETWORK,
  ): Controller;
};
export const connection = new Constructor((next) => {
  state = next;
  publish();
}, TARGET_NETWORK);
// Discovery remains active for the lifetime of this page, as required by EIP-6963.
const discovery = discoverWallets(window, (next: unknown[]) => {
  entries = [...next] as WalletEntry[];
  publish();
});
entries = [...discovery.entries] as WalletEntry[];
snapshot = { state, entries };
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export function useWallet() {
  return {
    ...useSyncExternalStore(subscribe, () => snapshot),
    connect: (entry: WalletEntry) => connection.connect(entry),
    switchNetwork: () => connection.switchNetwork(),
    forget: () => connection.forget(),
    refresh: () => {
      discovery.refresh();
      entries = [...discovery.entries] as WalletEntry[];
      publish();
    },
  };
}
export const shortAddress = (address: string) =>
  `${address.slice(0, 6)}…${address.slice(-4)}`;
