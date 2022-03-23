// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./Vesting.sol";
import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract TeamVesting is Vesting, Ownable {
  // solhint-disable-next-line var-name-mixedcase
  uint256 private constant MAX_UINT = 2**256 - 1;
  uint256 private vestingStoppedTimestamp = MAX_UINT;

  constructor(address _beneficiaryAddress) Vesting(_beneficiaryAddress) {}

  function stopVesting() external onlyOwner {
    if (vestingStoppedTimestamp == MAX_UINT)
      // solhint-disable-next-line not-rely-on-time
      vestingStoppedTimestamp = block.timestamp;
  }

  function vestedAmount(address _token, uint64 _timestamp)
    public
    view
    override
    returns (uint256)
  {
    require(_timestamp > MIN_TIMESTAMP, "Vesting start before minimal date");
    uint256 endWeek = _timestamp / 1 weeks;
    if (vestingStoppedTimestamp < _timestamp)
      endWeek = vestingStoppedTimestamp / 1 weeks;
    return vestedAmountUntilWeek(endWeek, _token);
  }
}
