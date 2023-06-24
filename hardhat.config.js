require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
//import dotenv library to access environment variables stored in .env file
// require("dotenv").config();//import dotenv library to access environment variables stored in .env file
// require("dotenv").config();
const fs = require('fs');
const path = require('path');
const acctDataPath = path.join(__dirname, "scripts", "acctData.json");
const acctDataJson = fs.readFileSync(acctDataPath, 'utf-8');
const acctData = JSON.parse(acctDataJson);

const arkhiaJsonRpcRelayTestnet  = `${acctData.ARKHIA_JSON_RPC_URL}/${acctData.ARKHIA_API_KEY}`;
const operatorPrivateKey = acctData.MY_PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hedera",
  networks: {
    hardhat: {
    },
    hedera: {
      url: arkhiaJsonRpcRelayTestnet,
      accounts: [operatorPrivateKey]
    }
  },
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
}
