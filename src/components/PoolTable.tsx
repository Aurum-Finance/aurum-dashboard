import { useState } from "react";
import { Progress } from "./ui/Progress";
import Image from "next/image";
import JitoLogo from "../../public/jito.png";
import Favicon from "../../public/favicon.png";

interface PoolData {
  name: string;
  pair: string;
  ltv: string;
  deposit: {
    amount: string;
    value: string;
  };
  tvl: {
    current: number;
    max: number;
  };
  apr: string;
  bonus: string;
}

export default function PoolTable() {
  const [expandedPool, setExpandedPool] = useState<number | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>("");

  const pools: PoolData[] = [
    {
      name: "auSOL/JitoSOL",
      pair: "auSOL/JitoSOL",
      ltv: "50%",
      deposit: {
        amount: "0.00 auSOL",
        value: "$0.00",
      },
      tvl: {
        current: 127.63,
        max: 20000.0,
      },
      apr: "0.12%",
      bonus: "-",
    },
  ];

  const toggleExpand = (index: number) => {
    setExpandedPool(expandedPool === index ? null : index);
    setDepositAmount("");
  };

  const handleDeposit = (index: number) => {
    // Implement your deposit logic here
    console.log(`Depositing ${depositAmount} to pool ${index}`);
    // Reset after deposit
    setDepositAmount("");
    setExpandedPool(null);
  };

  return (
    <div className="w-full space-y-2 bg-[#D9D9D9] p-4">
      {pools.map((pool, index) => (
        <div
          key={index}
          className={`group relative rounded-lg bg-[#1A1A1A] hover:border-2 border-red-500/50 transition-all duration-200 ${
            expandedPool === index ? "border-2 border-red-500" : ""
          }`}
        >
          {/* Add Pool Button */}
          <button className="absolute w-8 -left-4 top-10 rounded-md bg-gray-800 p-1 opacity-0 transition-opacity group-hover:opacity-100">
            +
          </button>

          {/* Main Pool Row - Always visible */}
          <div
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={() => toggleExpand(index)}
          >
            {/* Pool Info */}
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10">
                <div className="relative rounded-full">
                  <Image src={Favicon} alt="Favicon" className="z-[90]" />
                  <Image
                    src={JitoLogo}
                    alt="Jito Logo"
                    className="absolute w-8 h-8 bg-white rounded-full -mt-5 ml-4 z-[999]"
                  />
                </div>
              </div>
              <div className="ml-5">
                <h3 className="font-medium text-white">{pool.name}</h3>
                <p className="text-sm text-gray-400">LTV: {pool.ltv}</p>
              </div>
            </div>

            {/* Deposit */}
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">Deposit</span>
              <span className="font-medium text-white">
                {pool.deposit.amount}
              </span>
              <span className="text-sm text-gray-500">
                {pool.deposit.value}
              </span>
            </div>

            {/* TVL/Cap */}
            <div className="flex w-48 flex-col">
              <span className="text-sm text-gray-400">TVL/Cap</span>
              <Progress
                value={(pool.tvl.current / pool.tvl.max) * 100}
                className="h-2 w-full bg-gray-800"
              />
              <span className="text-sm text-gray-500">
                {pool.tvl.current}/{pool.tvl.max} auSOL
              </span>
            </div>

            {/* APR */}
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">APY</span>
              <span className="font-medium text-white">10.50%</span>
            </div>

            {/* Bonus */}
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">Bonus</span>
              <span className="font-medium text-white">{pool.bonus}</span>
            </div>
          </div>

          {/* Expanded Deposit Section */}
          {expandedPool === index && (
            <div className="p-4 border-t border-gray-800 bg-[#242424] rounded-b-lg">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="w-full md:w-1/2">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-400 mb-2">
                      Deposit Amount
                    </span>
                    <div className="flex items-center bg-[#1A1A1A] rounded-md border border-gray-700 p-2">
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                        className="flex-1 bg-transparent text-white outline-none"
                      />
                      <span className="text-gray-400 ml-2">auSOL</span>
                      <button
                        className="ml-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                        onClick={() =>
                          setDepositAmount(pool.tvl.max.toString())
                        }
                      >
                        MAX
                      </button>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        Balance: 0.00 auSOL
                      </span>
                      <span className="text-xs text-gray-500">≈ $0.00</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col w-full md:w-1/3 gap-2">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
                    onClick={() => handleDeposit(index)}
                    disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                  >
                    Deposit
                  </button>

                  <div className="text-xs text-gray-400 mt-1">
                    <div className="flex justify-between">
                      <span>Slippage Tolerance:</span>
                      <span>0.5%</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Minimum Received:</span>
                      <span>
                        {depositAmount ? parseFloat(depositAmount) * 0.995 : 0}{" "}
                        auSOL
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="bg-gray-800 hover:bg-gray-700 text-white text-sm py-1 px-3 rounded">
                  0.5
                </button>
                <button className="bg-gray-800 hover:bg-gray-700 text-white text-sm py-1 px-3 rounded">
                  1
                </button>
                <button className="bg-gray-800 hover:bg-gray-700 text-white text-sm py-1 px-3 rounded">
                  2
                </button>
                <button className="bg-gray-800 hover:bg-gray-700 text-white text-sm py-1 px-3 rounded">
                  5
                </button>
                <span className="text-gray-400 ml-2 flex items-center">
                  0.5 %
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
