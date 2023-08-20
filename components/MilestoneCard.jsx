import { useEffect, useState } from "react";
import { Card } from "flowbite-react";
import { Spinner } from "flowbite-react";
import { useNotification } from "web3uikit";
import { ethers } from "ethers";

import { useMetaMask } from "@/hooks/useMetaMask";
import { abi, contractAddress } from "@/utils/contract";
import { formatError } from "@/utils/helpers";

const MilestoneCard = ({
  goal,
  milestoneDetails,
  milestoneIndex,
  milestoneHash,
  milestoneCID,
  votes,
  allowWithdrawal,
  requestLoading,
  setRequestLoading,
  campaignId,
  listedAllMilestones,
  campaignOwner,
  hasPledged,
  lastValidated,
  openUploadModal,
  openValidateModal,
  setSelectedMilestone,
  setSelectedImage,
}) => {
  const { signer, provider, wallet } = useMetaMask();
  const dispatch = useNotification();
  const [hasValidated, setHasValidated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPledgeStatus = async () => {
      setLoading(true);
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const res = await contract.milestoneValidatedByHash(
          milestoneHash,
          wallet.accounts[0]
        );
        setHasValidated(res);
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    };
    checkPledgeStatus();
    return () => {};
  }, [milestoneHash, signer, wallet.accounts]);

  const handleNewNotification = (type, message) => {
    dispatch({
      type,
      message,
      title: "Transaction Notification",
      position: "topR",
      icon: "bell",
    });
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setRequestLoading(true);
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const res = await contract.withdraw(campaignId, milestoneHash);
      await provider.waitForTransaction(res.hash, 1, 150000);
      handleNewNotification("info", "Withdraw Successful");
    } catch (error) {
      handleNewNotification("error", formatError(error.message));
    }
    setRequestLoading(false);
  };

  const onClickUpload = () => {
    openUploadModal();
    setSelectedMilestone(milestoneHash);
  };

  const onClickValidate = () => {
    openValidateModal();
    setSelectedMilestone(milestoneHash);
    setSelectedImage(milestoneCID);
  };

  const validCID = !!milestoneCID;
  const isOwner =
    campaignOwner?.toLowerCase() === wallet.accounts[0]?.toLowerCase();

  const canValidate =
    !isOwner && hasPledged && validCID && !loading && !hasValidated;

  const lastValidatedIndex = lastValidated ? lastValidated.milestoneIndex : 0;

  const canUpload =
    listedAllMilestones && milestoneIndex === lastValidatedIndex + 1;

  const canWithdraw =
    listedAllMilestones && (allowWithdrawal || milestoneIndex === 1);

  return (
    <Card>
      <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {milestoneDetails}
      </h5>
      <div className="flex justify-between gap-1">
        <p className="font-normal text-gray-700 dark:text-gray-400">
          {/* Goal: {ethers.utils.formatEther(goal)} */}
          Goal: {goal}
        </p>
        <p className="font-bold text-gray-900 dark:text-white">
          Votes: {votes}
        </p>
      </div>

      <div className="flex items-center justify-between">
        {canValidate && (
          <button
            className="bg-[#3C4A79] px-4 py-2 rounded-lg text-white text-xs md:text-base text-center"
            onClick={onClickValidate}
          >
            {requestLoading ? (
              <Spinner aria-label="Submitting form" size="sm" />
            ) : (
              "Validate Proof"
            )}
          </button>
        )}
        {isOwner && (
          <>
            {canWithdraw && (
              <button
                className="bg-[#3C4A79] px-4 py-2 rounded-lg text-white text-xs md:text-base text-center"
                onClick={handleWithdraw}
              >
                {requestLoading ? (
                  <Spinner aria-label="Submitting form" size="sm" />
                ) : (
                  "Withdraw"
                )}
              </button>
            )}
            {canUpload && (
              <button
                className="bg-[#3C4A79] px-4 py-2 rounded-lg text-white text-xs md:text-base text-center"
                onClick={onClickUpload}
              >
                {requestLoading ? (
                  <Spinner aria-label="Submitting form" size="sm" />
                ) : (
                  "Upload Proof"
                )}
              </button>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default MilestoneCard;
