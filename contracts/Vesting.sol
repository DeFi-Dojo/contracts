pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/finance/VestingWallet.sol";

contract Vesting is VestingWallet{
    mapping(IERC20 => mapping(uint256 => uint256)) public vestingWeekValue;
    uint256 MIN_TIMESTAMP = 1639246638;

    constructor(address beneficiaryAddress,
                uint64 startTimestamp,
                uint64 durationWeeks)
    VestingWallet(beneficiaryAddress, startTimestamp, durationWeeks)
    {
    }

    function addVest(IERC20 token, uint256 amount, uint256 startTimestamp, uint256 durationWeeks) external
    {
        require(startTimestamp > MIN_TIMESTAMP);
        bool success = IERC20(token).transferFrom(_msgSender(), address(this), amount);
        require(success);
        uint256 startingWeek = (startTimestamp / 1 weeks) + 1;

        for(uint i = 0; i < durationWeeks; i++)
        {
            vestingWeekValue[token][startingWeek + i] += amount/durationWeeks; // TODO: rounding loss
        }
    }

    function vestedAmount(address token, uint64 timestamp) public view override returns (uint256)
    {
        require(timestamp > MIN_TIMESTAMP);
        uint256 startWeek = MIN_TIMESTAMP / 1 weeks;
        uint256 endWeek = timestamp / 1 weeks;
        uint256 vestedSum = 0;
        for(uint i = startWeek; i < endWeek; i++)
        {
            vestedSum += vestingWeekValue[IERC20(token)][i];
        }
        return vestedSum - released(token);
    }

}
