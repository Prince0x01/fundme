require("dotenv").config();

const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    // sepolia: {
    //   provider: () => new HDWalletProvider(process.env.PRIVATE_KEY, `https://sepolia.infura.io/v3/${process.env.INFURA_JSONRPC_API}`),
    //   network_id: "11155111",
    //   gas: 50000000, 
    // },
    linea: {
      provider: function () {
        return new HDWalletProvider(process.env.PRIVATE_KEY, `https://linea-goerli.infura.io/v3/${process.env.INFURA_JSONRPC_API}`);
      },
      network_id: "59140",
      gas: 55000000, 
      gasPrice: 310000000,

    },
  },
  compilers: {
    solc: {
      version: "^0.8.0",
      settings: {
        evmVersion: "london"
      }
    },
  },
};
