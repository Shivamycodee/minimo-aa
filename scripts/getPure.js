const { ethers } = require("hardhat");
const { SimpleAccountFactoryAddress } = require("./data.js");
const ContractABI = require("../artifacts/contracts/utils/SimpleAccountFactory.sol/SimpleAccountFactory.json");


async function main() {

    const signer = await ethers.getSigners();

    console.log("simpeAccountFactoryAddress : ", SimpleAccountFactoryAddress)

    const Contract = new ethers.Contract(
  SimpleAccountFactoryAddress,
  ContractABI.abi,
  signer
);

const res = await Contract.getAddress("0x198415B49a518E488beD1Fe78C11bD0EE142FFc2",1);
 console.log("res : ",res);


}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
