pragma solidity ^0.8.0;

import "@openzeppelin/contracts/finance/VestingWallet.sol";
import "./TerminableVestingWallet.sol";

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

  function totalReleasableFromFixed(address token, address beneficiary)
    external
    view
    returns (uint256)
  {
    uint256 totalReleasable = 0;
    for (uint256 i = 0; i < vestingWallets[beneficiary].length; i++) {
      totalReleasable +=
        vestingWallets[beneficiary][i].vestedAmount(
          token,
          uint64(block.timestamp)
        ) -
        vestingWallets[beneficiary][i].released(token);
    }
    return totalReleasable;
  }

  function releaseFixed(address token, address beneficiary) external {
    for (uint256 i = 0; i < vestingWallets[beneficiary].length; i++) {
      VestingWallet wallet = vestingWallets[beneficiary][i];
      if (wallet.vestedAmount(token, uint64(block.timestamp)) > 0) {
        wallet.release(token);
      }
    }
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

  function releaseTerminable(address token, address beneficiary) external {
    for (uint256 i = 0; i < terminableVestingWallets[beneficiary].length; i++) {
      VestingWallet wallet = terminableVestingWallets[beneficiary][i];
      if (wallet.vestedAmount(token, uint64(block.timestamp)) > 0) {
        wallet.release(token);
      }
    }
  }
}
