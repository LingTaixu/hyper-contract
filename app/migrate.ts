import { createPublicClient, createWalletClient, http, isAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import GEMSGUNLAUNCHABI from "../abi/GemsLaunchpadV0_abi.json";
import { HyperEVMChain } from "../config";
interface MigrateParams {
  tokenAddr: string;
  deadline: number;
}

class ContractService {
  private publicClient: ReturnType<typeof createPublicClient>;
  private walletClient: ReturnType<typeof createWalletClient>;
  private contractAddress: `0x${string}`;

  constructor(
    contractAddress: string,
    providerUrl: string,
    privateKey: string
  ) {
    // 验证输入
    if (!isAddress(contractAddress)) {
      throw new Error("无效的合约地址");
    }
    if (!privateKey) {
      throw new Error("私钥不能为空");
    }

    this.publicClient = createPublicClient({
      transport: http(providerUrl),
    });

    const account = privateKeyToAccount(privateKey as `0x${string}`);
    this.walletClient = createWalletClient({
      account,
      transport: http(providerUrl),
    });

    this.contractAddress = contractAddress as `0x${string}`;

    console.log("Contract initialized at:", contractAddress);
  }

  async migrate(params: MigrateParams): Promise<string> {
    try {
      if (!isAddress(params.tokenAddr)) {
        throw new Error("无效的代币地址");
      }
      if (params.deadline <= 0 || !Number.isInteger(params.deadline)) {
        throw new Error("无效的截止时间");
      }

      const estimatedGas = await this.publicClient.estimateContractGas({
        address: this.contractAddress,
        abi: GEMSGUNLAUNCHABI,
        functionName: "migrate",
        args: [params.tokenAddr, params.deadline],
        account: this.walletClient.account,
      });

      const gasLimit = (estimatedGas * BigInt(120)) / BigInt(100);

      const txHash = await this.walletClient.writeContract({
        chain: HyperEVMChain,
        address: this.contractAddress,
        abi: GEMSGUNLAUNCHABI,
        functionName: "migrate",
        args: [params.tokenAddr, params.deadline],
        gas: gasLimit,
        account: this.walletClient.account as any,
      });

      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      console.log(`交易确认: ${receipt.transactionHash}`);
      return receipt.transactionHash;
    } catch (error) {
      console.error("调用 migrate 失败:", error);
      throw error;
    }
  }
}

export async function main(
  tokenAddr: string,
  contractAddress: string,
  privateKey: string
) {
  const providerUrl = "https://rpc.hyperliquid.xyz/evm";
  try {
    const service = new ContractService(
      contractAddress,
      providerUrl,
      privateKey
    );
    const params: MigrateParams = {
      tokenAddr,
      deadline: Math.floor(Date.now() / 1000) + 120,
    };
    const migratedTxHash = await service.migrate(params);
    console.log(`迁移交易哈希: ${migratedTxHash}`);
    return migratedTxHash;
  } catch (error) {
    console.error("迁移失败:", error);
    throw error;
  }
}

export { ContractService };
