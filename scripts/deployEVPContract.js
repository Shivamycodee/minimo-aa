const { ethers } = require("hardhat");
const {
  EntryPointAddress,
  SAFE_POOL_ADD,
} = require("./data.js");

async function main() {

  // Get the Contract Factory
  const ERC20PaymasterContract = await ethers.getContractFactory("BiconomyTokenPaymaster");

  const txReceipt = await ERC20PaymasterContract.deploy(
    SAFE_POOL_ADD,
    EntryPointAddress,
    SAFE_POOL_ADD
  );
  console.log("VerifyingPaymaster address : ", txReceipt.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


// constructor(
//         IERC20Metadata _token,
//         IEntryPoint _entryPoint,
//         TokenPaymasterConfig memory _tokenPaymasterConfig,
//         OracleHelperConfig memory _oracleHelperConfig,
//         address _owner
// )


    // struct TokenPaymasterConfig {
    //     /// @notice The price markup percentage applied to the token price (1e6 = 100%)
    //     uint256 priceMarkup;

    //     // @notice Exchange tokens to native currency if the EntryPoint balance of this Paymaster falls below this value
    //     // uint256 minEntryPointBalance;

    //     /// @notice Estimated gas cost for refunding tokens after the transaction is completed
    //     uint256 refundPostopCost;

    //     /// @notice Transactions are only valid as long as the cached price is not older than this value
    //     uint256 priceMaxAge;
    // }