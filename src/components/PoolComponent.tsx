import { useState, useEffect } from "react";
import Image from "next/image";
import { useMeteora } from "../hooks/useMeteora";
import { useWallet } from "@solana/wallet-adapter-react";
import SolLogo from "../../public/sol.png";
import SonicLogo from "../../public/sonic.png";

interface PoolData {
  pool_name: string;
  pool_tvl: string;
  daily_base_apy: number;
  trading_volume: number;
  fee_volume: number;
  pool_token_amounts: string[];
  trade_apy?: number;
  cap?: number;
  virtual_price_apy?: number;
  weekly_trade_apy?: number;
  weekly_base_apy?: number;
  yield_volume?: string;
  pool_lp_price_in_usd?: string;
  total_fee_pct?: string;
  liquidity?: string;
}

export default function PoolComponent() {
  const [depositAmount, setDepositAmount] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState("Deposit");
  const [slippage, setSlippage] = useState("0.5");
  const [isLoading, setIsLoading] = useState(false);
  const [lastDepositSignature, setLastDepositSignature] = useState<
    string | null
  >(null);
  const [userDeposit, setUserDeposit] = useState({
    amount: 0,
    value: 0,
  });
  const [poolData, setPoolData] = useState<PoolData>({
    pool_name: "SONIC-SOL",
    pool_tvl: "0",
    daily_base_apy: 0,
    trading_volume: 0,
    fee_volume: 0,
    pool_token_amounts: ["0", "0"],
  });

  const { program } = useMeteora();
  const wallet = useWallet();
  const poolId = process.env.NEXT_PUBLIC_METEORA_POOL_ID;
  const poolCap = parseInt(process.env.NEXT_PUBLIC_POOL_CAP || "100000");
  useEffect(() => {
    const fetchPoolData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_METEORA_API_URL}/${poolId}`
        );
        const data = await response.json();
        console.log("Fetched pool data:", data);

        setPoolData({
          pool_name: data.name,
          pool_tvl: data.liquidity,
          cap: data.cap || 200000000,
          daily_base_apy: data.apy,
          trading_volume: data.trade_volume_24h,
          fee_volume: data.fees_24h,
          pool_token_amounts: [
            data.reserve_x_amount.toString(),
            data.reserve_y_amount.toString(),
          ],
          pool_lp_price_in_usd: data.current_price.toString(),
          trade_apy: data.apr,
          virtual_price_apy: data.apy,
          weekly_base_apy: data.apy,
          total_fee_pct: data.base_fee_percentage,
        });
      } catch (error) {
        console.error("Error fetching pool data:", error);
      }
    };

    const fetchUserDeposit = async () => {
      if (wallet.publicKey && program) {
        try {
          const userPosition = await program.getUserPosition(wallet.publicKey);
          setUserDeposit({
            amount: userPosition.depositedAmount,
            value: userPosition.currentValue,
          });
        } catch (error) {
          console.error("Error fetching user deposit:", error);
        }
      }
    };

    fetchPoolData();
    if (wallet.connected) {
      fetchUserDeposit();
    }

    const interval = setInterval(
      fetchPoolData,
      parseInt(process.env.NEXT_PUBLIC_REFRESH_INTERVAL || "60000")
    );

    return () => clearInterval(interval);
  }, [program, wallet.connected, wallet.publicKey]);

  useEffect(() => {
    if (lastDepositSignature && wallet.publicKey) {
      const fetchUpdatedPosition = async () => {
        if (wallet.publicKey) {
          try {
            const position = await program.getUserPosition(wallet.publicKey);
            setUserDeposit({
              amount: position.depositedAmount,
              value: position.currentValue,
            });
          } catch (error) {
            console.error("Error updating position after deposit:", error);
          }
        }
      };
      fetchUpdatedPosition();
    }
  }, [lastDepositSignature, wallet.publicKey, program]);

  const handleDeposit = async () => {
    if (!wallet.connected || !depositAmount) return;

    try {
      setIsLoading(true);
      const signature = await program.deposit(
        wallet,
        parseFloat(depositAmount)
      );
      console.log(`Depositing $${depositAmount} to SONIC-SOL pool`);
      setLastDepositSignature(signature);
      setDepositAmount("");
      setIsExpanded(false);
    } catch (error) {
      console.error("Deposit error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlippageChange = (value: string) => {
    setSlippage(value);
  };

  return (
    <div className="w-full space-y-2 bg-[#D9D9D9] p-4">
      <div
        className={`group relative rounded-lg bg-[#1A1A1A] hover:border-2 border-red-500/50 transition-all duration-200 ${
          isExpanded ? "border-2 border-red-500" : ""
        }`}
      >
        <button className="absolute w-8 -left-4 top-10 rounded-md bg-gray-800 p-1 opacity-0 transition-opacity group-hover:opacity-100">
          +
        </button>

        <div
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <div className="relative rounded-full">
                <Image
                  src={SolLogo}
                  alt="Solana"
                  className="z-[90] rounded-full"
                />
                <Image
                  src={SonicLogo}
                  alt="Sonic Logo"
                  className="absolute w-8 h-8 bg-white rounded-full -mt-5 ml-4 z-[999]"
                />
              </div>
            </div>
            <div className="ml-5">
              <h3 className="font-medium text-white">
                {poolData.pool_name || "SONIC-SOL"}
              </h3>
              <p className="text-sm text-gray-400">Meteora DLMM Pool</p>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Deposited</span>
            <span className="font-medium text-white">
              {userDeposit.amount.toFixed(4)} SOL
            </span>
            <span className="text-sm text-gray-500">
              ${userDeposit.value.toFixed(2)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">APY</span>
            <span className="font-medium text-white">
              {poolData.daily_base_apy
                ? poolData.daily_base_apy.toFixed(2)
                : "0.00"}
              %
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-gray-400">24h Volume</span>
            <span className="font-medium text-white">
              $
              {poolData.trading_volume
                ? poolData.trading_volume.toLocaleString()
                : "0"}
            </span>
          </div>
        </div>

        {/* Expanded Section */}
        {isExpanded && (
          <div className="border-t border-gray-800 bg-[#242424] rounded-b-lg">
            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              {["Deposit", "Withdraw", "Migrate"].map((tab) => (
                <button
                  key={tab}
                  className={`px-6 py-3 text-sm ${
                    activeTab === tab
                      ? "text-white border-b-2 border-blue-500"
                      : "text-gray-400"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Deposit Form */}
            {activeTab === "Deposit" && (
              <div className="p-4">
                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                  <div className="w-full md:w-1/2">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400 mb-2">
                          Deposit Amount
                        </span>
                        <span className="text-sm text-gray-400">
                          Balance: {wallet.connected ? "Loading..." : "0.00"}{" "}
                          SOL
                        </span>
                      </div>
                      <div className="flex items-center bg-[#1A1A1A] rounded-md border border-gray-700 p-2">
                        <input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="0.00"
                          className="flex-1 bg-transparent text-white outline-none"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">SOL</span>
                          <button
                            className="ml-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                            onClick={() => setDepositAmount("0.1")}
                          >
                            MAX
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          Minimum Received:{" "}
                          {depositAmount
                            ? (
                                parseFloat(depositAmount) *
                                (1 - parseFloat(slippage) / 100)
                              ).toFixed(6)
                            : "0.000000"}{" "}
                          SOL
                        </span>
                        <span className="text-xs text-gray-500">
                          ≈ $
                          {depositAmount
                            ? (
                                parseFloat(depositAmount) *
                                parseFloat(
                                  poolData.pool_lp_price_in_usd || "50"
                                )
                              ).toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">
                          Maximum Slippage: {slippage}%
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className={`${
                            slippage === "0.5"
                              ? "bg-blue-600"
                              : "bg-gray-800 hover:bg-gray-700"
                          } text-white text-sm py-1 px-3 rounded`}
                          onClick={() => handleSlippageChange("0.5")}
                        >
                          0.5
                        </button>
                        <button
                          className={`${
                            slippage === "1"
                              ? "bg-blue-600"
                              : "bg-gray-800 hover:bg-gray-700"
                          } text-white text-sm py-1 px-3 rounded`}
                          onClick={() => handleSlippageChange("1")}
                        >
                          1
                        </button>
                        <button
                          className={`${
                            slippage === "2"
                              ? "bg-blue-600"
                              : "bg-gray-800 hover:bg-gray-700"
                          } text-white text-sm py-1 px-3 rounded`}
                          onClick={() => handleSlippageChange("2")}
                        >
                          2
                        </button>
                        <button
                          className={`${
                            slippage === "5"
                              ? "bg-blue-600"
                              : "bg-gray-800 hover:bg-gray-700"
                          } text-white text-sm py-1 px-3 rounded`}
                          onClick={() => handleSlippageChange("5")}
                        >
                          5
                        </button>
                        <span className="text-gray-400 ml-2 flex items-center">
                          {slippage} %
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-1/2 md:pl-4">
                    <div className="bg-[#1A1A1A] rounded-lg p-4 h-full">
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <h4 className="text-white font-medium mb-4">APR</h4>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-400">
                              Trading Fees
                            </span>
                            <span className="text-sm text-white">
                              {poolData.trade_apy
                                ? poolData.trade_apy.toFixed(2)
                                : "-"}
                              %
                            </span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-400">Yield</span>
                            <span className="text-sm text-white">
                              {poolData.virtual_price_apy
                                ? poolData.virtual_price_apy.toFixed(2)
                                : "-"}
                              %
                            </span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-400">
                              Total APY
                            </span>
                            <span className="text-sm text-white">
                              {poolData.daily_base_apy
                                ? poolData.daily_base_apy.toFixed(2)
                                : "0.00"}
                              %
                            </span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-400">
                              Weekly APY
                            </span>
                            <span className="text-sm text-white">
                              {poolData.weekly_base_apy
                                ? poolData.weekly_base_apy.toFixed(2)
                                : "-"}
                              %
                            </span>
                          </div>
                          <div className="flex justify-between mb-2"></div>
                        </div>

                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium w-full mt-4"
                          onClick={handleDeposit}
                          disabled={
                            !depositAmount ||
                            !wallet.connected ||
                            parseFloat(depositAmount) <= 0 ||
                            isLoading ||
                            parseFloat(poolData.pool_tvl || "0") >= poolCap
                          }
                        >
                          {!wallet.connected
                            ? "Connect Wallet"
                            : isLoading
                            ? "Processing..."
                            : parseFloat(poolData.pool_tvl || "0") >= poolCap
                            ? "Vault is full"
                            : "Deposit"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Withdraw Tab */}
            {activeTab === "Withdraw" && (
              <div className="p-4 text-gray-400">
                <div className="text-center py-8">
                  <p>Withdraw functionality coming soon</p>
                </div>
              </div>
            )}

            {/* Migrate Tab */}
            {activeTab === "Migrate" && (
              <div className="p-4 text-gray-400">
                <div className="text-center py-8">
                  <p>Migration functionality coming soon</p>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
