import Head from "next/head";
import { Router } from "next/router";
import { useEffect, useState } from "react";
import { NotificationProvider } from "web3uikit";

import { MetaMaskContextProvider } from "@/hooks/useMetaMask";
import Loader from "@/components/Loader";

import "../styles/globals.css";

const MyApp = ({ Component, pageProps }) => {
  const [isLoading, setIsLoading] = useState(true);

  const removeLoading = () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    removeLoading();
    Router.events.on("routeChangeStart", () => setIsLoading(true));
    Router.events.on("routeChangeComplete", () => removeLoading());
    Router.events.on("routeChangeError", () => removeLoading());
  }, []);
  return (
    <>
      <Head>
        <title>Fund Me</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NotificationProvider>
        <MetaMaskContextProvider>
          {isLoading ? <Loader /> : <Component {...pageProps} />}
        </MetaMaskContextProvider>
      </NotificationProvider>
    </>
  );
};

export default MyApp;
