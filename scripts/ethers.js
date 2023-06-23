const { utils, ethers } = require("ethers");
const MyContract = require("./src/abis/contracts/MyContract.json");
const dotenv = require("dotenv");
dotenv.config();

const main = async () => {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.JSON_RPC_RELAY_URL
  );
  const signer = new ethers.Wallet(process.env.ETH_PRIVATE_KEY, provider);
  console.log("Address", signer.address);
  const balance = await provider.getBalance(signer.address);
  console.log("Account balance", ethers.utils.formatEther(balance), "Hbar");

  const code = await provider.getCode(contractAddress);
  console.log("Code", code);

  // const storage = await provider.getStorageAt(signer.address);
  // console.log("Storage", storage);

  const txCount = await provider.getTransactionCount(signer.address);
  console.log("TxCount", txCount);

  const blockNumber = await provider.getBlockNumber();
  console.log("getBlockNumber", blockNumber);

  const blockInfo = await provider.getBlock(blockNumber);
  console.log("blockInfo", blockInfo);

  const gasPrice = await provider.getGasPrice();
  console.log("Estimated gas price", utils.formatUnits(gasPrice, "gwei"));

  const feeData = await provider.getFeeData();
  console.log("feeData", feeData);

  // const factory = new ethers.ContractFactory(
  //   MyContract.abi,
  //   MyContract.bytecode,
  //   signer
  // );
  // const options = {};
  // const contractFactory = await factory.deploy(options);
  // const deployed = await contractFactory.deployed();
  // console.log(`Deployment successful! Contract Address: ${deployed.address}`);
  // console.log(deployed);

  const contract = new ethers.Contract(contractAddress, MyContract.abi, signer);
  contract.on("SetData", (data) => {
    console.log("SetData Event", data);
  });

  let value = await contract.getData();
  console.log("GetData", value.toString());
  let randomNumber = Math.round(Math.random() * 100);
  console.log("SetData", randomNumber);
  const result = await contract.setData(randomNumber);
  const response = await result.wait();
  console.log("Gas Used", response.gasUsed.toString());
  console.log("Transaction hash", response.transactionHash);
  console.log(
    "Block number",
    "https://testnet.mirrornode.hedera.com/api/v1/blocks/" +
      response.blockNumber
  );
  value = await contract.getData();
  console.log("GetData", value.toString());
};

main();