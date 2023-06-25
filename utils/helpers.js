/* eslint-disable no-compare-neg-zero */
import { ethers } from "ethers";

export const daysLeft = (deadline) => {
  const difference = new Date(deadline).getTime() - Date.now();
  const remainingDays = difference / (1000 * 3600 * 24);

  if (Math.sign(remainingDays.toFixed(0)) === -0) return "Ended";

  return `in ${remainingDays.toFixed(0)} days`;
};

export const calculateBarPercentage = (goal, raisedAmount) => {
  const percentage = Math.round((raisedAmount * 100) / goal);

  return percentage;
};

export const checkIfImage = (url, callback) => {
  const img = new Image();
  img.src = url;

  if (img.complete) callback(true);

  img.onload = () => callback(true);
  img.onerror = () => callback(false);
};

export const parseCampaign = (campaign) => ({
  goal: ethers.utils.formatEther(campaign.campaignGoal.toString()),
  id: campaign.campaignId.toString(),
  image: campaign.imageURL,
  milestoneCount: campaign.milestoneCount.toNumber(),
  milestoneNum: campaign.milestoneNum.toNumber(),
  owner: campaign.projectOwner,
  deadline: campaign.timeline.toNumber(),
  timestamp: campaign.timestamp.toNumber(),
  title: campaign.title,
  status: campaign.status,
  totalDonors: campaign.totalDonors.toNumber(),
  totalFundDonated: ethers.utils.formatEther(
    campaign.totalFundDonated.toString()
  ),
});

export const parseMilestone = (milestone, arr, index) => {
  let allowWithdrawal = false;
  if (index === 0) allowWithdrawal = true;

  if (index !== 0) allowWithdrawal = arr[index - 1].milestoneValidated;

  return {
    milestoneDetails: milestone.milestoneDetails,
    goal: ethers.utils.formatEther(milestone.milestoneGoal.toString()),
    milestoneHash: milestone.milestoneHash,
    milestoneIndex: milestone.milestoneIndex.toNumber(),
    milestoneCID: milestone.milestoneProofCID,
    validated: milestone.milestoneValidated,
    votes: milestone.milestoneVotes.toNumber(),
    timestamp: milestone.timestamp.toNumber(),
    allowWithdrawal,
  };
};

export const formatError = (message) => {
  if (message.includes("user rejected transaction"))
    return "Error: user rejected transaction";
  return message.split(`reason="`)[1]?.split(`", `)[0];
};
