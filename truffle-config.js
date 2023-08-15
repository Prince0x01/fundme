require("dotenv").config();

//const mnemonic = process.env.MNEMONIC;
const apiKey = process.env.INFURA_JSONRPC_API;

const infuraSepoliaApiUrl = 'https://sepolia.infura.io/v3/' + apiKey;
const infuraApiUrl = 'https://linea-goerli.infura.io/v3/' + apiKey;

//const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    sepolia: {
      provider: infuraSepoliaApiUrl,
      network_id: "11155111", // Specify the Sepolia network ID
      gas: 30000000,
      gasPrice: 2500000007,
      from: "0x9099314601c71BA1ce7e2f4dC394fCC0c8704257", // Specify the deployment address for Sepolia
    },
    linea: {
      //provider: () => new HDWalletProvider(mnemonic, infuraApiUrl),
      provider: infuraApiUrl,
      network_id: "59140",
      gas: 30000000,
      gasPrice: 2500000007,
      from: "0x6684EdA107283BDbb5f83dfC0f3FbF7aD377B81A", // Specify the deployment address here
    },
  },
  compilers: {
    solc: {
      version: "^0.8.0",
    },
  },
};
 