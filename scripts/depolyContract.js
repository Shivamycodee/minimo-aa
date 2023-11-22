const { ethers } = require("hardhat");

async function main() {
  // Get the Contract Factory
  const SimpleAccountFactory = await ethers.getContractFactory(
    "SimpleAccountFactory"
  );

  // Deploy the contract
  const txReceipt = await SimpleAccountFactory.deploy(
    "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789"
  );
  console.log("SimpleAccountFactory address : ", txReceipt.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
