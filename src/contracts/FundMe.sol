// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title FundMe
 * @dev A crowdfunding platform that allows users to create and contribute to fundraising campaigns.
 */

contract FundMe {
    using EnumerableSet for EnumerableSet.AddressSet;
    using SafeMath for uint;
     
    // Enumerations
    enum CampaignStatus {ACTIVE, CANCELLED, REFUNDING, PAYING_OUT, RESOLVING_CAMPAIGN_GOAL, CLOSED, TERMINATED}

    // State variables
    address public fundmePlatform;
    uint public transactionFee;
    uint public campaignCount;
    uint public snapshotBalance;

    // Variables
    struct Campaign {
        uint256 campaignId;
        address payable projectOwner;
        string title;
        string imageURL;
        uint campaignGoal;
        uint totalFundDonated;
        uint totalDonors;
        uint milestoneNum;
        uint milestoneCount;
        uint timeline;
        uint timestamp;
        CampaignStatus status;
    } 

    struct Contributor {
        address payable donor;
        uint256 amountDonated;
    }

    // Milestone struct
    struct Milestone {
        bytes32 milestoneHash;
        uint milestoneIndex;
        string milestoneDetails;
        uint256 milestoneGoal;
        bytes32 milestoneProofCID;
        bool milestoneValidated; 
        uint milestoneVotes;  
        uint timestamp;
    }

    constructor(address payable _owner) {
        fundmePlatform = _owner;
    }

    // Mappings
    mapping(uint256 => Campaign) public campaigns;     
    mapping(uint256 => address) public projectOwners;
    mapping(address => Contributor) public donorData;           
    mapping(uint256 => EnumerableSet.AddressSet) internal campaignDonors;
    mapping(uint256 => mapping(address => bool)) public campaignDonorStatus;
    mapping(uint256 => uint256) public campaignBalances;
    mapping(address => bool) public isKYCVerified;
    mapping(bytes32 => Milestone) public milestonesOf;
    mapping(bytes32 => mapping(address => bool)) public milestoneValidatedByHash;

    uint256 internal _campaignId;

    // Function modifiers for access control
    modifier onlyProjectOwner(address projectOwner) {
        require(msg.sender == projectOwner, "Only the owner of the project can call this");
        require(isKYCVerified[projectOwner], "The project owner is not KYC verified");
        _;
    }

    modifier onlyDonors(address donor) {
        require(msg.sender == donor, "Only the donor can call this");
        _;
    }
    
    /**
     * @dev Emitted when a new campaign is created.
     * @param projectOwner The address of the creator of the campaign.
     * @param campaignId The ID of the newly created campaign.
     */
    event CampaignCreated(address indexed projectOwner, uint256 indexed campaignId);
    
    /**
     * @dev Emitted when a campaign is cancelled.
     * @param campaignId The ID of the cancelled campaign.
     */
    event CampaignCancelled(uint256 indexed campaignId);

    /**
     * @dev Emitted when a campaign is closed.
     * @param campaignId The ID of the closed campaign.
     */
    event CampaignClosed(uint256 indexed campaignId);

    /**
     * @dev Emitted when a donor pledges funds to a campaign.
     * @param campaignId The ID of the campaign the funds were pledged to.
     * @param donor The address of the donor.
     * @param amount The amount of funds pledged.
     */
    event PledgedToCampaign(uint indexed campaignId, address indexed donor, uint indexed amount);
    
    /**
     * @dev Emitted when a donor withdraws their pledge from a campaign.
     * @param campaignId The ID of the campaign.
     * @param donor The address of the donor.
     */
    event Unpledged(uint256 indexed campaignId, address indexed donor);

    /**
     * @dev Emitted when a campaign is refunded.
     * @param campaignId The ID of the refunded campaign.
     * @param donor The address of the donor.
     * @param amount The amount of funds refunded.
     */
    event Refunded(uint256 indexed campaignId, address indexed donor, uint256 indexed amount);

    /**
     * @dev Emitted when funds are withdrawn from a campaign.
     * @param campaignId The ID of the campaign the funds were withdrawn from.
     * @param ProjectOwner The address of the project owner.
     * @param amount The amount of funds withdrawn.
     */
    event FundsWithdrawn(uint256 indexed campaignId, address indexed ProjectOwner, uint indexed amount);

    /**
     * @dev Emitted when a milestone is created for a specific campaign.
     * @param campaignId The ID of the campaign the milestone was created for.
     * @param milestoneHash The hash of the milestone.
     */
    event MilestoneCreated(uint256 indexed campaignId, bytes32 indexed milestoneHash);

    /**
     * @dev Emitted when a milestone is validated.
     * @param milestoneHash The hash of the milestone.
     */
    event MilestoneValidated(bytes32 milestoneHash);

    /**
    * @dev function to set the KYC status of a user.
    * @param user The address of the user.
    * @param verified The verification status of the user.
    */
    function setKYCVerified(address user, bool verified) external {
        isKYCVerified[user] = verified;
    }

    /**
    * @dev function to create a campaign.
    * @param _title The title of the campaign.
    * @param _imageURL The image URL of the campaign.
    * @param _campaignGoal The goal of the campaign.
    * @param _timeline The timeline of the campaign.
    * @param _milestoneNum The number of milestones for the campaign.
    */
    function createCampaign(
        string memory _title, 
        string memory _imageURL,
        uint _campaignGoal,
        uint _timeline,
        uint _milestoneNum

    ) public returns (bool, uint256 campaignId) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_imageURL).length > 0, "Please insert an imageURL for the Project");
        require(_campaignGoal > 0, "Project Goal should be greater than 0");
        require(_timeline > block.timestamp, "Project should be set in the future");
        require(_milestoneNum >= 4, "Milestones should be at least 4");
        require(isKYCVerified[msg.sender], "You must be KYC verified be you can start a campaign");

        // Generate the campaignId using keccak256
       campaignId = uint256(keccak256(abi.encodePacked(_title, "_", _timeline, "_", msg.sender, "_", block.timestamp)));
       _campaignId = campaignId;

        campaigns[campaignId] = Campaign({
            campaignId: campaignId,
            projectOwner: payable(msg.sender),
            title: _title,
            imageURL: _imageURL,
            campaignGoal: _campaignGoal,
            totalFundDonated: 0,
            totalDonors: 0,
            milestoneNum: _milestoneNum,
            milestoneCount: 0,
            timeline: _timeline,
            timestamp: block.timestamp,
            status: CampaignStatus.ACTIVE
        });

        projectOwners[campaignId] = msg.sender;
        campaignCount = campaignCount.add(1);

        emit CampaignCreated(msg.sender, campaignId);
        return (true, campaignId);
    }

    /**
    * @dev function to cancel a campaign.
    * @param campaignId The ID of the campaign to cancel.
    */
    function cancelCampaign(uint campaignId) public onlyProjectOwner(msg.sender) returns (bool) {
        require(campaigns[campaignId].status == CampaignStatus.ACTIVE, "Campaign is not active");
        
        if (campaignBalances[campaignId] > 0) {
            campaigns[campaignId].status = CampaignStatus.REFUNDING;
            
            // Take a snapshot of the contract balance to use in calculating refunds later
            snapshotBalance = campaignBalances[campaignId];
            return true; // Return early if campaign balance is greater than zero
        }
        
        // If campaign balance is zero or less, proceed with cancellation and deletion
        campaigns[campaignId].status = CampaignStatus.CANCELLED;
        delete campaigns[campaignId];
        delete projectOwners[campaignId];
        campaignCount = campaignCount.sub(1);
        emit CampaignCancelled(campaignId);
        return true;
    }

    /**
    * @dev function to close a campaign.
    * @param campaignId The ID of the campaign to close.
    */
    function closeCampaign(uint campaignId) internal returns (bool) {
        require(campaigns[campaignId].status == CampaignStatus.ACTIVE, "Campaign is not active");
        if (campaigns[campaignId].totalFundDonated >= campaigns[campaignId].campaignGoal && block.timestamp >= campaigns[campaignId].timeline) {
            campaigns[campaignId].status = CampaignStatus.CLOSED;

        }else if (campaigns[campaignId].totalFundDonated < campaigns[campaignId].campaignGoal && block.timestamp >= campaigns[campaignId].timeline) {
            campaigns[campaignId].status = CampaignStatus.RESOLVING_CAMPAIGN_GOAL;
            uint refundingDuration = campaigns[campaignId].timeline.add(604800);

            //if refundingDuration is exceeded and totalFundDonated is greater than 0, set the campaign status to PAYING_OUT
            if (campaigns[campaignId].totalFundDonated > 0) {
                campaigns[campaignId].status = CampaignStatus.PAYING_OUT;
                
            }else if (block.timestamp >= refundingDuration && campaigns[campaignId].totalFundDonated <= 0) {
                // if refundingDuration is exceeded and totalFundDonated is less than or equal to 0, set the campaign status to TERMINATED
                campaigns[campaignId].status = CampaignStatus.TERMINATED;
            }
            
        }
        emit CampaignClosed(campaignId);
        return true;
    }

   // Recieve fallback function receives funds and updates the campaign balances
    receive() external payable {
        campaignBalances[_campaignId] += msg.value;
    }

    /**
    * @dev function to pledge funds to a campaign.
    * @param campaignId The ID of the campaign to pledge funds to.
    * @param amountToDonate The amount of funds to pledge.
    */
    function pledgeToCampaign(uint256 campaignId, uint256 amountToDonate) public payable {
        require(amountToDonate > 0, "Amount should be greater than 0");
        require(msg.sender != campaigns[campaignId].projectOwner, "You cannot donate to your own campaign");
        require(campaigns[campaignId].status == CampaignStatus.ACTIVE || campaigns[campaignId].status == CampaignStatus.RESOLVING_CAMPAIGN_GOAL, "You cannot plegde funds to this campaign at this moment");

        // Transfer the amountToDonate from the msg.sender to the contract and update the balance
        campaignBalances[campaignId] += amountToDonate;

        // Update the campaign's total fund donated
        campaigns[campaignId].totalFundDonated += amountToDonate;
        campaigns[campaignId].totalDonors += 1;

        // Update the contributor's amount donated and the donorAddresses mapping
        donorData[msg.sender] = Contributor({
            donor: payable(msg.sender),
            amountDonated: 0
        });

        donorData[msg.sender].amountDonated += amountToDonate;
        campaignDonors[campaignId].add(msg.sender);

        // Set the campaignDonorStatus mapping to true for this campaign and msg.sender
        campaignDonorStatus[campaignId][msg.sender] = true;
        emit PledgedToCampaign(campaignId, msg.sender, amountToDonate);
    }

    /**
    * @dev function to unpledge funds from a campaign.
    * @param campaignId The ID of the campaign to unpledge funds from.
    */
    function unpledge(uint256 campaignId) public payable onlyDonors(msg.sender) {
        require(campaigns[campaignId].status == CampaignStatus.ACTIVE || campaigns[campaignId].status == CampaignStatus.RESOLVING_CAMPAIGN_GOAL, "You cannot unpledge funds from this campaign at this moment");

        // Check if the donor has made a pledge to this campaign
        require(campaignDonorStatus[campaignId][msg.sender] == true, "You have not donated to this campaign");

        // Find the donor's contribution for this campaign
        uint256 amountToRefund = donorData[msg.sender].amountDonated;
        require(amountToRefund > 0, "You have not donated to this campaign");

        // Refund the donor's contribution for this campaign
        performRefund(campaignId, amountToRefund);
        emit Unpledged(campaignId, msg.sender);
    }
    
    /**
    * @dev function to refund a donor.
    * @param campaignId The ID of the campaign to refund.
    */
    function refundDonor(uint campaignId) public payable onlyDonors(msg.sender) {
        // Check if the campign is still active and the donor has contributed to this campaign
        if (campaigns[campaignId].status == CampaignStatus.ACTIVE || campaigns[campaignId].status == CampaignStatus.RESOLVING_CAMPAIGN_GOAL) {
            require(campaignDonorStatus[campaignId][msg.sender] == true, "This donor has not contributed to this campaign");

            // Get the amount donated by the donor and refund the donor
            uint256 amountToRefund = donorData[msg.sender].amountDonated;
            performRefund(campaignId, amountToRefund);
        } else if (campaigns[campaignId].status == CampaignStatus.CANCELLED || campaigns[campaignId].status == CampaignStatus.REFUNDING || campaigns[campaignId].status == CampaignStatus.RESOLVING_CAMPAIGN_GOAL) {
            require(campaignDonorStatus[campaignId][msg.sender], "This donor has not contributed to this campaign");

            // Calculate the refund amount based on the snapshot balance and percentage of donated funds
            uint256 amountToRefundPercentage = donorData[msg.sender].amountDonated.mul(100).div(campaigns[campaignId].totalFundDonated);
            uint amountToRefund = snapshotBalance.mul(amountToRefundPercentage).div(100);

            // Refund the donor's contribution
            performRefund(campaignId, amountToRefund);
        } else {
            revert("Campaign is not refundable");
        }
    }

    /**
    * @dev function to handle the actual refunding of funds.
    * @param campaignId The ID of the campaign to refund.
    * @param amountToRefund The amount of funds to refund
    */
    function performRefund(uint256 campaignId, uint256 amountToRefund) public payable {
        campaigns[campaignId].totalFundDonated -= amountToRefund;
        campaignBalances[campaignId] -= amountToRefund;
        payable(msg.sender).transfer(amountToRefund);
        donorData[msg.sender].amountDonated = 0;
        campaignDonors[campaignId].remove(msg.sender);
        campaigns[campaignId].totalDonors -= 1;

        // Set the campaignDonorStatus mapping to false for this campaign and donor
        campaignDonorStatus[campaignId][msg.sender] = false;
        emit Refunded(campaignId, msg.sender, amountToRefund);
    }

    /**
    * @dev function to withdraw funds from a campaign.
    * @param campaignId The ID of the campaign to withdraw funds from.
    * @param milestoneHash The hash of the milestone to withdraw funds for
    */
    function withdraw(uint campaignId, bytes32 milestoneHash) external payable onlyProjectOwner(msg.sender) returns (bool) {
        // Make sure the campaign is active and the goal amount has been met
        require(campaigns[campaignId].status == CampaignStatus.CLOSED || campaigns[campaignId].status == CampaignStatus.PAYING_OUT, "You cannot withdraw funds from this campaign at this moment");
        require(campaigns[campaignId].totalFundDonated >= campaigns[campaignId].campaignGoal, "Goal amount has not been met");

        transactionFee = campaigns[campaignId].campaignGoal.mul(5).div(100);

        // Get the milestone information for the specified hash
        require(milestonesOf[milestoneHash].milestoneValidated, "Milestone has not been validated");
        require(milestonesOf[milestoneHash].milestoneVotes.mul(100).div(campaigns[campaignId].totalDonors) >= 60, "Milestone does not have enough votes");
        uint256 milestoneGoal = campaigns[campaignId].campaignGoal.sub(transactionFee).div(campaigns[campaignId].milestoneNum);
        payable(msg.sender).transfer(milestoneGoal);
        payable(fundmePlatform).transfer(transactionFee);

        return true;
    }

    /**
    * @dev function to create a new milestone for a campaign.
    * @param campaignId The ID of the campaign to create a new milestone for.
    * @param _milestoneIndex The index or numbering of the new milestone which is used to order the milestones created.
    * @param _milestoneDetails Description of the milestone
    */
    function createMilestone(
        uint256 campaignId, 
        uint _milestoneIndex, 
        string memory _milestoneDetails
    ) external onlyProjectOwner(msg.sender) returns (bool) {
        require(_milestoneIndex > 0, "Please enter a valid milestone index");
        require(bytes(_milestoneDetails).length > 0, "You have to provide details for the new milestone");
        require(campaigns[campaignId].milestoneCount < campaigns[campaignId].milestoneNum, "You have exceeded the valid number of milestones");
        require(campaigns[campaignId].status == CampaignStatus.ACTIVE, "Campaign is not active");

        bytes32 milestoneHash = keccak256(abi.encodePacked(_milestoneDetails, "_", _milestoneIndex, "_", msg.sender, "_", block.timestamp));
        uint256 milestoneGoal = campaigns[campaignId].campaignGoal.div(campaigns[campaignId].milestoneNum);
        milestoneGoal = milestoneGoal.mul( 10**18 );

        milestonesOf[milestoneHash] = Milestone({
            milestoneHash: milestoneHash,
            milestoneIndex: _milestoneIndex,
            milestoneDetails: _milestoneDetails,
            milestoneGoal: milestoneGoal,
            milestoneProofCID: "",
            milestoneValidated: false,
            milestoneVotes: 0,
            timestamp: block.timestamp
        });

        campaigns[campaignId].milestoneCount++;
        emit MilestoneCreated(campaignId, milestoneHash);
        return true;
    }

    /**
    * @dev function to validate a milestone.
    * @param milestoneHash The hash of the milestone to validate
    * @param milestoneProofCID the milestone proof's content identifier stored on IPFS to validate
    */
    function validateMilestone(bytes32 milestoneHash, bytes32 milestoneProofCID) external onlyDonors(msg.sender) returns (bool) {
        require(milestoneValidatedByHash[milestoneHash][msg.sender] == false, "You have already validated this milestone");
        milestoneValidatedByHash[milestoneHash][msg.sender] = true;
        milestonesOf[milestoneHash].milestoneValidated = true;
        milestonesOf[milestoneHash].milestoneProofCID = milestoneProofCID;
        milestonesOf[milestoneHash].milestoneVotes ++;

        emit MilestoneValidated(milestoneHash);
        return true;
    }

    /**
    * @dev function to get the addresses of the donors in a campaign.
    * @param campaignId The ID of the campaign to get the addresses for.
    */
    function getDonorAddressesInCampaign(uint256 campaignId) public view returns (address[] memory) {
        EnumerableSet.AddressSet storage donors = campaignDonors[campaignId];
        address[] memory addresses = new address[](donors.length());

        for (uint256 i = 0; i < donors.length(); i++) {
            addresses[i] = donors.at(i);
        }

        return addresses;
    }
}