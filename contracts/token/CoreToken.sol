// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CoreToken is ERC20 {

    address public owner;
  
    constructor() ERC20("CoreToken", "CORE") {
        owner = msg.sender;
        _mint(msg.sender, 1000000000000000000 * 10 ** 18);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner can mint");
        _;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

}
