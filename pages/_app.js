import Head from "next/head";

import { MetaMaskContextProvider } from "@/hooks/useMetaMask";

import "../styles/globals.css";

const MyApp = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Fund Me</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MetaMaskContextProvider>
        <Component {...pageProps} />
      </MetaMaskContextProvider>
    </>
  );
};

export default MyApp;
