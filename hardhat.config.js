/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");


const PRIVATE_KEY_POOL =
  "250acaa252c13324faaedf8cac88016950f9c139d050b1c6a86d59c8e8a9db7e"; // Testnet address...

const URL =
  "https://stylish-practical-dream.matic-testnet.discover.quiknode.pro/8924cf9d4a957d849bf85b1bdd85d78b26e9f398/";

module.exports = {
  solidity: "0.8.20",
  settings: {
    optimizer: {
      enabled: true,
      runs: 2000,
      details: {
        yulDetails: {
          optimizerSteps: "unlimited",
        },
      },
    },
    viaIR: true, 
  },
  networks: {
    mumbai: {
      url: URL,
      gasPrice: 150_000_000_000,
      accounts: [PRIVATE_KEY_POOL],
    },
  },
  etherscan: {
    apiKey: "FW53GPR8BA8GY35KZAQ8N16T4X61HQRDA8",
  },
};
