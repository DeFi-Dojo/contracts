// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./Vesting.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract TeamVesting is Vesting, Ownable{
    uint256 constant MAX_UINT = 2**256 - 1;
    uint256 vestingStoppedTimestamp = MAX_UINT;

    constructor(address beneficiaryAddress) Vesting(beneficiaryAddress)
    {}

    function stopVesting() external onlyOwner
    {
        if(vestingStoppedTimestamp == MAX_UINT)
            vestingStoppedTimestamp = block.timestamp;
    }

    function vestedAmount(address token, uint64 timestamp) public view override returns (uint256)
    {
        require(timestamp > MIN_TIMESTAMP);
        uint256 endWeek = timestamp / 1 weeks;
        if(vestingStoppedTimestamp < endWeek)
            endWeek = vestingStoppedTimestamp;
        return vestedAmountUntilWeek(endWeek, token);
    }
}
