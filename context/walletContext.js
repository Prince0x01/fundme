import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import { ethers } from "ethers";

const WalletContext = createContext(null);

const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error(
      `useWalletContext can only be used inside a WalletContextProvider`
    );
  }

  return context;
};

const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [hasMetamask, setHasMetamask] = useState(false);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setHasMetamask(true);
    }
  }, []);

  async function connect() {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        setIsConnected(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const address = await provider.listAccounts();
        setAddress(address[0]);
        setSigner(provider.getSigner());
      } catch (e) {
        console.log(e);
      }
    } else {
      setIsConnected(false);
    }
  }

  const value = useMemo(
    () => ({ signer, address, connect, isConnected, hasMetamask }),
    [address, hasMetamask, isConnected, signer]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export { WalletProvider, useWalletContext };
