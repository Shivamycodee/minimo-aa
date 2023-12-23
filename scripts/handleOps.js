const { ethers } = require("hardhat");
const { JsonRpcProvider } = require("@ethersproject/providers");

const { EntryPointAddress, WalletAddress, SCAddress } = require("./data.js");
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

const NONCE = 27;


async function main() {
  // const rpcUrl =
  //   "https://api.pimlico.io/v1/mumbai/rpc?apikey=73686256-528c-49af-b70e-6ad6c80d3f5a";

  const rpcUrl =
    "https://api.stackup.sh/v1/node/8d4f475df648de93f011bdaf3a2f856d10d7ffd7abb90cc754d52829a8131fba";

  const customProvider = new CustomJsonRpcProvider(rpcUrl);
  const [deployer] = await ethers.getSigners();

  const EntryPoint = await ethers.getContractAt(
    "EntryPoint",
    EntryPointAddress
  );

  const userNonce = await EntryPoint.connect(deployer).getNonce(SCAddress, 0);
  console.log("userNonce : ", userNonce);

  const opObject = await getUserOperation();
  console.log("opObject : ", opObject);

  const res = await EntryPoint.connect(deployer).getUserOpHash(opObject);
  const wallet = new ethers.Wallet(
    "6a694a78c531a1cc2d72848f08481a6ab2aee622a858f7593cb88565da252dc8"
  );
  const signature = await wallet.signMessage(ethers.toBeArray(res));
  console.log("signature : ", signature);
  opObject.signature = signature;

  try {
    const userOpHash = await customProvider.sendUserOperation(
      opObject,
      EntryPointAddress
    );
    console.log("User Operation Hash:", userOpHash);
  } catch (error) {
    console.error("Error sending user operation:", error);
  }

  // await EntryPoint.connect(deployer).handleOps([opObject],SCAddress);
  // console.log("tx : ", tx.hash);
}

const getUserOperation = async () => {
  const [signer] = await ethers.getSigners();

  const tokenIN = "0x8De6DcD5Bd1DeC1e8197FB4E0057498e7207133b";
  const SwapAddress = "0x31A92fCA50F511db28b57185ED6Ae12f565F2762";
  const TokenContract = new ethers.Contract(tokenIN, TokenABI, signer);
  const SwapAllowance = ethers.parseEther("10");

  // initCode: hexConcat([contract.address, factory.interface.encodeFunctionData('createAccount', [await signer.getAddress(), 0])]),
  // factory = contract = simpleAccountFactory

  const minTx = await TokenContract.transfer.populateTransaction(
    SwapAddress,
    SwapAllowance
  );

  const SimpleAccount = await ethers.getContractAt("SimpleAccount", SCAddress);

  console.log("minTx : ", minTx);

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
    paymasterAndData: ethers.hexlify(ethers.toUtf8Bytes("")),
  };

  const hash = await getUserOpHash(userOperation, EntryPointAddress, 80001);

  const wallet = new ethers.Wallet(
    "6a694a78c531a1cc2d72848f08481a6ab2aee622a858f7593cb88565da252dc8"
  );

  // const signature = await wallet.signMessage(EntryPointAddress,ethers.toBeArray(hash));
  const signature = await wallet.signMessage(ethers.toBeArray(hash));
  userOperation.signature = signature;
  return userOperation;
}



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
        "bytes",
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

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


// struct UserOperation {
//     address sender;
//     uint256 nonce;
//     bytes initCode;
//     bytes callData;
//     uint256 callGasLimit; 
//     uint256 verificationGasLimit;
//     uint256 preVerificationGas;
//     uint256 maxFeePerGas;
//     uint256 maxPriorityFeePerGas;
//     bytes paymasterAndData ;
//     bytes signature;
// }


// {
//       sender: "0x3E2341F136005F88323dDdF5BA025c0b9Bb41feF",
//       nonce: 0,
//       initCode: ethers.hexlify(ethers.utils.toUtf8Bytes("")),
//       callData: SwapContract.interface.encodeFunctionData("SwapNovice", [
//         tokenIN,
//         amount,
//         true,
//       ]),
//       callGasLimit: 500000,
//       verificationGasLimit: "73672",
//       preVerificationGas: "73588",
//       maxFeePerGas: "2250000025",
//       maxPriorityFeePerGas: "1500000017",
//       paymasterAndData: ethers.ZeroAddress, // get this from ValidatePayMasterUserOps
//       signature: ethers.hexlify(ethers.utils.toUtf8Bytes("")), // Initialize as empty bytes or with relevant signature
//     };


// const getGasEstimator = async () => {
//   // contract code..

//   const signer = await ethers.getSigners();

//   const tokenIN = "0x8De6DcD5Bd1DeC1e8197FB4E0057498e7207133b";
//   const amount = ethers.parseEther("121");
//   const SwapAddress = "0x31A92fCA50F511db28b57185ED6Ae12f565F2762";
//   const SwapContract = new ethers.Contract(SwapAddress, TokenABI, signer);

//   const callData = SwapContract.interface.encodeFunctionData("SwapNovice", [
//     tokenIN,
//     amount,
//     true, // YING -> YANG
//   ]);

//   // contract code ends..

//   const [deployer] = await ethers.getSigners();

//   const getGasEstimator = await ethers.getContractAt(
//     "GasEstimator",
//     GasEstimatorAddress
//   );

//   const _res = await getGasEstimator
//     .connect(deployer)
//     .estimate(EntryPointAddress, callData);

//   const res = await _res.wait();
//   // console.log("gas res : ", res.gasUsed.toString());
//   console.log("gas res : ", res);
// };