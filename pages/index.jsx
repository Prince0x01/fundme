import { useEffect, useState } from "react";
import Link from "next/link";
import { Accordion } from "flowbite-react";
import { ethers } from "ethers";

import Footer from "@/components/footer";
// import DoveIcon from "@/components/icons/doveicon";
// import EarthIcon from "@/components/icons/earthicon";
// import HandshakeIcon from "@/components/icons/handshakeicon";
// import MissionIcon from "@/components/icons/missionicon";
// import VisionIcon from "@/components/icons/visionicon";
// import VolunteerIcon from "@/components/icons/volunteericon";
import Navbar from "@/components/navbar";
import TypingText from "@/components/TypingText";

import { useMetaMask } from "@/hooks/useMetaMask";
import { calculateBarPercentage, parseCampaign } from "@/utils/helpers";
import { abi, contractAddress } from "@/utils/contract";

const Home = () => {
  const { signer, wallet } = useMetaMask();
  const [campaigns, setCampaigns] = useState([]);
  const [, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      setError(false);
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const activeIds = await contract.getActiveCampaignIds();
        const res = await Promise.all(
          activeIds.map(async (id) => await contract.campaigns(id))
        );
        const parsedCampaigns = res
          .map((item) => parseCampaign(item))
          .sort((a, b) => a.totalDonors - b.totalDonors)
          .slice(0, 4);
        setCampaigns(parsedCampaigns);
      } catch (error) {
        setError(error.message);
      }
      setLoading(false);
    };
    fetchCampaigns();
    return () => {};
  }, [signer]);

  return (
    <>
      {/* Nav and Hero Section */}
      <div className="bg-[url('/hero.webp')] h-[600px] bg-no-repeat bg-cover bg-center flex relative">
        <Navbar />

        <div className="flex-1 bg-[#233989e6] clip-fund"></div>
        <div className="flex-1"></div>

        <div className="absolute inset-0 m-auto capitalize text-white text-center max-w-[650px] flex items-center justify-center p-4">
          <div>
            <h4 className="text-xl font-semibold">give hope for homeless</h4>
            <h1 className="text-3xl lg:text-5xl lg:leading-tight font-bold mt-2 mb-3 font-playfair">
              Helping each other <br /> can make world better
            </h1>
            <p className="text-base">
              We Seek out world changers and difference makers around the
              globe,and equip them to fulfill their unique purpose.
            </p>
            <button className="bg-white px-4 py-3 rounded-lg text-[#3C4A79] mt-6 text-sm md:text-base">
              <Link href="/campaigns">Donate now</Link>
            </button>
          </div>
        </div>
      </div>

      {/* Start Campaign Section */}
      <section className="relative flex overflow-hidden rounded-2xl w-11/12 sm:w-3/4 max-w-[800px] mx-auto top-[-100px]">
        <div className="w-1/2 bg-[#ECD7C5] p-4 md:py-8 md:px-6 flex items-start justify-center flex-col">
          <h3 className="text-xl md:text-2xl font-extrabold font-playfair">
            Start a Campaign
          </h3>
          <p className="mt-2 mb-4 text-sm md:text-base">
            Create a campaign topic of your choice and let donators support you
            and let you achieve your goal
          </p>
          <button className="bg-white px-2 md:px-4 py-3 rounded-lg text-[#3C4A79] text-sm md:text-base">
            <Link href={"/create"}>Create Campaign</Link>
          </button>
        </div>
        <div className="w-1/2 flex items-center justify-center">
          <img src="/background.webp" alt="" className="w-full h-full" />
        </div>
      </section>

      {/* Make a Difference Section */}
      {/* <section className="w-11/12 xl:w-4/5 max-w-7xl mx-auto flex gap-4 my-8 lg:mb-12">
        <div className="flex-1">
          <div className="w-11/12">
            <TypingText title="Welcome to Fund me" textStyles="font-semibold" />
            <h3 className="text-2xl lg:text-3xl my-2 md:my-3 font-bold font-playfair">
              Let Us Come Together <br />
              To Make a Difference
            </h3>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
            <div className="flex gap-4 my-3 md:my-6">
              <div className="flex-1 bg-[#E0E7FF] rounded-md p-3">
                <div className="flex gap-4 my-1 md:my-2">
                  <MissionIcon />
                  <p>Our Mission</p>
                </div>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
              </div>
              <div className="flex-1 bg-[#E0E7FF] rounded-md p-3">
                <div className="flex gap-4 my-1 md:my-2">
                  <VisionIcon />
                  <p>Our Vision</p>
                </div>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
              </div>
            </div>
            <button className="bg-[#3C4A79] px-4 py-3 rounded-lg text-white">
              Read More
            </button>
          </div>
        </div>
        <div className="hidden sm:flex flex-1 relative max-h-[450px] rounded-2xl border-2 rounded-br-xl border-solid border-[#8C96B6] bg-[#8C96B6] p-2 md:p-4">
          <img src="/grass.webp" alt="" className="w-full h-full rounded-2xl" />
        </div>
      </section> */}

      {/* Popular Campaigns Section */}
      <section className="w-11/12 xl:w-4/5 max-w-7xl mx-auto">
        <TypingText
          title="Popular Campaigns"
          textStyles="text-2xl lg:text-3xl font-bold font-playfair"
        />

        {!signer ? (
          <div className="w-11/12 xl:w-4/5 max-w-7xl mx-auto my-8 flex flex-col items-center justify-center gap-3">
            <h2 className="font-bold text-2xl">
              Please connect your wallet to see campaigns.
            </h2>
          </div>
        ) : error ? (
          <div className="w-11/12 xl:w-4/5 max-w-7xl mx-auto my-8 flex flex-col items-center justify-center gap-3">
            <h2 className="font-bold text-2xl">
              An error occurred. Please try again.
            </h2>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="w-11/12 xl:w-4/5 max-w-7xl mx-auto my-8 flex flex-col items-center justify-center gap-3">
            <h2 className="font-bold text-2xl">No campaigns currently.</h2>
          </div>
        ) : (
          <>
            <div className="flex gap-4 mt-6 mb-4 py-4 px-2 overflow-x-scroll 2xl:overflow-hidden">
              {campaigns.map((c) => {
                const percentageRaised = calculateBarPercentage(
                  c.goal,
                  c.totalFundDonated
                );

                return (
                  <Link href={`/campaign/${c.id}`} key={c.id}>
                    <div className="shadow-[0px_10px_25px_rgba(37,42,52,0.08)] rounded-xl bg-white min-w-[250px] max-w-[320px]">
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
                            <p>{percentageRaised}%</p>
                          </div>
                          <div className="rounded-sm overflow-hidden bg-[#B9BFD3] mb-1">
                            <div
                              className={`${
                                percentageRaised > 0
                                  ? `$w-[${percentageRaised}%]`
                                  : ""
                              } h-1 bg-[#B9BFD3]`}
                            ></div>
                          </div>
                          <div className="flex justify-between">
                            <p>Raised: {c.totalFundDonated}ETH</p>
                            <p>Goal: {c.goal}ETH</p>
                          </div>
                        </div>
                        <button className="bg-[#3C4A79] px-3 py-2 rounded-lg text-white text-sm">
                          {c.owner === wallet.accounts[0]
                            ? "View Campaign"
                            : "Donate Now"}
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="text-right">
              <Link href={"/campaigns"}>View all</Link>
            </div>
          </>
        )}
      </section>

      {/* Stats Section */}
      {/* <section className="w-11/12 xl:w-4/5 max-w-7xl mx-auto my-8">
        <h3 className="text-2xl lg:text-3xl font-bold font-playfair">
          We Believe that We can Save <br />
          More Lifes with you
        </h3>

        <div className="flex gap-4 mt-6 mb-4 py-4 overflow-x-scroll lg:overflow-hidden">
          <div className="rounded-md flex-1 bg-[#E0E7FF] flex flex-col justify-center items-center p-6 min-w-[220px]">
            <HandshakeIcon />
            <h3 className="mt-4 mb-2 text-2xl lg:text-3xl font-bold">4597+</h3>
            <p className="font-semibold">People Raised</p>
          </div>

          <div className="rounded-md flex-1 bg-[#E0E7FF] flex flex-col justify-center items-center p-6 min-w-[220px]">
            <VolunteerIcon />
            <h3 className="mt-4 mb-2 text-2xl lg:text-3xl font-bold">4597+</h3>
            <p className="font-semibold">People Raised</p>
          </div>

          <div className="rounded-md flex-1 bg-[#E0E7FF] flex flex-col justify-center items-center p-6 min-w-[220px]">
            <DoveIcon />
            <h3 className="mt-4 mb-2 text-2xl lg:text-3xl font-bold">4597+</h3>
            <p className="font-semibold">People Raised</p>
          </div>

          <div className="rounded-md flex-1 bg-[#E0E7FF] flex flex-col justify-center items-center p-6 min-w-[220px]">
            <EarthIcon />
            <h3 className="mt-4 mb-2 text-2xl lg:text-3xl font-bold">4597+</h3>
            <p className="font-semibold">People Raised</p>
          </div>
        </div>
      </section> */}

      {/* FAQ Section */}
      <section className="w-11/12 xl:w-4/5 max-w-7xl mx-auto">
        <TypingText
          title="FAQs"
          textStyles="text-2xl lg:text-3xl font-bold font-playfair mb-5"
        />

        <Accordion>
          <Accordion.Panel>
            <Accordion.Title>What is Fund ME?</Accordion.Title>
            <Accordion.Content>
              <p className="mb-2 text-gray-500 dark:text-gray-400">Fund me</p>
            </Accordion.Content>
          </Accordion.Panel>
          <Accordion.Panel>
            <Accordion.Title>What is Fund ME?</Accordion.Title>
            <Accordion.Content>
              <p className="mb-2 text-gray-500 dark:text-gray-400">Fund me</p>
            </Accordion.Content>
          </Accordion.Panel>
          <Accordion.Panel>
            <Accordion.Title>What is Fund ME?</Accordion.Title>
            <Accordion.Content>
              <p className="mb-2 text-gray-500 dark:text-gray-400">Fund me</p>
            </Accordion.Content>
          </Accordion.Panel>
        </Accordion>
      </section>

      {/* Footer Section */}
      <Footer />
    </>
  );
};

export default Home;
