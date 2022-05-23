pragma solidity ^0.8.0;

import "@openzeppelin/contracts/finance/VestingWallet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TerminableVestingWallet is VestingWallet, Ownable {
  uint256 public terminationTimestamp;

  constructor(
    address beneficiaryAddress,
    uint64 startTimestamp,
    uint64 durationSeconds
  )
    VestingWallet(beneficiaryAddress, startTimestamp, durationSeconds)
    Ownable()
  {}

  /**
   * @dev Terminates vesting - stops accruing further assets.
   */
  function terminateVesting() external onlyOwner {
    require(
      block.timestamp < start() + duration(),
      "Vesting is already finished"
    );
    if (block.timestamp < start()) {
      terminationTimestamp = start();
    } else {
      terminationTimestamp = block.timestamp;
    }
  }

  /**
   * @dev Indicates if current vesting is terminated
   * @return true if vesting is terminated
   */
  function isTerminated() public view returns (bool) {
    return terminationTimestamp != 0;
  }

  function _vestingSchedule(uint256 totalAllocation, uint64 timestamp)
    internal
    view
    override
    returns (uint256)
  {
    if (timestamp < start()) {
      return 0;
    } else if (timestamp > start() + duration() && isTerminated() == false) {
      return totalAllocation;
    } else if (isTerminated() == true && timestamp > terminationTimestamp) {
      return (totalAllocation * (terminationTimestamp - start())) / duration();
    } else {
      return (totalAllocation * (timestamp - start())) / duration();
    }
  }
}
