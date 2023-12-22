// const { ChainId } = require("@biconomy/core-types");
// const {
//     BiconomySmartAccountV2,
//     DEFAULT_ENTRYPOINT_ADDRESS,
// } = require("@biconomy/account");
// const {
//     ECDSAOwnershipValidationModule,
//     DEFAULT_ECDSA_OWNERSHIP_MODULE,
// } = require("@biconomy/modules");
// const { Bundler } = require("@biconomy/bundler");
// const { BiconomyPaymaster } = require("@biconomy/paymaster");



//  const getBiconomy = async () => {

//     const wallet = new ethers.Wallet(
//       "6a694a78c531a1cc2d72848f08481a6ab2aee622a858f7593cb88565da252dc8"
//     ); 

//     const signer = wallet.connect(
//       "https://polygon-mumbai.g.alchemy.com/v2/MOVV7rp81t6Dl3LqzWxV65ZQso9zaPY5"
//     );

//    // create instance of bundler
//    const bundler = new Bundler({
//      bundlerUrl:
//        "https://bundler.biconomy.io/api/v2/80001/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
//      chainId: ChainId.POLYGON_MUMBAI,
//      entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
//    });

//    // create instance of paymaster
//    const paymaster = new BiconomyPaymaster({
//      paymasterUrl:
//        "https://paymaster.biconomy.io/api/v1/80001/IWkftJ7LF.6a4389b9-520a-4bc7-bcce-51714f5d43ef",
//    });

//    // instance of ownership module
//    const ownerShipModule = await ECDSAOwnershipValidationModule.create({
//      signer: signer, // ethers signer object
//      moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE,
//    });

//    const biconomyAccount = await BiconomySmartAccountV2.create({
//      signer: signer, // ethers signer object
//      chainId: ChainId.POLYGON_MUMBAI, //or any chain of your choice
//      bundler: bundler, // instance of bundler
//      paymaster: paymaster, // instance of paymaster
//      entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS, //entry point address for chain
//      defaultValidationModule: ownerShipModule, // either ECDSA or Multi chain to start
//      activeValidationModule: ownerShipModule, // either ECDSA or Multi chain to start
//    });

//    // console.log("biconomy smart account : ",biconomyAccount);

//    const tempAdd = await biconomyAccount.getAccountAddress();
//    setCFAddress(tempAdd);
//    await SCABalanceHandler(tempAdd);
//  };