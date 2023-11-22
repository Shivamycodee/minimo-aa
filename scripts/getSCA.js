const { ethers } = require("hardhat");
const { SimpleAccountFactoryAddress } = require("./data.js");

async function main() {
  const [deployer] = await ethers.getSigners();
  

  const SimpleAccountFactoryContract = await ethers.getContractAt(
    "SimpleAccountFactory",
    SimpleAccountFactoryAddress
  );

  const owner = "0x198415B49a518E488beD1Fe78C11bD0EE142FFc2";
  const salt = 1;

  const address = await SimpleAccountFactoryContract.getAddress(
    owner,
    salt
  );
  console.log("Address: ", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
