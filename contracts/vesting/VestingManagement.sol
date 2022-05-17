pragma solidity ^0.8.0;

import "@openzeppelin/contracts/finance/VestingWallet.sol";
import "./TerminableVestingWallet.sol";
import "hardhat/console.sol";

contract VestingManagement {
  mapping(address => VestingWallet[]) public vestingWallets;
  mapping(address => TerminableVestingWallet[]) public terminableVestingWallets;

  constructor() {}

  function addNewFixedVesting(
    address beneficiaryAddress,
    uint64 startTimestamp,
    uint64 durationSeconds
  ) external {
    VestingWallet newVesting = new VestingWallet(
      beneficiaryAddress,
      startTimestamp,
      durationSeconds
    );
    vestingWallets[beneficiaryAddress].push(newVesting);
  }

  function getVestingsCount(address beneficiary)
    external
    view
    returns (uint256)
  {
    return vestingWallets[beneficiary].length;
  }

  function getTerminableVestingsCount(address beneficiary)
    external
    view
    returns (uint256)
  {
    return terminableVestingWallets[beneficiary].length;
  }

  function addNewTerminableVesting(
    address beneficiaryAddress,
    uint64 startTimestamp,
    uint64 durationSeconds
  ) external {
    TerminableVestingWallet newVesting = new TerminableVestingWallet(
      beneficiaryAddress,
      startTimestamp,
      durationSeconds
    );
    terminableVestingWallets[beneficiaryAddress].push(newVesting);
  }

  function terminateVesting(address beneficiaryAddress, uint256 id) external {
    terminableVestingWallets[beneficiaryAddress][id].terminateVesting();
    delete terminableVestingWallets[beneficiaryAddress][id];
  }
}
