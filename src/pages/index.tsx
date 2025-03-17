import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
import Card from "@/components/Card";
import PoolComponent from "@/components/PoolComponent";
import { useState, useEffect } from "react";

interface PoolData {
  reserve_x_amount: number;
  reserve_y_amount: number;
  current_price: number;
}

interface PriceData {
  solana?: { usd: number };
  sonic?: { usd: number };
}

export default function Home() {
  const [tvl, setTvl] = useState("$0.00");
  const [solInPool, setSolInPool] = useState("0.00 SOL");
  const [sonicInPool, setSonicInPool] = useState("0.00 SONIC");
  const [collateralRatio, setCollateralRatio] = useState("0.00%");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const priceResponse = await fetch(
        `${process.env.NEXT_PUBLIC_COINGECKO_API_URL}?ids=solana,sonic&vs_currencies=usd`
      );
      const prices: PriceData = await priceResponse.json();

      const poolResponse = await fetch(
        `${process.env.NEXT_PUBLIC_METEORA_API_URL}/${process.env.NEXT_PUBLIC_METEORA_POOL_ID}`
      );

      const poolData: PoolData = await poolResponse.json();

      const solAmount = poolData.reserve_y_amount / 1e9;
      const sonicAmount = poolData.reserve_x_amount / 1e9;
      const solPrice = prices.solana?.usd || 0; 
      const sonicPrice = prices.sonic?.usd || poolData.current_price; 

      const tvlUSD = solAmount * solPrice + sonicAmount * sonicPrice;
      const collateral =
        ((sonicAmount * sonicPrice) / (solAmount * solPrice)) * 100;

      setTvl(
        `$${tvlUSD.toLocaleString(undefined, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })}`
      );

      setSolInPool(
        `${solAmount.toLocaleString(undefined, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })} SOL`
      );

      setSonicInPool(
        `${sonicAmount.toLocaleString(undefined, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })} SONIC`
      );

      setCollateralRatio(`${collateral.toFixed(2)}%`);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(
      fetchData,
      parseInt(process.env.NEXT_PUBLIC_REFRESH_INTERVAL || "30000")
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(closest-side at 90% 50%, #FBEDB9 50%, #E4E6E7 300%)",
      }}
    >
      <Navbar />
      <Header />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-6 my-8 md:grid-cols-4">
          <Card
            title="Total Value Locked (TVL)"
            value={isLoading ? "Loading..." : tvl}
            description="Real-time total value"
            valueColor="text-black"
          />

          <Card
            title="SOL Liquidity"
            value={isLoading ? "Loading..." : solInPool}
            styleClass="bg-[#1E1E1E] text-white"
            valueColor="text-white "
          />

          <Card
            title="SONIC Liquidity"
            value={isLoading ? "Loading..." : sonicInPool}
            styleClass="bg-[#1E1E1E] text-white"
            valueColor="text-white text-[30px]"
          />

          <Card
            title="Collateral Ratio"
            value={isLoading ? "Loading..." : collateralRatio}
            description={
              parseFloat(collateralRatio) >= 150 ? "Healthy" : "Monitor"
            }
            // styleClass="bg-gradient-to-r from-blue-100 to-purple-100"
            valueColor={
              parseFloat(collateralRatio) >= 150
                ? "text-green-600"
                : "text-black"
            }
          />
        </div>

        <PoolComponent />
      </div>
    </div>
  );
}
