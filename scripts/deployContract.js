const { ethers } = require("hardhat");
const { EntryPointAddress, VerifyingSigner } = require("./data.js");

async function main() {
  // Get the Contract Factory
  const CoreToken = await ethers.getContractFactory("VerifyingPaymaster");

  // Deploy the contract
  const txReceipt = await CoreToken.deploy(EntryPointAddress, VerifyingSigner);
  console.log("VerifyingPaymaster address : ", txReceipt.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
