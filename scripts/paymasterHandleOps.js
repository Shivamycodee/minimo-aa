const { ethers } = require("hardhat");
const { JsonRpcProvider } = require("@ethersproject/providers");

const {
  EntryPointAddress,
  SCAddress,
  VerifyingPaymasterAddress,
  PayMaster_PRV_KEY,
  POOL_PRV_KEY,
} = require("./data.js");
const TokenABI = require("./token.json");

function convertBigIntToString(obj) {
  for (const key in obj) {
    if (typeof obj[key] === "bigint") {
      obj[key] = obj[key].toString();
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      convertBigIntToString(obj[key]);
    }
  }
}

class CustomJsonRpcProvider extends JsonRpcProvider {
  async sendUserOperation(userOperation, entryPoint) {
    const method = "eth_sendUserOperation";
    // Convert BigInt to string
    convertBigIntToString(userOperation);
    const params = [userOperation, entryPoint];
    return this.send(method, params);
  }
}

const rpcUrl =
  "https://api.stackup.sh/v1/node/8d4f475df648de93f011bdaf3a2f856d10d7ffd7abb90cc754d52829a8131fba";

const NONCE = 31;

async function main() {
  const customProvider = new CustomJsonRpcProvider(rpcUrl);
  const [deployer] = await ethers.getSigners();

  const EntryPoint = await ethers.getContractAt(
    "EntryPoint",
    EntryPointAddress
  );

  const PaymasterContract = await ethers.getContractAt(
    "VerifyingPaymaster",
    VerifyingPaymasterAddress
  );

  const userNonce = await EntryPoint.connect(deployer).getNonce(SCAddress, 0);
  console.log("userNonce : ", userNonce);

  const opObject = await getUserOperation();

  // const res = await EntryPoint.connect(deployer).getUserOpHash(opObject);
  // const wallet = new ethers.Wallet(
  //   "6a694a78c531a1cc2d72848f08481a6ab2aee622a858f7593cb88565da252dc8"
  // );
  // const signature = await wallet.signMessage(ethers.toBeArray(res));
  // console.log("signature : ", signature);
  // opObject.signature = signature;

  const timeLimit = getTxTimeLimit();
  // const resP = await PaymasterContract.connect(deployer).getHash(
  //   opObject,
  //   timeLimit[0],
  //   timeLimit[1]
  //   );

  //   console.log("resP : ", resP)

  const walletM = new ethers.Wallet(PayMaster_PRV_KEY); //POOL_PRV_KEY
  //     const paymasterSignature = await walletM.signMessage(ethers.toBeArray(resP));
  //     console.log("paymasterSignature : ", paymasterSignature);

  const hash = await getOnlyUserOpHash(opObject);

  
  
  const paymasterSignature = await walletM.signMessage(ethers.toBeArray(hash));
  console.log("paymasterSignature : ", paymasterSignature);
  
  const _paymasterAndData = getPaymasterAndData(
    VerifyingPaymasterAddress,
    paymasterSignature,
    timeLimit
    );
    opObject.paymasterAndData = _paymasterAndData;
    
    console.log("opObject : ", opObject);

  try {
    const userOpHash = await customProvider.sendUserOperation(
      opObject,
      EntryPointAddress
    );
    console.log("User Operation Hash:", userOpHash);
  } catch (error) {
    console.error("Error sending user operation:", error);
  }
}

