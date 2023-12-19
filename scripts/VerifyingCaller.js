const { ethers } = require("hardhat");
const { VerifyingPaymasterAddress } = require("./data.js");

async function main() {
  const [deployer] = await ethers.getSigners();

  const VerifyingPaymaster = await ethers.getContractAt(
    "VerifyingPaymaster",
    VerifyingPaymasterAddress
  );

  console.log("VerifyingPaymasterAddress : ", VerifyingPaymasterAddress);

  const res = await VerifyingPaymaster.getDeposit();
  console.log("res : ", res);


}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// 0x198415B49a518E488beD1Fe78C11bD0EE142FFc2
// 0xE609C9c92F603D4150C5731E75427be2acb33212
// 0x77980e8bb30e10239608504618d83271cd825473
