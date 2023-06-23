import Head from "next/head";
import Script from "next/script";

import "../styles/globals.css";
import { WalletProvider } from "@/context/walletContext";

const MyApp = ({ Component, pageProps }) => (
  <>
    <Head>
      <title>Fund Me</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <WalletProvider>
      <Component {...pageProps} />
    </WalletProvider>
    <Script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.6.5/flowbite.min.js" />
  </>
);

export default MyApp;
