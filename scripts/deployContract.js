
const { ContractId } = require('@hashgraph/sdk');
const { ethers } = require("hardhat");

const fs = require('fs');
const path = require('path');
const acctDataPath = path.join(__dirname, "acctData.json");
const acctDataJson = fs.readFileSync(acctDataPath, 'utf-8');
const acctData = JSON.parse(acctDataJson);

const arkhiaJsonApiUrl = `${acctData.ARKHIA_JSON_RPC_URL}/${acctData.ARKHIA_API_KEY}`;
const provider = new ethers.providers.JsonRpcProvider(arkhiaJsonApiUrl);
const operatorPrivateKey = acctData.MY_PRIVATE_KEY;

deployContract = async () => {
    try {
        const wallet = new ethers.Wallet(operatorPrivateKey, provider);
        // Key method to interact with the contract/constructor
        const EVM_ADDRESS = acctData.EVM_ADDRESS; // replace with the actual EVM address
        const FundMe = await ethers.getContractFactory('FundMe', wallet);
        const fundme = await FundMe.deploy(EVM_ADDRESS);
        const receipt = await fundme.deployTransaction.wait();

        // Get deployed data
        const contractAddress = receipt.contractAddress;
        const contractID = ContractId.fromSolidityAddress(contractAddress);
        console.log(`Contract ${contractID} successfully deployed to ${contractAddress}`);
        return {contractAddress, contractID};
    } catch(e) {
        console.error(e);
    }
}
