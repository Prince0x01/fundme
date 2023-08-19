import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";

import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";

import { formatBalance } from "../utils";

const defaultSnapOrigin =
  process.env.SNAP_ORIGIN ?? `npm:fundme-snap`;

export const connectSnap = async (snapId = defaultSnapOrigin, params = {}) => {
  await window.ethereum.request({
    method: "wallet_requestSnaps",
    params: {
      [snapId]: params,
    },
  });
};

const disconnectedState = { accounts: [], balance: "", chainId: "" };

const MetaMaskContext = createContext({});

export const MetaMaskContextProvider = ({ children }) => {
  const [hasProvider, setHasProvider] = useState(null);
  const [snap, setSnap] = useState(null);
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const clearError = () => setErrorMessage("");

  const [wallet, setWallet] = useState(disconnectedState);
  // useCallback ensures that we don't uselessly re-create the _updateWallet function on every render
  const _updateWallet = useCallback(async (providedAccounts) => {
    const accounts =
      providedAccounts ||
      (await window.ethereum.request({ method: "eth_accounts" }));

    if (accounts.length === 0) {
      // If there are no accounts, then the user is disconnected
      setWallet(disconnectedState);
      return;
    }

    const balance = formatBalance(
      await window.ethereum.request({
        method: "eth_getBalance",
        params: [accounts[0], "latest"],
      })
    );
    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    setProvider(provider);
    setSigner(provider.getSigner());
    setWallet({ accounts, balance, chainId });
  }, []);

  const updateWalletAndAccounts = useCallback(
    () => _updateWallet(),
    [_updateWallet]
  );
  const updateWallet = useCallback(
    (accounts) => _updateWallet(accounts),
    [_updateWallet]
  );

  /**
   * This logic checks if MetaMask is installed. If it is, then we setup some
   * event handlers to update the wallet state when MetaMask changes. The function
   * returned from useEffect is used as a "clean-up": in there, we remove the event
   * handlers whenever the MetaMaskProvider is unmounted.
   */
  useEffect(() => {
    let provider;
    const getProvider = async () => {
      provider = await detectEthereumProvider({ silent: true });
      const clientVersion = await provider?.request({
        method: "web3_clientVersion",
      });

      const isFlaskDetected = clientVersion?.includes("flask");

      setHasProvider(Boolean(provider && isFlaskDetected));

      if (provider) {
        const snaps = await window.ethereum.request({
          method: "wallet_getSnaps",
        });

        const installedSnap = Object.values(snaps).find(
          (snap) => snap.id === defaultSnapOrigin
        );

        setSnap(installedSnap);
        updateWalletAndAccounts();
        window.ethereum.on("accountsChanged", updateWallet);
        window.ethereum.on("chainChanged", updateWalletAndAccounts);
      }
    };

    getProvider();

    return () => {
      window.ethereum?.removeListener("accountsChanged", updateWallet);
      window.ethereum?.removeListener("chainChanged", updateWalletAndAccounts);
    };
  }, [updateWallet, updateWalletAndAccounts]);

  const connectMetaMask = async () => {
    setIsConnecting(true);

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      clearError();
      updateWallet(accounts);
      await connectSnap();
    } catch (err) {
      setErrorMessage(err.message);
    }
    setIsConnecting(false);
  };

  return (
    <MetaMaskContext.Provider
      value={{
        snap,
        wallet,
        signer,
        provider,
        hasProvider,
        error: !!errorMessage,
        errorMessage,
        isConnecting,
        connectMetaMask,
        clearError,
      }}
    >
      {children}
    </MetaMaskContext.Provider>
  );
};

export const useMetaMask = () => {
  const context = useContext(MetaMaskContext);
  if (context === undefined) {
    throw new Error(
      'useMetaMask must be used within a "MetaMaskContextProvider"'
    );
  }
  return context;
};
