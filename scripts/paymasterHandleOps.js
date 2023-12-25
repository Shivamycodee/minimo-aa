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

//  const rpcUrl =
//    "https://api.stackup.sh/v1/node/8d4f475df648de93f011bdaf3a2f856d10d7ffd7abb90cc754d52829a8131fba";

const rpcUrl =
  "https://api.pimlico.io/v1/mumbai/rpc?apikey=73686256-528c-49af-b70e-6ad6c80d3f5a";



const NONCE = 33;

async function main() {
  const customProvider = new CustomJsonRpcProvider(rpcUrl);
  const [deployer] = await ethers.getSigners();

  const EntryPoint = await ethers.getContractAt(
    "EntryPoint",
    EntryPointAddress
  );

  const userNonce = await EntryPoint.connect(deployer).getNonce(SCAddress, 0); // Get Valid Nonce.
  console.log("userNonce : ", userNonce);

  const PaymasterContract = await ethers.getContractAt(
    "VerifyingPaymaster",
    VerifyingPaymasterAddress
  );

  const opObject = await getUserOperation();
  const timeLimit = getTxTimeLimit();

  // const res = await EntryPoint.connect(deployer).getUserOpHash(opObject);
  const wallet = new ethers.Wallet(
    "6a694a78c531a1cc2d72848f08481a6ab2aee622a858f7593cb88565da252dc8"
  );

  // const signature = await wallet.signMessage(ethers.toBeArray(res));
  // console.log("signature : ", signature);
  // opObject.signature = signature;

  const resP = await PaymasterContract.connect(deployer).getHash(
    opObject,
    timeLimit[0],
    timeLimit[1]
  );

  console.log("resP : ", resP);

  const walletM = new ethers.Wallet(POOL_PRV_KEY);
  const paymasterSignature = await walletM.signMessage(ethers.toBeArray(resP));

  console.log("paymasterSignature : ", paymasterSignature);

  const _paymasterAndData = getPaymasterAndData(
    VerifyingPaymasterAddress,
    paymasterSignature,
    timeLimit
  );

  opObject.paymasterAndData = _paymasterAndData;

  const ares = await EntryPoint.connect(deployer).getUserOpHash(opObject);
  const signatureH = await wallet.signMessage(ethers.toBeArray(ares));
  opObject.signature = signatureH;

  console.log("opObject : ", opObject);

  // const data = await PaymasterContract.connect(deployer).parsePaymasterAndData(_paymasterAndData);
  // console.log("data : ", data[0], data[1], data[2]);

  try {
    // const validation = await PaymasterContract.connect(
    //   deployer
    // ).validatePaymasterUserOpPub(
    //   opObject,
    //   "0x25d65607d953183d526767406da1c9371569ad97570b34dfc0cb2e4d27d218d7",
    //   "0"
    // );
    // console.debug("validation : ", validation);
    const userOpHash = await customProvider.sendUserOperation(
      opObject,
      EntryPointAddress
    );
    console.log("User Operation Hash:", userOpHash);
  } catch (error) {
    console.error("Error sending user operation:", error);
  }

//  await EntryPoint.connect(deployer).handleOps([opObject],VerifyingPaymasterAddress);
//   console.log("tx : ", tx.hash);    
  


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
    paymasterAndData: "0x", 
  };

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
        "bytes"
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
        op.paymasterAndData,
      ]
    )
  );
  const enc = abiCoder.encode(
    ["bytes32", "address", "uint256"],
    [userOpHash, entryPoint, BigInt(chainId)]
  );

  return ethers.keccak256(enc);

};


function getTxTimeLimit() {
  const currentTime = Math.floor(Date.now() / 1000); // mili to sec
  const tenMinutesLater = currentTime;
  return [currentTime + 3600, tenMinutesLater];
}

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
