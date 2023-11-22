const { ethers } = require("hardhat");
const { SimpleAccountFactoryAddress } = require("./data.js");

async function main() {

  const [deployer] = await ethers.getSigners();

  const SimpleAccountFactory = await ethers.getContractAt(
    "SimpleAccountFactory",
    SimpleAccountFactoryAddress
  );

    const res = await SimpleAccountFactory.connect(deployer).createAccount(
      "0x198415B49a518E488beD1Fe78C11bD0EE142FFc2",
      12332
    );

    const output = await res.wait();
    console.log(output);

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
