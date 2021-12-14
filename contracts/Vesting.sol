// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/finance/VestingWallet.sol";

contract Vesting is VestingWallet{
    struct Vest {
        IERC20 token;
        uint256 startWeek;
        uint256 durationWeeks;
        uint256 amount;
    }
    Vest[] public vests;

    uint256 MIN_TIMESTAMP = 1639246638;

    constructor(address beneficiaryAddress)
    VestingWallet(beneficiaryAddress, 0, 0)
    {
    }

    function addVest(IERC20 token, uint256 amount, uint256 startTimestamp, uint256 durationWeeks) public virtual
    {
        require(startTimestamp > MIN_TIMESTAMP);
        bool success = IERC20(token).transferFrom(_msgSender(), address(this), amount);
        require(success);
        uint256 startingWeek = (startTimestamp / 1 weeks) + 1;
        vests.push(Vest({
            token: token,
            startWeek: startingWeek,
            durationWeeks: durationWeeks,
            amount: amount
        }));
    }

    function vestedAmountUntilWeek(uint256 endWeek, address token) internal view returns (uint256)
    {
        uint256 totalVested = 0;
        for(uint i = 0; i < vests.length; i++)
        {
            if(address(vests[i].token) != token)
                continue;
            else if(vests[i].startWeek > endWeek)
                continue;
            else if(vests[i].startWeek + vests[i].durationWeeks > endWeek)
                totalVested += (vests[i].amount*(endWeek - vests[i].startWeek))/vests[i].durationWeeks;
            else totalVested += vests[i].amount;
        }
        return totalVested;
    }

    function vestedAmount(address token, uint64 timestamp) public view virtual override returns (uint256)
    {
        require(timestamp > MIN_TIMESTAMP);
        uint256 endWeek = timestamp / 1 weeks;
        return vestedAmountUntilWeek(endWeek, token);
    }
}
