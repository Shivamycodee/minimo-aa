/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");


const PRIVATE_KEY_POOL =
  "250acaa252c13324faaedf8cac88016950f9c139d050b1c6a86d59c8e8a9db7e"; // Testnet address...

const AA_PRIVATE_KEY =
  "6a694a78c531a1cc2d72848f08481a6ab2aee622a858f7593cb88565da252dc8";


// const URL =
//   "https://polygon-mumbai.g.alchemy.com/v2/MOVV7rp81t6Dl3LqzWxV65ZQso9zaPY5";

const URL =
  "https://api.stackup.sh/v1/node/8d4f475df648de93f011bdaf3a2f856d10d7ffd7abb90cc754d52829a8131fba";

// const URL = "http://localhost:3000/rpc";

// const URL =
//   "https://bundler.biconomy.io/api/v2/80001/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44";

// const URL =
//   "https://polygon-mumbai.g.alchemy.com/v2/S-9nwCGm8ATBWrjqPPFyy_yQrZcB1DUF";

//  const URL =
//    "https://api.pimlico.io/v1/mumbai/rpc?apikey=73686256-528c-49af-b70e-6ad6c80d3f5a";  // ⚠️ only-bundler : no call to main/test chains...

  https: module.exports = {
    solidity: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
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
        gasPrice: 80_000_000_000,
        accounts: [AA_PRIVATE_KEY],
      },
    },
    etherscan: {
      apiKey: "FW53GPR8BA8GY35KZAQ8N16T4X61HQRDA8",
    },
  };
