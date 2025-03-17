import "@/styles/globals.css";
import type { AppProps } from "next/app";
import WalletContext from "@/context/WalletContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WalletContext>
      <Component {...pageProps} />
    </WalletContext>
  );
}
