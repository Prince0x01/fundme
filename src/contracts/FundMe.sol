// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract FundMe {
    using EnumerableSet for EnumerableSet.AddressSet;
    using SafeMath for uint;
     
    // Enumerations
    enum CampaignStatus {ACTIVE, CANCELLED, REFUNDING, REFUNDED, CLOSED}

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

    //create milestone struct
    struct Milestone {
        bytes32 milestoneHash;
        uint256 milestoneGoal;
        bool milestoneValidated; 
        uint milestoneVotes;  
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

    //function modifiers for access control
    modifier onlyProjectOwner(address projectOwner) {
        require(msg.sender == projectOwner, "Only the owner of the project can call this");
        require(isKYCVerified[projectOwner], "The project owner is not KYC verified");
        _;
    }

    modifier onlyDonors(address donor) {
        require(msg.sender == donor, "Only the donor can call this");
        _;
    }
    
    event CampaignCreated(address indexed projectOwner, uint256 indexed campaignId);
    event CampaignCancelled(uint256 indexed campaignId);
    event CampaignClosed(uint256 indexed campaignId);
    event PledgedToCampaign(uint indexed campaignId, address indexed donor, uint indexed amount);
    event Unpledged(uint256 indexed campaignId, address indexed donor);
    event Refunded(uint256 indexed campaignId, address indexed donor, uint256 indexed amount);
    event FundsWithdrawn(uint256 indexed campaignId, address indexed ProjectOwner, uint indexed amount);
    event MilestoneCreated(uint256 indexed campaignId, bytes32 indexed milestoneHash);
    event MilestoneValidated(bytes32 milestoneHash);

    function setKYCVerified(address user, bool verified) external {
        isKYCVerified[user] = verified;
    }

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

    function closeCampaign(uint campaignId) internal returns (bool) {
        require(campaigns[campaignId].status == CampaignStatus.ACTIVE, "Campaign is not active");
        if (campaigns[campaignId].totalFundDonated >= campaigns[campaignId].campaignGoal || block.timestamp >= campaigns[campaignId].timeline) {
            // Set the campaign status to CLOSED
            campaigns[campaignId].status = CampaignStatus.CLOSED;
        }
        emit CampaignClosed(campaignId);
        return true;
    }

   // Functions
    receive() external payable {
        campaignBalances[_campaignId] += msg.value;
    }

    function pledgeToCampaign(uint256 campaignId, uint256 amountToDonate) public payable {
        require(amountToDonate > 0, "Amount should be greater than 0");
        require(msg.sender != campaigns[campaignId].projectOwner, "You cannot donate to your own campaign");
        require(campaigns[campaignId].status == CampaignStatus.ACTIVE, "Campaign is not active");

        // Transfer the amountToDonate from the msg.sender to the contract and update the balance
        campaignBalances[campaignId] += msg.value;

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

    function unpledge(uint256 campaignId) public payable onlyDonors(msg.sender) {
        require(campaigns[campaignId].status == CampaignStatus.ACTIVE, "Campaign is not active");

        // Check if the donor has made a pledge to this campaign
        require(campaignDonorStatus[campaignId][msg.sender] == true, "You have not donated to this campaign");

        // Find the donor's contribution for this campaign
        uint256 amountToRefund = donorData[msg.sender].amountDonated;
        require(amountToRefund > 0, "You have not donated to this campaign");

        // Refund the donor's contribution for this campaign
        performRefund(campaignId, amountToRefund);
        emit Unpledged(campaignId, msg.sender);
    }

    function refundDonor(uint campaignId) public payable onlyDonors(msg.sender) {
        if (campaigns[campaignId].status == CampaignStatus.ACTIVE) {
            require(campaignDonorStatus[campaignId][msg.sender] == true, "This donor has not contributed to this campaign");

            // Refund the donor's contribution
            uint256 amountToRefund = donorData[msg.sender].amountDonated;
            performRefund(campaignId, amountToRefund);
        } else if (campaigns[campaignId].status == CampaignStatus.CANCELLED || campaigns[campaignId].status == CampaignStatus.REFUNDING) {
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

    function withdraw(uint campaignId, bytes32 milestoneHash) external payable onlyProjectOwner(msg.sender) returns (bool) {
        // Make sure the campaign is active and the goal amount has been met
        require(campaigns[campaignId].status == CampaignStatus.ACTIVE, "Campaign is not active");
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

    function createMilestone(
        uint256 campaignId, 
        bytes32 _milestoneHash
    ) external onlyProjectOwner(msg.sender) returns (bool) {
        require(campaigns[campaignId].milestoneCount <= campaigns[campaignId].milestoneNum, "You have exceeded the valid number of milestones");
        require(campaigns[campaignId].status == CampaignStatus.ACTIVE, "Campaign is not active");

        uint256 milestoneGoal = campaigns[campaignId].campaignGoal.div(campaigns[campaignId].milestoneNum);
        milestoneGoal = milestoneGoal.mul( 10**18 );
 
        milestonesOf[_milestoneHash] = Milestone({
            milestoneHash: _milestoneHash,
            milestoneGoal: milestoneGoal,
            milestoneValidated: false,
            milestoneVotes: 0
        });

        campaigns[campaignId].milestoneCount.add(1);

        return true;
    }

    function validateMilestone(bytes32 milestoneHash) external onlyDonors(msg.sender) returns (bool) {
        require(milestoneValidatedByHash[milestoneHash][msg.sender] == false, "You have already validated this milestone");
        milestonesOf[milestoneHash].milestoneValidated = true;
        milestoneValidatedByHash[milestoneHash][msg.sender] = true;
        milestonesOf[milestoneHash].milestoneVotes.add(1);

        return true;
    }  

    function getDonorAddressesInCampaign(uint256 campaignId) public view returns (address[] memory) {
        EnumerableSet.AddressSet storage donors = campaignDonors[campaignId];
        address[] memory addresses = new address[](donors.length());

        for (uint256 i = 0; i < donors.length(); i++) {
            addresses[i] = donors.at(i);
        }

        return addresses;
    }
}
