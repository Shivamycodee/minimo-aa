// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

interface IOracle {

    /**
     * return amount of tokens that are required to receive that much eth.
     */
    function getTokenValueOfEth(uint256 ethOutput) external view returns (uint256 tokenInput);
    function decimals() external view returns (uint8);

    function latestRoundData()
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    );

}