import Head from "next/head";
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";

import "../styles/globals.css";
import { WalletProvider } from "@/context/walletContext";

const MyApp = ({ Component, pageProps }) => (
  <>
    <Head>
      <title>Fund Me</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <MoralisProvider initializeOnMount={false}>
      <NotificationProvider>
        <WalletProvider>
          <Component {...pageProps} />
        </WalletProvider>
      </NotificationProvider>
    </MoralisProvider>
  </>
);

export default MyApp;
