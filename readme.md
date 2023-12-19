# Account Abstraction in Hardhat Project

This repository implements the concept of account abstraction in a Hardhat project on the Mumbai network. It utilizes EIP 4337, an Ethereum Improvement Proposal that introduces the concept of account abstraction.

## 🔒🔑💼 Account Abstraction

Account abstraction allows for more flexibility in managing accounts and transactions on the Ethereum network. It enables developers to create custom account types and define their own transaction validation rules. This can be useful for implementing advanced features such as multi-signature wallets or smart contract wallets.

## 🛠️💡 Applying EIP 4337

By applying EIP 4337 in this Hardhat project, you can take advantage of the benefits provided by account abstraction and build more secure and efficient applications on the Mumbai network.

## 🚀🌐 More Information

For more information about EIP 4337 and account abstraction, refer to the Ethereum Improvement Proposal documentation.

## 📚📖 Additional Resources

For more resources on Account Abstraction, you can check out the Awesome Account Abstraction curated list.

## Contributing

Contributions are welcome! Please read the contribution guidelines for information on formatting and writing pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any questions or feedback, please reach out to us at our GitHub Issues page.

## Acknowledgments

This project was inspired by the Blocknative blog post on account abstraction and ERC-4337.





## Final UserOps Structure ( Calling a swap function...)

 userOperation = {

      sender: SCAddress,
      nonce: 0, // random nonce...
      initCode: ethers.hexlify(ethers.utils.toUtf8Bytes("")), // Initialize as empty bytes or with relevant initialization data
      callData: SwapContract.interface.encodeFunctionData("SwapNovice", [
        tokenIN,
        amount,
        true, // YING -> YANG
      ]),
      callGasLimit: 500000, // Set the gas limit for the call (example value)
      verificationGasLimit: "73672", // Set the verification gas limit (example value)
      preVerificationGas: "73588", // Set the pre-verification gas (example value)
      maxFeePerGas: "2250000025", // Set the maximum fee per gas to 100 gwei
      maxPriorityFeePerGas: "1500000017", // Set the maximum priority fee per gas to 0 gwei
      paymasterAndData: ethers.ZeroAddress, // get this from ValidatePayMasterUserOps
      signature: ethers.hexlify(ethers.utils.toUtf8Bytes("")), // Initialize as empty bytes or with relevant signature
    };