const { Client, ContractCreateFlow } = require("@hashgraph/sdk");
const fs = require('fs');
const path = require('path');

const main = async () => {
  const acctDataPath = path.join(__dirname, 'acctData.json');
  const acctDataJson = await fs.promises.readFile(acctDataPath, 'utf-8');
  const acctData = JSON.parse(acctDataJson);

  if (!acctData.MY_ACCOUNT_ID || !acctData.MY_PRIVATE_KEY) {
    throw new Error('Account ID and private key must be present in acctData.json');
  }

  const client = Client.forTestnet();
  client.setOperator(acctData.MY_ACCOUNT_ID, acctData.MY_PRIVATE_KEY);

  const fundMePath = path.join(__dirname, '..', 'src', 'abis', 'FundMe.json');
  const fundMeJson = await fs.promises.readFile(fundMePath, 'utf-8');
  const bytecode = JSON.parse(fundMeJson).bytecode.replace('0x', '');

  const contractCreate = new ContractCreateFlow()
    .setGas(4000000)
    .setBytecode(bytecode);

  const txResponse = contractCreate.execute(client);
  const receipt = (await txResponse).getReceipt(client);
  // const contractId = receipt.getContractId();

  // console.log('Contract ID:');
  // console.log(contractId.toString());

  // console.log('Contract address:');
  // console.log(contractId.toSolidityAddress());

  //Get the new contract ID
  const newContractId = (await receipt).contractId;
  console.log("The new contract ID is " + newContractId);
  console.log(
    "The new contract address",
    "0x" + newContractId.toSolidityAddress()
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
