require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
const fs = require('fs');
const path = require('path');
const acctDataPath = path.join(__dirname, 'acctData.json');
const acctDataJson = fs.readFileSync(acctDataPath, 'utf-8');
const acctData = JSON.parse(acctDataJson);

const arkhiaJsonRpcRelayTestnet  = `${acctData.ARKHIA_JSON_RPC_URL}/${acctData.ARKHIA_API_KEY}`;
const operatorPrivateKey = acctData.MY_PRIVATE_KEY;

module.exports = {
  defaultNetwork: "hedera",
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hedera: {
      url: arkhiaJsonRpcRelayTestnet,
      accounts:  [operatorPrivateKey]  
    }
  },
};

/*==============================================================================================*/
// require("@nomicfoundation/hardhat-toolbox");
// require("@nomiclabs/hardhat-ethers");
// //import dotenv library to access environment variables stored in .env file
// require("dotenv").config();


// /** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   mocha: {
//     timeout: 3600000,
//   },
//   solidity: {
//     version: "0.8.0",
//     settings: {
//       optimizer: {
//         enabled: true,
//         runs: 500,
//       },
//     },
//   },
//   //this specifies which network should be used when running Hardhat tasks
//   defaultNetwork: "hedera",
//   networks: {
//     hedera: {
//       //HashIO testnet endpoint from the TESTNET_ENDPOINT variable in the project .env the file
//       url: process.env.TESTNET_ENDPOINT,
//       //the Hedera testnet account ECDSA private
//       //the public address for the account is derived from the private key
//       accounts: [
//         process.env.TESTNET_OPERATOR_PRIVATE_KEY,
//       ],
//     },
//   },
// };