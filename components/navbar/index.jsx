import { useEffect, useState } from "react";
import Link from "next/link";
import { useWalletContext } from "@/context/walletContext";

const Navbar = () => {
  const [active, setActive] = useState(false);
  const { hasMetamask, isConnected, connect, address } = useWalletContext();

  const isActive = () => {
    window.scrollY > 90 ? setActive(true) : setActive(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", isActive);
    return () => {
      window.removeEventListener("scroll", isActive);
    };
  }, []);

  return (
    <nav
      className={`${
        active
          ? "bg-white text-black shadow-[0px_10px_25px_rgba(37,42,52,0.08)] border-b border-[#3C4A79]"
          : "bg-white md:bg-transparent text-black md:text-white"
      } fixed w-full z-20 top-0 left-0`}
    >
      <div className="flex flex-wrap items-center justify-between px-4 py-4 w-full md:px-0 md:w-11/12 xl:w-4/5 max-w-7xl mx-auto">
        <div className="text-2xl xs:text-3xl font-playfair">FUND ME</div>
        <div className="flex md:order-2">
          {hasMetamask ? (
            isConnected ? (
              <p className="bg-[#3C4A79] px-4 py-2 rounded-lg text-white mr-2 text-xs md:text-base md:mr-0 flex items-center justify-center">
                {address?.slice(0, 6)}...
                {address?.slice(address?.length - 4)}
              </p>
            ) : (
              <button
                className="bg-[#3C4A79] px-4 py-2 rounded-lg text-white mr-2 text-xs md:text-base md:mr-0"
                onClick={connect}
              >
                Connect
              </button>
            )
          ) : (
            "Please install metamask"
          )}

          <button
            data-collapse-toggle="navbar-sticky"
            type="button"
            className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-sticky"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-6 h-6"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
        <div
          className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
          id="navbar-sticky"
        >
          <ul
            className={`flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-transparent`}
          >
            <li className="py-2 pl-3 pr-4 rounded hover:bg-gray-100 md:hover:bg-transparent md:p-0 ">
              <Link href="/">Home</Link>
            </li>
            <li className="py-2 pl-3 pr-4 rounded hover:bg-gray-100 md:hover:bg-transparent md:p-0 ">
              <Link href="/campaigns">Campaigns</Link>
            </li>
            <li className="py-2 pl-3 pr-4 rounded hover:bg-gray-100 md:hover:bg-transparent md:p-0 ">
              About
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
