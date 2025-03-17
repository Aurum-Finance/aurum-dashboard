import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";

const METEORA_POOL_ID = new PublicKey(
  process.env.NEXT_PUBLIC_METEORA_POOL_ID || ""
);

interface UserPosition {
  depositedAmount: number;
  currentValue: number;
  earnedFees: number;
}

interface PoolInfo {
  tvl: number;
  apy: string;
  tradingVolume: number;
  feeVolume: number;
  virtualPrice: number;
}

const USER_DEPOSITS_KEY = "meteora-user-deposits";

export class MeteoraProgramService {
  private connection: Connection;
  private poolId: PublicKey;

  constructor(connection: Connection) {
    this.connection = connection;
    this.poolId = METEORA_POOL_ID;
  }

  async getPoolInfo(): Promise<PoolInfo> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_METEORA_API_URL}/${process.env.NEXT_PUBLIC_METEORA_POOL_ID}`
      );
      const data = await response.json();

      return {
        tvl: parseFloat(data.liquidity),
        apy: data.apy.toFixed(2) + "%",
        tradingVolume: data.trade_volume_24h,
        feeVolume: data.fees_24h,
        virtualPrice: data.current_price,
      };
    } catch (error) {
      console.error("Error fetching pool info:", error);
      return {
        tvl: 0,
        apy: "0.00%",
        tradingVolume: 0,
        feeVolume: 0,
        virtualPrice: 1.0,
      };
    }
  }

  async deposit(wallet: WalletContextState, amount: number): Promise<string> {
    if (!wallet.publicKey?.toString()) {
      throw new Error("Wallet not connected");
    }

    try {
      const amountLamports = Math.floor(amount * LAMPORTS_PER_SOL);
      if (amountLamports <= 0) {
        throw new Error("Invalid deposit amount");
      }

      const balance = await this.connection.getBalance(wallet.publicKey);
      if (balance < amountLamports + 5000) {
        throw new Error("Insufficient SOL balance");
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: this.poolId,
          lamports: amountLamports,
        })
      );

      const signature = await wallet.sendTransaction(
        transaction,
        this.connection
      );

      await this.connection.confirmTransaction(signature);
      this.updateLocalDeposits(wallet.publicKey.toString(), amount);

      return signature;
    } catch (error) {
      console.error("Deposit failed:", error);
      throw error;
    }
  }

  private updateLocalDeposits(walletKey: string, amount: number): void {
    const deposits = JSON.parse(
      localStorage.getItem(USER_DEPOSITS_KEY) || "{}"
    );
    deposits[walletKey] = (deposits[walletKey] || 0) + amount;
    localStorage.setItem(USER_DEPOSITS_KEY, JSON.stringify(deposits));
  }

  async getUserPosition(walletPublicKey: PublicKey): Promise<UserPosition> {
    const walletKey = walletPublicKey.toString();
    const deposits = JSON.parse(
      localStorage.getItem(USER_DEPOSITS_KEY) || "{}"
    );
    const depositedAmount = parseFloat(deposits[walletKey]) || 0;

    try {
      const poolInfo = await this.getPoolInfo();

      return {
        depositedAmount,
        currentValue: depositedAmount * poolInfo.virtualPrice,
        earnedFees: depositedAmount * (poolInfo.virtualPrice - 1),
      };
    } catch (error) {
      console.error("Error calculating position:", error);
      return {
        depositedAmount,
        currentValue: depositedAmount,
        earnedFees: 0,
      };
    }
  }
}
