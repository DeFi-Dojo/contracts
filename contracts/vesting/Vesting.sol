// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/finance/VestingWallet.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Vesting is VestingWallet {
  using SafeERC20 for IERC20;

  struct Vest {
    IERC20 token;
    uint256 startWeek;
    uint256 durationWeeks;
    uint256 amount;
  }
  Vest[] public vests;

  // solhint-disable-next-line var-name-mixedcase
  uint256 internal MIN_TIMESTAMP = 1639246638; // Saturday, December 11, 2021 6:17:18 PM

  constructor(address _beneficiaryAddress)
    VestingWallet(_beneficiaryAddress, 0, 0)
  {}

  function addVest(
    IERC20 _token,
    uint256 _amount,
    uint256 _startTimestamp,
    uint256 _durationWeeks
  ) external virtual {
    require(
      _startTimestamp > MIN_TIMESTAMP,
      "Vesting start before minimal date"
    );
    IERC20(_token).safeTransferFrom(_msgSender(), address(this), _amount);
    uint256 startingWeek = (_startTimestamp / 1 weeks) + 1;
    vests.push(
      Vest({
        token: _token,
        startWeek: startingWeek,
        durationWeeks: _durationWeeks,
        amount: _amount
      })
    );
  }

  function vestedAmountUntilWeek(uint256 _endWeek, address _token)
    internal
    view
    returns (uint256)
  {
    uint256 totalVested = 0;
    for (uint256 i = 0; i < vests.length; i++) {
      if (address(vests[i].token) != _token) continue;
      else if (vests[i].startWeek > _endWeek) continue;
      else if (vests[i].startWeek + vests[i].durationWeeks > _endWeek)
        totalVested +=
          (vests[i].amount * (_endWeek - vests[i].startWeek)) /
          vests[i].durationWeeks;
      else totalVested += vests[i].amount;
    }
    return totalVested;
  }

  function vestedAmount(address _token, uint64 _timestamp)
    public
    view
    virtual
    override
    returns (uint256)
  {
    require(_timestamp > MIN_TIMESTAMP, "Vesting start before minimal date");
    uint256 endWeek = _timestamp / 1 weeks;
    return vestedAmountUntilWeek(endWeek, _token);
  }
}
