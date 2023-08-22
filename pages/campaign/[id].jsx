import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { Spinner } from "flowbite-react";
import { useNotification } from "web3uikit";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";

import TransactionLoader from "@/components/TransactionLoader";
import Footer from "@/components/footer";
import CalendarIcon from "@/components/icons/calendaricon";
import UserIcon from "@/components/icons/usericon";
import Navbar from "@/components/navbar";
import LoaderComp from "@/components/Loader";
import CreateMilestoneModal from "@/components/CreateMilestoneModal";
import DonateModal from "@/components/DonateModal";
import UploadModal from "@/components/UploadModal";
import ValidateModal from "@/components/ValidateModal";
import MilestoneCard from "@/components/MilestoneCard";

import { useMetaMask } from "@/hooks/useMetaMask";
import { abi, contractAddress } from "@/utils/contract";
import {
  calculateBarPercentage,
  formatError,
  parseCampaign,
  parseMilestone,
} from "@/utils/helpers";
import { changeFileName, createImageUrl, storeFiles } from "@/utils/web3file";
import { sendNotification } from "@/utils";

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);

const CampaignPage = () => {
  const router = useRouter();
  const { signer, provider, wallet } = useMetaMask();
  const [campaign, setCampaign] = useState({});
  const [milestones, setMilestones] = useState([]);
  const [createModal, setCreateModal] = useState(false);
  const [donateModal, setDonateModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [validateModal, setValidateModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [hasPledged, setHasPledged] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const dispatch = useNotification();
  const campaignId = router.query.id;

  useEffect(() => {
    const fetchCampaign = async () => {
      setLoading(true);
      setError("");
      setRequestError("");
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const res = await contract.campaigns(campaignId);
        const milestones = await contract.getMilestoneList(campaignId);
        const mileStonesInfo = await Promise.all(
          milestones.map(async (id) => await contract.milestonesOf(id))
        );
        const parsedMilestones = mileStonesInfo.map((item, index) =>
          parseMilestone(item, mileStonesInfo, index)
        );
        setMilestones(parsedMilestones);
        const parsedCampaign = parseCampaign(res);
        setCampaign(parsedCampaign);

        //check status
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        if (
          parsedCampaign.status === 0 &&
          parsedCampaign.totalFundDonated >= parsedCampaign.goal &&
          currentTime >= parsedCampaign.deadline
        ) {
          const res = await contract.closeCampaign(parsedCampaign.id);
          await provider.waitForTransaction(res.hash, 1, 150000);
        }
      } catch (error) {
        setError(error.message);
      }
      setLoading(false);
    };
    fetchCampaign();
  }, [signer, requestLoading, campaignId]);

  useEffect(() => {
    const checkPledgeStatus = async () => {
      setLoading(true);
      setError("");
      setRequestError("");
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const res = await contract.getDonorAddressesInCampaign(campaignId);
        const lowerCased = res.map((item) => item?.toLowerCase());
        const hasDonated = lowerCased.includes(
          wallet.accounts[0]?.toLowerCase()
        );
        setHasPledged(hasDonated);
      } catch (error) {
        setError(error);
      }
      setLoading(false);
    };
    checkPledgeStatus();
    return () => {};
  }, [campaignId, signer, requestLoading, wallet.accounts]);

  const handleNewNotification = (type, message) => {
    sendNotification(message?.slice(0, 45));
    dispatch({
      type,
      message,
      title: "Transaction Notification",
      position: "topR",
      icon: "bell",
    });
  };

  const percentageRaised = calculateBarPercentage(
    campaign.goal,
    campaign.totalFundDonated
  );

  const onClose = () => {
    setCreateModal(false);
  };

  const onCloseDonateModal = () => {
    setDonateModal(false);
  };

  const openUploadModal = () => {
    setUploadModal(true);
  };

  const onCloseUploadModal = () => {
    setUploadModal(false);
    setSelectedMilestone(null);
  };

  const openValidateModal = () => {
    setValidateModal(true);
  };

  const onCloseValidateModal = () => {
    setValidateModal(false);
    setSelectedMilestone(null);
    setSelectedImage(null);
  };

  const handleUpload = async (image) => {
    setRequestLoading(true);
    setRequestError("");
    try {
      const newFile = changeFileName(image, selectedMilestone);
      const storeRes = await storeFiles([newFile]);

      const imageUrl = createImageUrl(
        storeRes,
        newFile.name.split(".")[0],
        newFile.name.split(".")[1]
      );
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const res = await contract.updateMilestoneProof(
        selectedMilestone,
        imageUrl,
        campaign.id
      );
      await provider.waitForTransaction(res.hash, 1, 150000);
      handleNewNotification("info", "Milestone proof uploaded successfully");
      setUploadModal(false);
    } catch (err) {
      handleNewNotification("error", formatError(err));
      setRequestError(formatError(error));
    }
    setRequestLoading(false);
  };

  const handleCreate = async (description) => {
    setRequestLoading(true);
    setRequestError("");
    try {
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const res = await contract.createMilestone(
        campaignId,
        campaign.milestoneCount + 1,
        description
      );
      await provider.waitForTransaction(res.hash, 1, 150000);
      handleNewNotification("info", "Successfully created milestone");
      setCreateModal(false);
    } catch (error) {
      handleNewNotification("error", formatError(error));
      setRequestError(formatError(error));
    }
    setRequestLoading(false);
  };

  const handleDonate = async (amount) => {
    if (amount < 0)
      return handleNewNotification("error", "Amount cannot be less than 0");

    setRequestLoading(true);
    setRequestError("");
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const res = await contract.pledgeToCampaign(
        campaignId,
        ethers.utils.parseEther(amount)
      );
      await provider.waitForTransaction(res.hash, 1, 150000);
      setDonateModal(false);
      handleNewNotification("info", "Successfully donated");
    } catch (err) {
      handleNewNotification("error", formatError(err));
      setRequestError(formatError(error));
    }
    setRequestLoading(false);
  };

  const handleRefund = async (e) => {
    e.preventDefault();
    setRequestLoading(true);
    setRequestError("");
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const res = await contract.refundDonor(campaignId);
      await provider.waitForTransaction(res.hash, 1, 150000);
      handleNewNotification("info", "Successfully refunded");
    } catch (error) {
      handleNewNotification("error", formatError(error));
      setRequestError(formatError(error));
    }
    setRequestLoading(false);
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    setRequestLoading(true);
    setRequestError("");
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const res = await contract.cancelCampaign(campaignId);
      await provider.waitForTransaction(res.hash, 1, 150000);
      handleNewNotification("info", "Successfully cancelled");
    } catch (error) {
      handleNewNotification("error", formatError(error));
      setRequestError(formatError(error));
    }
    setRequestLoading(false);
  };

  const handleUnpledge = async (e) => {
    e.preventDefault();
    setRequestLoading(true);
    setRequestError("");
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const res = await contract.unpledge(campaignId);
      await provider.waitForTransaction(res.hash, 1, 150000);
      handleNewNotification("info", "Successfully unpledged");
    } catch (error) {
      handleNewNotification("error", formatError(error));
      setRequestError(formatError(error));
    }
    setRequestLoading(false);
  };

  const handleValidate = async (e) => {
    e.preventDefault();
    setRequestLoading(true);
    setRequestError("");
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const res = await contract.validateMilestone(selectedMilestone);
      await provider.waitForTransaction(res.hash, 1, 150000);
      handleNewNotification("info", "Validate successful");
      setValidateModal(false);
    } catch (error) {
      handleNewNotification("error", formatError(error));
      setRequestError(formatError(error));
    }
    setRequestLoading(false);
  };

  const validOwner =
    campaign.owner !== "0x0000000000000000000000000000000000000000";

  const isOwner =
    campaign.owner?.toLowerCase() === wallet.accounts[0]?.toLowerCase();

  const lastValidated = milestones.find((item) => item.validated);

  const campaignActive = campaign.status === 0;

  return (
    <>
      <div className="flex flex-col justify-between min-h-screen">
        {/* Nav and Hero Section */}
        <div className="bg-[url('/hero.webp')] h-[180px] lg:h-[300px] border-red-100 bg-no-repeat bg-cover bg-center flex relative">
          <Navbar />

          <div className="flex-1 bg-[#233989e6] clip-fund"></div>
          <div className="flex-1"></div>
        </div>

        {/* Campaign Section */}
        {loading && <LoaderComp />}

        {requestLoading && <TransactionLoader />}

        {!signer ? (
          <div className="w-11/12 xl:w-4/5 max-w-7xl mx-auto my-8 flex flex-col items-center justify-center gap-3">
            <h2 className="font-bold text-2xl">
              Please connect your wallet to proceed.
            </h2>
          </div>
        ) : error ? (
          <div className="w-11/12 xl:w-4/5 max-w-7xl mx-auto my-8 flex flex-col items-center justify-center gap-3">
            <h2 className="font-bold text-2xl">
              An error occurred. Please try again.
            </h2>
          </div>
        ) : !validOwner ? (
          <div className="w-11/12 xl:w-4/5 max-w-7xl mx-auto my-8 flex flex-col items-center justify-center gap-3">
            <h2 className="font-bold text-2xl">
              Campaign not found. Please check the campaign ID properly.
            </h2>
          </div>
        ) : campaign ? (
          <main className="w-11/12 xl:w-4/5 max-w-7xl mx-auto my-8">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold font-playfair">
              {campaign.title}
            </h1>
            <article className="flex flex-col sm:flex-row gap-4 lg:gap-8 mt-6">
              <div className="flex-[5] lg:pr-8">
                <div className="rounded-md overflow-hidden">
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-[410px] object-cover rounded-xl"
                  />
                </div>
                <div className="flex gap-8 my-4 text-sm">
                  <div className="flex gap-2 items-center">
                    <UserIcon />
                    <p className="text-sm font-bold">
                      {campaign.owner?.slice(0, 6)}...
                      {campaign.owner?.slice(campaign.owner?.length - 6)}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <CalendarIcon />
                    <p>{dayjs(campaign.deadline * 1000).fromNow()}</p>
                  </div>
                </div>

                <h2 className="font-bold text-2xl my-2">Milestones</h2>

                {isOwner &&
                  campaignActive &&
                  campaign.milestoneCount < campaign.milestoneNum && (
                    <h3 className="font-bold text-xl">
                      You have created {campaign.milestoneCount} of&nbsp;
                      {campaign.milestoneNum} milestones. Create all milestones
                      to start receiving donations.
                    </h3>
                  )}

                <div className="flex flex-col gap-2">
                  {!milestones || milestones.length === 0 ? (
                    <p>No milestones added yet</p>
                  ) : (
                    milestones.map((item) => (
                      <MilestoneCard
                        key={item.milestoneIndex}
                        {...item}
                        requestLoading={requestLoading}
                        campaignId={campaignId}
                        campaignOwner={campaign.owner}
                        hasPledged={hasPledged}
                        lastValidated={lastValidated}
                        listedAllMilestones={
                          campaign.milestoneCount === campaign.milestoneNum
                        }
                        openUploadModal={openUploadModal}
                        openValidateModal={openValidateModal}
                        setSelectedImage={setSelectedImage}
                        setRequestLoading={setRequestLoading}
                        setSelectedMilestone={setSelectedMilestone}
                      />
                    ))
                  )}
                </div>

                <>
                  {isOwner &&
                    campaignActive &&
                    campaign.milestoneCount < campaign.milestoneNum && (
                      <div className="flex items-center justify-center my-2">
                        <button
                          className="bg-[#3C4A79] px-4 py-2 rounded-lg text-white text-xs md:text-base text-center"
                          onClick={() => setCreateModal(true)}
                        >
                          Create Milestone
                        </button>
                      </div>
                    )}
                </>
              </div>
              <section className="flex-[3]">
                <aside className="rounded-lg bg-[#E0E7FF] h-max px-4 pt-6 pb-2">
                  <div className="mb-3 text-sm">
                    <div className="flex justify-between">
                      <p>Donations</p>
                      <p>{percentageRaised > 100 ? 100 : percentageRaised}%</p>
                    </div>
                    <div className="rounded-sm overflow-hidden bg-[#B9BFD3] mt-1 mb-2">
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
                      <p>Raised: {campaign.totalFundDonated}ETH</p>
                      <p>Goal: {campaign.goal}ETH</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1 mt-8">
                    {campaign.owner?.toLowerCase() !==
                      wallet.accounts[0]?.toLowerCase() && (
                      <div>
                        {campaign.status === 2 ? (
                          <button
                            className="text-[#3C4A79] px-3 py-2 rounded-lg bg-white text-sm border border-[#3C4A79]"
                            onClick={handleRefund}
                          >
                            {requestLoading ? (
                              <Spinner aria-label="Submitting form" size="sm" />
                            ) : (
                              "Request Refund"
                            )}
                          </button>
                        ) : (
                          <div className="flex gap-3 justify-between w-full">
                            {campaign.totalFundDonated < campaign.goal && (
                              <button
                                className="text-[#3C4A79] px-3 py-2 rounded-lg bg-white text-sm border border-[#3C4A79]"
                                onClick={() => setDonateModal(true)}
                              >
                                {requestLoading ? (
                                  <Spinner
                                    aria-label="Submitting form"
                                    size="sm"
                                  />
                                ) : (
                                  "Donate"
                                )}
                              </button>
                            )}
                            {hasPledged &&
                              (campaign.status === 0 ||
                                campaign.status === 4) && (
                                <button
                                  className="text-[#3C4A79] px-3 py-2 rounded-lg bg-white text-sm border border-[#3C4A79]"
                                  onClick={handleUnpledge}
                                >
                                  {requestLoading ? (
                                    <Spinner
                                      aria-label="Submitting form"
                                      size="sm"
                                    />
                                  ) : (
                                    "Unpledge"
                                  )}
                                </button>
                              )}
                          </div>
                        )}
                      </div>
                    )}

                    {campaign.status !== 2 &&
                      campaign.owner?.toLowerCase() ===
                        wallet.accounts[0]?.toLowerCase() && (
                        <div>
                          <button
                            className="text-[#3C4A79] px-3 py-2 rounded-lg bg-white text-sm border border-[#3C4A79]"
                            onClick={handleCancel}
                          >
                            {requestLoading ? (
                              <Spinner aria-label="Submitting form" size="sm" />
                            ) : (
                              "Cancel Campaign"
                            )}
                          </button>
                        </div>
                      )}

                    <p className="break-all text-red-500 capitalize text-center font-bold">
                      {requestError}
                    </p>
                  </div>
                </aside>
              </section>
            </article>
          </main>
        ) : null}

        {/* Footer Section */}
        <Footer />
      </div>
      {createModal && (
        <CreateMilestoneModal
          isModalOpen={createModal}
          handleSubmit={handleCreate}
          milestoneCount={campaign.milestoneCount}
          onClose={onClose}
          requestLoading={requestLoading}
        />
      )}

      {donateModal && (
        <DonateModal
          isModalOpen={donateModal}
          handleSubmit={handleDonate}
          onClose={onCloseDonateModal}
          requestLoading={requestLoading}
        />
      )}

      {uploadModal && (
        <UploadModal
          isModalOpen={uploadModal}
          handleSubmit={handleUpload}
          onClose={onCloseUploadModal}
          requestLoading={requestLoading}
        />
      )}

      {validateModal && (
        <ValidateModal
          isModalOpen={validateModal}
          selectedImage={selectedImage}
          requestLoading={requestLoading}
          handleSubmit={handleValidate}
          onClose={onCloseValidateModal}
        />
      )}
    </>
  );
};

export default CampaignPage;
