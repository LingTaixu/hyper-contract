import { defineChain } from "viem";

export const HyperEVMChain = defineChain({
  id: 999,
  name: "Hyper",
  nativeCurrency: {
    decimals: 18,
    name: "HYPE",
    symbol: "HYPE",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.hyperliquid.xyz/evm"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://www.hyperscan.com/" },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 13051,
    },
  },
});

export const walletPrivateKey = process.env.WALLET_PRIVATE_KEY;

export const contractAddress = process.env.CONTRACT_ADDRESS;
