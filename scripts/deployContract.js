const { ethers } = require("hardhat");
const { EntryPointAddress, VerifyingSigner } = require("./data.js");

async function main() {
  // Get the Contract Factory
  // const CoreToken = await ethers.getContractFactory("VerifyingPaymaster");

  const OracleContract = await ethers.getContractFactory("OracleAggregator");

  // Deploy the contract
  const txReceipt = await OracleContract.deploy();
  console.log("OracleAggregator address : ", txReceipt.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
