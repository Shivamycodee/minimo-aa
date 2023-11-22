const { ethers } = require("hardhat");
const {EntryPointAddress} = require("./data.js");

async function main() {
  // Get the Contract Factory
  const SimpleAccountFactory = await ethers.getContractFactory(
    "SimpleAccountFactory"
  );

  // Deploy the contract
  const txReceipt = await SimpleAccountFactory.deploy(EntryPointAddress);
  console.log("SimpleAccountFactory address : ", txReceipt.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
