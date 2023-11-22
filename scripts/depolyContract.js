const { ethers } = require("hardhat");
const {EntryPointAddress} = require("./data.js");

async function main() {
  // Get the Contract Factory
  const CoreToken = await ethers.getContractFactory(
    "CoreToken"
  );

  // Deploy the contract
  const txReceipt = await CoreToken.deploy();
  console.log("CoreToken address : ", txReceipt.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
