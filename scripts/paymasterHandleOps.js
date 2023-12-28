const { ethers } = require("hardhat");
const { JsonRpcProvider } = require("@ethersproject/providers");

const {
  EntryPointAddress,
  SCAddress,
  VerifyingPaymasterAddress,
  PayMaster_PRV_KEY,
  POOL_PRV_KEY,
  CoreTokenAddress,
  SimpleAccountFactoryAddress,
  ERC20VerifierAddress,
} = require("./data.js");
const TokenABI = require("./token.json");
const { verifyMessage } = require("ethers");


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



const NONCE = 63;

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

  const wallet = new ethers.Wallet(
    "e8e2094d3bf57de0f568ff1fc97524647f24f0cfc37a058124d998754f60c49e"
  );

  console.log("PRE opObject : ", opObject);

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

  console.log("_paymasterAndData : ", _paymasterAndData);

  opObject.paymasterAndData = _paymasterAndData;

  const ares = await EntryPoint.connect(deployer).getUserOpHash(opObject);
  const signatureH = await wallet.signMessage(ethers.toBeArray(ares));
  opObject.signature = signatureH;

  console.log("opObject : ", opObject);

  // try {
  //   const userOpHash = await customProvider.sendUserOperation(
  //     opObject,
  //     EntryPointAddress
  //   );
  //   console.log("User Operation Hash:", userOpHash);

  // } catch (error) {
  //   console.error("Error sending user operation:", error);
  // }

  const tx = await EntryPoint.connect(deployer).handleOps([opObject], VerifyingPaymasterAddress);
  console.log("tx : ", tx.hash);    

}

const getUserOperation = async () => {
  const [signer] = await ethers.getSigners();

  const tokenIN = "0x8De6DcD5Bd1DeC1e8197FB4E0057498e7207133b";
  // const tokenIN = CoreTokenAddress;
  const SwapAddress = "0x31A92fCA50F511db28b57185ED6Ae12f565F2762";
  const TokenContract = new ethers.Contract(tokenIN, TokenABI, signer);
  const SwapAllowance = ethers.parseEther("10000000000000");

  
  const minTx = await TokenContract.approve.populateTransaction(
    SwapAddress,
    SwapAllowance
    );
    
    const SimpleAccount = await ethers.getContractAt("SimpleAccount", SCAddress);
    
    const userOperation = {
      sender: "0x2a05c8E99cB69711d8abFb53C66188c3cB2c157c",
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
      signature: "0x",
    };
    
    console.log("1")

    const SimpleAccFactoryContract = await ethers.getContractAt(
      "SimpleAccountFactory",
      SimpleAccountFactoryAddress
    );
      

  const _initCode = ethers.concat([
    SimpleAccountFactoryAddress,
    SimpleAccFactoryContract.interface.encodeFunctionData("createAccount", [
      "0xEF90dC3BEf86393cf1bca40e16250A735F7fEF6B",
      0,
    ]),
  ]);

  userOperation.initCode = _initCode;

  return userOperation;
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
