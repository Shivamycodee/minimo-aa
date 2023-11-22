const { ethers } = require("hardhat");
const { SimpleAccountFactoryAddress } = require("./data.js");

async function main() {

  const [deployer] = await ethers.getSigners();

  const SimpleAccountFactory = await ethers.getContractAt(
    "SimpleAccountFactory",
    SimpleAccountFactoryAddress
  );

  // const _res = await SimpleAccountFactory.connect(deployer).createAccount(
  //   "0x198415B49a518E488beD1Fe78C11bD0EE142FFc2",
  //   1
  // );
  // const res = await _res.wait();

  console.log("SimpleAccountFactoryAddress : ", SimpleAccountFactoryAddress);

  const res = await SimpleAccountFactory.connect(deployer).getAddress(
    "0x198415B49a518E488beD1Fe78C11bD0EE142FFc2",
    1
  );
  console.log("res : ",res);

  // const res1 = await SimpleAccountFactory.checkAddress(
  //   "0x198415B49a518E488beD1Fe78C11bD0EE142FFc2",
  //   1
  // );
  //  console.log(res1)

  
  // const res = await SimpleAccountFactory.connect(deployer).createdAccounts(
  //     "0x198415B49a518E488beD1Fe78C11bD0EE142FFc2",
  //     1
  //   );
    
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
