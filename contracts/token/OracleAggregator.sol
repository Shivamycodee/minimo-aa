// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract OracleAggregator {


  address public owner;
  uint public exchangeRate;


 constructor(){
    owner = msg.sender;
   // Set the exchange rate for 1 CORE = 0.01 MATIC in wei
    exchangeRate = 1e16; // equivalent to 0.01 * 10^18
 }

 modifier onlyOwner() {
    require(msg.sender == owner, "Ownable: caller is not the owner");
    _;
}

    function changeOwner(address _newOwner) public onlyOwner {
        owner = _newOwner;
    }

    function changeExchangeRate(uint _newExchangeRate) public onlyOwner {
        exchangeRate = _newExchangeRate;
    }


 function getTokenValueOfOneNativeToken(address) public view returns(uint256){
    return exchangeRate;
 }


}