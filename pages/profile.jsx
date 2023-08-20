import { useEffect, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import Loader from "@/components/Loader";

import { useMetaMask } from "@/hooks/useMetaMask";
import { abi, contractAddress } from "@/utils/contract";
import { calculateBarPercentage, parseCampaign } from "@/utils/helpers";

const Profile = () => {
  const { signer, wallet } = useMetaMask();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      setError("");
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const activeIds = await contract.getActiveCampaignIds();
        const res = await Promise.all(
          activeIds.map(async (id) => await contract.campaigns(id))
        );
        const filteredCampaigns = res
          .filter((campaign) => campaign.projectOwner === wallet.accounts[0])
          .map((item) => parseCampaign(item));
        setCampaigns(filteredCampaigns);
      } catch (error) {
        setError(error.message);
      }
      setLoading(false);
    };
    fetchCampaigns();
    return () => {};
  }, [signer, wallet.accounts]);

  return (
    <div className="flex flex-col justify-between min-h-screen">
      {/* Nav and Hero Section */}
      <div className="bg-[url('/hero.webp')] h-[180px] lg:h-[300px] border-red-100 bg-no-repeat bg-cover bg-center flex relative">
        <Navbar />

        <div className="flex-1 bg-[#233989e6] clip-fund"></div>
        <div className="flex-1"></div>

        <div className="absolute inset-0 m-auto capitalize text-white text-center max-w-[600px] flex items-end justify-center p-4">
          <div>
            <h1 className="text-3xl lg:text-5xl lg:leading-tight font-bold mt-2 mb-3 font-playfair">
              My Campaigns
            </h1>
          </div>
        </div>
      </div>

      {/* Campaigns Section */}

      {loading && <Loader />}

      {!signer ? (
        <div className="w-11/12 xl:w-4/5 max-w-7xl mx-auto my-8 flex flex-col items-center justify-center gap-3">
          <h2 className="font-bold text-2xl">
            Please connect your wallet to proceed
          </h2>
        </div>
      ) : error ? (
        <div className="w-11/12 xl:w-4/5 max-w-7xl mx-auto my-8 flex flex-col items-center justify-center gap-3">
          <h2 className="font-bold text-2xl">
            An error occurred. Please try again
          </h2>
        </div>
      ) : (
        <>
          {!campaigns || campaigns.length === 0 ? (
            <div className="w-11/12 xl:w-4/5 max-w-7xl mx-auto my-8 flex flex-col items-center justify-center gap-3">
              <h2 className="font-bold text-2xl">
                You currently do not have an active campaign
              </h2>
              <button className="bg-[#3C4A79] px-4 py-2 rounded-lg text-white mr-2 text-xs md:text-base md:mr-0">
                <Link href={"/create"}>Create Campaign</Link>
              </button>
            </div>
          ) : (
            <section className="w-11/12 xl:w-4/5 max-w-7xl mx-auto my-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((c) => {
                const percentageRaised = calculateBarPercentage(
                  c.goal,
                  c.totalFundDonated
                );

                return (
                  <Link href={`/campaign/${c.id}`} key={c.id}>
                    <div className="shadow-[0px_10px_25px_rgba(37,42,52,0.08)] rounded-xl bg-white min-w-[220px]">
                      <div>
                        <img
                          src={c.image}
                          alt={c.title}
                          className="w-full h-[410px] object-cover rounded-xl"
                        />
                      </div>
                      <div className="p-2">
                        <h3 className="my-2 xl:text-lg font-bold font-playfair">
                          {c.title}
                        </h3>
                        <p className="text-sm font-bold">
                          {c.owner?.slice(0, 10)}...
                          {c.owner?.slice(c.owner?.length - 6)}
                        </p>
                        <div className="my-3 text-sm">
                          <div className="flex justify-between">
                            <p>Donations</p>
                            <p>
                              {percentageRaised > 100 ? 100 : percentageRaised}%
                            </p>
                          </div>
                          <div className="rounded-sm overflow-hidden bg-[#B9BFD3] mb-1">
                            <div
                              className={`h-1 bg-[#3C4A79]`}
                              style={{
                                width: `${
                                  percentageRaised > 100
                                    ? `${100}%`
                                    : percentageRaised > 0
                                    ? `${percentageRaised}%`
                                    : "0"
                                }`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between">
                            <p>Raised: {c.totalFundDonated}ETH</p>
                            <p>Goal: {c.goal}ETH</p>
                          </div>
                        </div>
                        <button className="bg-[#3C4A79] px-3 py-2 rounded-lg text-white text-sm">
                          View Campaign
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </section>
          )}
        </>
      )}

      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default Profile;
