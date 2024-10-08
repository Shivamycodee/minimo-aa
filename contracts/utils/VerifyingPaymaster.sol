// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

/* solhint-disable reason-string */
/* solhint-disable no-inline-assembly */

import "../core/BasePaymaster.sol";
import "../core/UserOperationLib.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * A sample paymaster that uses external service to decide whether to pay for the UserOp.
 * The paymaster trusts an external signer to sign the transaction.
 * The calling user must pass the UserOp to that external signer first, which performs
 * whatever off-chain verification before signing the UserOp.
 * Note that this signature is NOT a replacement for the account-specific signature:
 * - the paymaster checks a signature to agree to PAY for GAS.
 * - the account checks a signature to prove identity and account ownership.
 */
 
contract VerifyingPaymaster is BasePaymaster {

    using ECDSA for bytes32;
    using UserOperationLib for UserOperation;

    address public Admin;

    modifier onlyAdmin() {
        require(msg.sender == Admin, "only admin");
        _;
    }

    address public verifyingSigner;

    uint256 private constant VALID_TIMESTAMP_OFFSET = 20;

    uint256 private constant SIGNATURE_OFFSET = 84;

    constructor(IEntryPoint _entryPoint, address _verifyingSigner) BasePaymaster(_entryPoint) {
        verifyingSigner = _verifyingSigner;
        Admin = msg.sender;
    }

    function ChangeAdmin(address _newAdmin) public onlyAdmin {
        Admin = _newAdmin;
    }

    /**
     * return the hash we're going to sign off-chain (and validate on-chain)
     * this method is called by the off-chain service, to sign the request.
     * it is called on-chain from the validatePaymasterUserOp, to validate the signature.
     * note that this signature covers all fields of the UserOperation, except the "paymasterAndData",
     * which will carry the signature itself.
     */

    function getHash(UserOperation calldata userOp, uint48 validUntil, uint48 validAfter)
    public view returns (bytes32) {
        return keccak256(abi.encodePacked(
            getPartialHash(userOp, validUntil, validAfter),
            block.chainid,
            address(this)
        ));
}

function getPartialHash(UserOperation calldata userOp, uint48 validUntil, uint48 validAfter)
    internal pure returns (bytes memory) {
        address sender = userOp.getSender();
        return abi.encode(
            sender,
            userOp.nonce,
            keccak256(userOp.initCode),
            keccak256(userOp.callData),
            userOp.callGasLimit,
            userOp.verificationGasLimit,
            userOp.preVerificationGas,
            userOp.maxFeePerGas,
            userOp.maxPriorityFeePerGas,
            validUntil,
            validAfter
        );
}


    /**
     * verify our external signer signed this request.
     * the "paymasterAndData" is expected to be the paymaster and a signature over the entire request params
     * paymasterAndData[:20] : address(this)
     * paymasterAndData[20:84] : abi.encode(validUntil, validAfter)
     * paymasterAndData[84:] : signature
     */

    function _validatePaymasterUserOp(UserOperation calldata userOp, bytes32 /*userOpHash*/, uint256 requiredPreFund)
    internal view override returns (bytes memory context, uint256 vcalidationData) {
        (requiredPreFund);

        (uint48 validUntil, uint48 validAfter, bytes calldata signature) = parsePaymasterAndData(userOp.paymasterAndData);
        //ECDSA library supports both 64 and 65-byte long signatures.
        // we only "require" it here so that the revert reason on invalid signature will be of "VerifyingPaymaster", and not "ECDSA"
        require(signature.length == 64 || signature.length == 65, "VerifyingPaymaster: invalid signature length in paymasterAndData");
        bytes32 hash = MessageHashUtils.toEthSignedMessageHash(getHash(userOp, validUntil, validAfter));

        //don't revert on signature failure: return SIG_VALIDATION_FAILED
        if (verifyingSigner != ECDSA.recover(hash, signature)) {
            return ("",_packValidationData(true,validUntil,validAfter));
        }

        //no need for other on-chain validation: entire UserOp should have been checked
        // by the external service prior to signing it.
        return ("",_packValidationData(false,validUntil,validAfter));
    }

    function validatePaymasterUserOpPub(UserOperation calldata userOp, bytes32 /*userOpHash*/, uint256 requiredPreFund)
    external view returns (bytes memory context, uint256 vcalidationData) {
        (requiredPreFund);

        (uint48 validUntil, uint48 validAfter, bytes calldata signature) = parsePaymasterAndData(userOp.paymasterAndData);
        //ECDSA library supports both 64 and 65-byte long signatures.
        // we only "require" it here so that the revert reason on invalid signature will be of "VerifyingPaymaster", and not "ECDSA"
        require(signature.length == 64 || signature.length == 65, "VerifyingPaymaster: invalid signature length in paymasterAndData");
        bytes32 hash = MessageHashUtils.toEthSignedMessageHash(getHash(userOp, validUntil, validAfter));

        //don't revert on signature failure: return SIG_VALIDATION_FAILED
        require(verifyingSigner == ECDSA.recover(hash, signature), "err sig");

        //no need for other on-chain validation: entire UserOp should have been checked
        // by the external service prior to signing it.
        return ("",_packValidationData(false,validUntil,validAfter));
    }

    function parsePaymasterAndData(bytes calldata paymasterAndData) public pure returns(uint48 validUntil, uint48 validAfter, bytes calldata signature) {
        (validUntil, validAfter) = abi.decode(paymasterAndData[VALID_TIMESTAMP_OFFSET:SIGNATURE_OFFSET],(uint48, uint48));
        signature = paymasterAndData[SIGNATURE_OFFSET:];
    }


    function withdrawBalance() external onlyAdmin {
        payable(msg.sender).transfer(address(this).balance);
    }


    receive() external payable {}

    
    
}