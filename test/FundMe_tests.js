const { expect } = require("chai");
const Web3 = require("web3");
const { deployContract, getContractInstance } = require("@openzeppelin/test-helpers");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Set up Web3 provider
const provider = new Web3.providers.HttpProvider(process.env.INFURA_JSONRPC_API);
const web3 = new Web3(provider);

// Import the compiled contract artifacts
const FundMe = require("../build/contracts/FundMe.json");

describe("FundMe Contract", function () {
  let accounts;
  let fundMe;

  // Deploy the contract before each test
  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    // Deploy the contract
    fundMe = await deployContract(FundMe, [], { from: accounts[0] });
  });

  it("should deploy the contract", async () => {
    expect(fundMe.options.address).to.be.a("string");
  });

  it("should create a new campaign", async () => {
    const campaignTitle = "Test Campaign";
    const imageURL = "https://rotaryabujawuse2.org/wp-content/uploads/2019/05/IMG_20181020_124457_2-1024x768.jpg";
    const campaignGoal = web3.utils.toWei("100", "ether"); // 100 ether
    const timeline = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
    const milestoneNum = 4;
    const verificationProof = "sample_proof";

    // Create a new campaign
    const createTx = await fundMe.methods
      .createCampaign(campaignTitle, imageURL, campaignGoal, timeline, milestoneNum, verificationProof)
      .send({ from: accounts[1] });

    // Get the new campaign ID
    const campaignId = createTx.events.CampaignCreated.returnValues.campaignId;

    // Get the campaign details
    const campaign = await fundMe.methods.campaigns(campaignId).call();

    // Verify the campaign details
    expect(campaign.title).to.equal(campaignTitle);
    expect(campaign.imageURL).to.equal(imageURL);
    expect(campaign.campaignGoal).to.equal(campaignGoal);
    expect(campaign.timeline).to.equal(timeline.toString());
    expect(campaign.milestoneNum).to.equal(milestoneNum.toString());
    expect(campaign.status).to.equal("0"); // CampaignStatus.ACTIVE
  });

  // Add more test cases as needed

});
