import {demoCopy} from "./demo/copy.ts";
import en from "../../prototype/locales/en.js";
import zh from "../../prototype/locales/zh-Hans.js";
export type Locale = "en" | "zh-Hans";
export type CopyKey = keyof typeof en;
const extra = {
  en: {
    "app.view": "Data view",
    "app.sample": "Sample dashboard",
    "app.wallet": "My wallet",
    "app.note": "BNB testnet · Sample dashboard data",
    "app.liveNote": "BNB testnet · Wallet data only",
    "app.noContracts":
      "NARO account data is not connected yet. Your wallet connection works; rewards, activation, and community records will appear after contract integration.",
    "app.balance": "Test BNB balance",
    "app.balanceLoading": "Reading wallet balance…",
    "app.balanceError":
      "Balance unavailable. Check your wallet connection and try again.",
    "app.refresh": "Refresh balance",
    "app.explorer": "View on BscScan",
    "app.noWallet":
      "Connect a wallet to view its address, network, and test BNB balance.",
    "app.dataUnavailable": "Not available yet",
    "app.inviteReceived": "Invitation received",
    "app.inviteReceivedNote":
      "Code {code} is saved for this visit. The inviter has not been verified.",
    "app.help": "Help",
    "app.failure": "This page could not load. Reload to try again.",
    "app.reload": "Reload page",
  },
  "zh-Hans": {
    "app.view": "数据视图",
    "app.sample": "示例仪表盘",
    "app.wallet": "我的钱包",
    "app.note": "BNB 测试网 · 示例仪表盘数据",
    "app.liveNote": "BNB 测试网 · 仅显示钱包数据",
    "app.noContracts":
      "NARO 账户数据尚未接入。钱包可正常连接；奖励、激活和社区记录将在合约接入后显示。",
    "app.balance": "测试 BNB 余额",
    "app.balanceLoading": "正在读取钱包余额…",
    "app.balanceError": "无法读取余额。请检查钱包连接后重试。",
    "app.refresh": "刷新余额",
    "app.explorer": "在 BscScan 查看",
    "app.noWallet": "连接钱包以查看地址、网络和测试 BNB 余额。",
    "app.dataUnavailable": "暂不可用",
    "app.inviteReceived": "已收到邀请",
    "app.inviteReceivedNote": "本次访问已保存邀请码 {code}。邀请人尚未验证。",
    "app.help": "帮助",
    "app.failure": "页面无法加载。请刷新重试。",
    "app.reload": "刷新页面",
  },
};
export type Key = CopyKey | keyof typeof extra.en | keyof typeof demoCopy.en;
export const catalogs: Record<Locale, Record<string, string>> = {
  en: { ...en, ...extra.en, ...demoCopy.en },
  "zh-Hans": { ...zh, ...extra["zh-Hans"], ...demoCopy["zh-Hans"] },
};
