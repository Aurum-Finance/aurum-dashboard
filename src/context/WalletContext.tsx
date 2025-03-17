import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";

// Default styles for Wallet Modal
import "@solana/wallet-adapter-react-ui/styles.css";

const WalletContext = ({ children }: { children: React.ReactNode }) => {
  // Configure Sonic Testnet endpoint
  // const sonicTestnetEndpoint = "https://api.testnet.sonic.game/";
  // Configure Meteora endpoint
  const meteoraEndpoint = "https://api.devnet.solana.com";

  // Configure supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={meteoraEndpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContext;