const getUserOperation = async () => {
  const [signer] = await ethers.getSigners();

  const tokenIN = "0x8De6DcD5Bd1DeC1e8197FB4E0057498e7207133b";
  const SwapAddress = "0x31A92fCA50F511db28b57185ED6Ae12f565F2762";
  const TokenContract = new ethers.Contract(tokenIN, TokenABI, signer);
  const SwapAllowance = ethers.parseEther("10");

  const minTx = await TokenContract.transfer.populateTransaction(
    SwapAddress,
    SwapAllowance
  );

  const SimpleAccount = await ethers.getContractAt("SimpleAccount", SCAddress);

  const userOperation = {
    sender: "0x3E2341F136005F88323dDdF5BA025c0b9Bb41feF",
    nonce: NONCE,
    initCode: ethers.hexlify(ethers.toUtf8Bytes("")),
    callData: SimpleAccount.interface.encodeFunctionData("execute", [
      tokenIN,
      0,
      minTx.data,
    ]),
    callGasLimit: 112489,
    verificationGasLimit: 87538,
    preVerificationGas: 93636,
    maxFeePerGas: 100_000_000_000,
    maxPriorityFeePerGas: 100_000_000_000,
  };
  // paymasterAndData: ethers.hexlify(ethers.toUtf8Bytes("")),

  console.log("partial userOperation : ", userOperation);

  const hash = await getUserOpHash(userOperation, EntryPointAddress, 80001);

  const wallet = new ethers.Wallet(
    "6a694a78c531a1cc2d72848f08481a6ab2aee622a858f7593cb88565da252dc8"
  );

  const signature = await wallet.signMessage(ethers.toBeArray(hash));
  userOperation.signature = signature;
  return userOperation;
};



const getUserOpHash = async (op, entryPoint, chainId) => {
  const abiCoder = new ethers.AbiCoder();
  const userOpHash = ethers.keccak256(
    abiCoder.encode(
      [
        "address",
        "uint256",
        "bytes",
        "bytes",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
      ],
      [
        op.sender,
        op.nonce,
        op.initCode,
        op.callData,
        op.callGasLimit,
        op.verificationGasLimit,
        op.preVerificationGas,
        op.maxFeePerGas,
        op.maxPriorityFeePerGas,
      ]
    )
  );
  const enc = abiCoder.encode(
    ["bytes32", "address", "uint256"],
    [userOpHash, entryPoint, BigInt(chainId)]
  );

  return ethers.keccak256(enc);

};

const getOnlyUserOpHash = async (op) => {
  const abiCoder = new ethers.AbiCoder();
  const userOpHash = ethers.keccak256(
    abiCoder.encode(
      [
        "address",
        "uint256",
        "bytes",
        "bytes",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
      ],
      [
        op.sender,
        op.nonce,
        op.initCode,
        op.callData,
        op.callGasLimit,
        op.verificationGasLimit,
        op.preVerificationGas,
        op.maxFeePerGas,
        op.maxPriorityFeePerGas,
      ]
    )
  );
 
  return userOpHash;
};

function getTxTimeLimit() {
  const currentTime = Math.floor(Date.now() / 1000);
  const tenMinutesLater = currentTime + 600;
  return [currentTime, tenMinutesLater];
}

// function getPaymasterAndData(
//   VerifyingPaymasterAddress,
//   paymasterSignature,
//   timeLimit
// ) {
//   console.log("000");

//   let addressBytes = ethers.toBeArray(VerifyingPaymasterAddress);
//   console.log("addressBytes : ", addressBytes);

//   console.log("111");

//   // Manually pad the strings to fit into a bytes32 type
//   let validUntilBytes = ethers.toBeHex(timeLimit[0], 32);
//   let validAfterBytes = ethers.toBeHex(timeLimit[1], 32);

//   let time = ethers.concat([validUntilBytes, validAfterBytes]);

//   console.log("222");

//   // Convert signature to bytes
//   let signatureBytes = ethers.toBeArray(paymasterSignature);

//   // Concatenate all bytes
//   let paymasterAndData = ethers.concat([
//     addressBytes,
//   time,
//     signatureBytes,
//   ]);

//   console.log("333");
//   // Convert the result to a hex string if needed
//   let paymasterAndDataHex = ethers.hexlify(paymasterAndData);

//   console.log("Simple Paymaster and data: ", paymasterAndData);
//   console.log("Simple Paymaster and data hex: ", paymasterAndDataHex);

//   return paymasterAndData;
// }

function getPaymasterAndData(
  VerifyingPaymasterAddress,
  paymasterSignature,
  timeLimit
) {
  const abiCoder = new ethers.AbiCoder();

  const paymasterAndData = ethers.concat([
    VerifyingPaymasterAddress,
    abiCoder.encode(["uint48", "uint48"], [timeLimit[0], timeLimit[1]]),
    paymasterSignature,
  ]);

  return paymasterAndData;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
