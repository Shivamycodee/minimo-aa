const {ethers} = require("ethers");
const axios = require("axios");
const hardhat = require("hardhat");
const TokenABI = require("./token.json");



const getGasEstimator = async () => {

  const entryPoint = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";

    const EndPoint =
        "https://api.pimlico.io/v1/mumbai/rpc?apikey=73686256-528c-49af-b70e-6ad6c80d3f5a";


    const pimlicoProvider = axios.create({
        baseURL: EndPoint,
    });


  const [signer] = await hardhat.ethers.getSigners();

  const tokenIN = "0x8De6DcD5Bd1DeC1e8197FB4E0057498e7207133b";
  const SwapAddress = "0x31A92fCA50F511db28b57185ED6Ae12f565F2762";
  const TokenContract = new ethers.Contract(tokenIN, TokenABI, signer);
  const SwapAllowance = ethers.parseEther("100");

  const userOperation = {
    sender: "0x3E2341F136005F88323dDdF5BA025c0b9Bb41feF",
    nonce: 11,
    initCode: ethers.hexlify(ethers.toUtf8Bytes("")),
    callData: TokenContract.interface.encodeFunctionData("approve", [
      SwapAddress,
      SwapAllowance,
    ]),
    paymasterAndData: ethers.hexlify(ethers.toUtf8Bytes("")), // get this from ValidatePayMasterUserOps
  };

      const estimationResult = await pimlicoProvider.post("/", {
        method: "eth_estimateUserOperationGas",
        params: [userOperation, entryPoint],
    });
    // id: 1,
    // jsonrpc: "2.0",

//   const estimationResult = await pimlicoProvider.send(
//     "eth_estimateUserOperationGas",
//     [userOperation, entryPoint]
//   );

  console.log("estimationResult : ", estimationResult);
};

getGasEstimator()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

