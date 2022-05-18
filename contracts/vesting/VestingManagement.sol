pragma solidity ^0.8.0;

import "@openzeppelin/contracts/finance/VestingWallet.sol";
import "./TerminableVestingWallet.sol";

contract VestingManagement {
  mapping(address => VestingWallet[]) public fixedVestingWallets;
  mapping(address => TerminableVestingWallet[]) public terminableVestingWallets;

  constructor() {}

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
    fixedVestingWallets[beneficiaryAddress].push(newVesting);
  }

  function terminateVesting(address beneficiaryAddress, uint256 id) external {
    terminableVestingWallets[beneficiaryAddress][id].terminateVesting();
    delete terminableVestingWallets[beneficiaryAddress][id];
  }

  function releaseTerminable(address token, address beneficiary) external {
    for (uint256 i = 0; i < terminableVestingWallets[beneficiary].length; i++) {
      VestingWallet wallet = terminableVestingWallets[beneficiary][i];
      if (wallet.vestedAmount(token, uint64(block.timestamp)) > 0) {
        wallet.release(token);
      }
    }
  }

  function releaseFixed(address token, address beneficiary) external {
    for (uint256 i = 0; i < fixedVestingWallets[beneficiary].length; i++) {
      VestingWallet wallet = fixedVestingWallets[beneficiary][i];
      if (wallet.vestedAmount(token, uint64(block.timestamp)) > 0) {
        wallet.release(token);
      }
    }
  }

  function getTerminableVestingsCount(address beneficiary)
    external
    view
    returns (uint256)
  {
    return terminableVestingWallets[beneficiary].length;
  }

  function getFixedVestingsCount(address beneficiary)
    external
    view
    returns (uint256)
  {
    return fixedVestingWallets[beneficiary].length;
  }

  function totalReleasableFromTerminable(address token, address beneficiary)
    external
    view
    returns (uint256)
  {
    uint256 totalReleasable = 0;
    for (uint256 i = 0; i < terminableVestingWallets[beneficiary].length; i++) {
      totalReleasable +=
        terminableVestingWallets[beneficiary][i].vestedAmount(
          token,
          uint64(block.timestamp)
        ) -
        terminableVestingWallets[beneficiary][i].released(token);
    }
    return totalReleasable;
  }

  function totalReleasableFromFixed(address token, address beneficiary)
    external
    view
    returns (uint256)
  {
    uint256 totalReleasable = 0;
    for (uint256 i = 0; i < fixedVestingWallets[beneficiary].length; i++) {
      totalReleasable +=
        fixedVestingWallets[beneficiary][i].vestedAmount(
          token,
          uint64(block.timestamp)
        ) -
        fixedVestingWallets[beneficiary][i].released(token);
    }
    return totalReleasable;
  }
}
