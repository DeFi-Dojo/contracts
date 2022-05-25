pragma solidity ^0.8.0;

import "@openzeppelin/contracts/finance/VestingWallet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./TerminableVestingWallet.sol";

contract VestingManagement is Ownable {
  mapping(address => VestingWallet[]) public fixedVestingWallets;
  mapping(address => TerminableVestingWallet[]) public terminableVestingWallets;

  constructor() {}

  /**
   * @dev Adds new vesting schedule for beneficiary. Vesting may be terminated by admin.
   * @param beneficiaryAddress Address to which payout may be done
   * @param startTimestamp Timestamp at which accruing value begins
   * @param durationSeconds Duration of linear vesting after which all value will be claimable or claimed
   */
  function addNewTerminableVesting(
    address beneficiaryAddress,
    uint64 startTimestamp,
    uint64 durationSeconds
  ) external onlyOwner {
    TerminableVestingWallet newVesting = new TerminableVestingWallet(
      beneficiaryAddress,
      startTimestamp,
      durationSeconds
    );
    terminableVestingWallets[beneficiaryAddress].push(newVesting);
  }

  /**
   * @dev Adds new vesting schedule for beneficiary. Vesting may not be terminated.
   * @param beneficiaryAddress Address to which payout may be done
   * @param startTimestamp Timestamp at which accruing value begins
   * @param durationSeconds Duration of linear vesting after which all value will be claimable or claimed
   */
  function addNewFixedVesting(
    address beneficiaryAddress,
    uint64 startTimestamp,
    uint64 durationSeconds
  ) external onlyOwner {
    VestingWallet newVesting = new VestingWallet(
      beneficiaryAddress,
      startTimestamp,
      durationSeconds
    );
    fixedVestingWallets[beneficiaryAddress].push(newVesting);
  }

  /**
   * @dev Terminates terminable vesting
   * @param beneficiaryAddress Address which will have one of vestings terminated
   * @param id Number of vesting contract for specific beneficiary that will be terminated
   */
  function terminateVesting(address beneficiaryAddress, uint256 id)
    external
    onlyOwner
  {
    require(
      terminableVestingWallets[beneficiaryAddress].length > id,
      "id higher than terminable vestings count"
    );
    terminableVestingWallets[beneficiaryAddress][id].terminateVesting();
  }

  /**
   * @dev Releases all vested value of all terminable vestings of specific token for beneficiary
   * @param token Address of token which will be released
   * @param beneficiary Vesting receiver
   */
  function releaseTerminable(address token, address beneficiary) external {
    for (uint256 i = 0; i < terminableVestingWallets[beneficiary].length; i++) {
      VestingWallet wallet = terminableVestingWallets[beneficiary][i];
      if (wallet.vestedAmount(token, uint64(block.timestamp)) > 0) {
        wallet.release(token);
      }
    }
  }

  /**
   * @dev Releases all vested value of all fixed (non-terminable) vestings of specific token for beneficiary
   * @param token Address of token which will be released
   * @param beneficiary Vesting receiver
   */
  function releaseFixed(address token, address beneficiary) external {
    for (uint256 i = 0; i < fixedVestingWallets[beneficiary].length; i++) {
      VestingWallet wallet = fixedVestingWallets[beneficiary][i];
      if (wallet.vestedAmount(token, uint64(block.timestamp)) > 0) {
        wallet.release(token);
      }
    }
  }

  /**
   * @dev Returns number of different terminable vesting schedules for beneficiary
   * @param beneficiary Vesting receiver
   * @return number of terminable vesting contracts
   */
  function getTerminableVestingsCount(address beneficiary)
    external
    view
    returns (uint256)
  {
    return terminableVestingWallets[beneficiary].length;
  }

  /**
   * @dev Returns number of different fixed (non-terminable) vesting schedules for beneficiary
   * @param beneficiary Vesting receiver
   * @return number of fixed vesting contracts
   */
  function getFixedVestingsCount(address beneficiary)
    external
    view
    returns (uint256)
  {
    return fixedVestingWallets[beneficiary].length;
  }

  /**
   * @dev Returns releasable value from all terminable vestings of specific token for beneficiary
   * @param token Address of token which will be released
   * @param beneficiary Vesting receiver
   * @return total releasable value from terminable contracts
   */
  function totalReleasableFromTerminable(address token, address beneficiary)
    external
    view
    returns (uint256)
  {
    uint256 totalVested = 0;
    TerminableVestingWallet[] storage vestingWallets = terminableVestingWallets[
      beneficiary
    ];

    for (uint256 i = 0; i < vestingWallets.length; i++) {
      uint256 vestedAmount = vestingWallets[i].vestedAmount(
        token,
        uint64(block.timestamp)
      );

      totalVested += vestedAmount;
    }

    return totalVested - totalReleasedFromTerminable(token, beneficiary);
  }

  /**
   * @dev Returns releasable value from all fixed (non-terminable) vestings of specific token for beneficiary
   * @param token Address of token which will be released
   * @param beneficiary Vesting receiver
   * @return total releasable value from fixed contracts
   */
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

  /**
   * @dev Returns released value from all terminable vestings of specific token for beneficiary
   * @param token Address of released token
   * @param beneficiary Vesting receiver
   * @return total released value from terminable contracts
   */
  function totalReleasedFromTerminable(address token, address beneficiary)
    public
    view
    returns (uint256)
  {
    uint256 totalReleased = 0;
    for (uint256 i = 0; i < terminableVestingWallets[beneficiary].length; i++) {
      totalReleased += terminableVestingWallets[beneficiary][i].released(token);
    }
    return totalReleased;
  }

  /**
   * @dev Returns released value from all fixed (non-terminable) vestings of specific token for beneficiary
   * @param token Address of released token
   * @param beneficiary Vesting receiver
   * @return total released value from fixed contracts
   */
  function totalReleasedFromFixed(address token, address beneficiary)
    public
    view
    returns (uint256)
  {
    uint256 totalReleased = 0;
    for (uint256 i = 0; i < fixedVestingWallets[beneficiary].length; i++) {
      totalReleased += fixedVestingWallets[beneficiary][i].released(token);
    }
    return totalReleased;
  }

  /**
   * @dev Returns total value that can be released during vesting period from all fixed (non-terminable) vestings of specific token for beneficiary
   * @param token Address of vested token
   * @param beneficiary Vesting receiver
   * @return total value that can be released during vesting period from fixed vesting contracts
   */
  function totalToBeReleasedFromFixed(address token, address beneficiary)
    public
    view
    returns (uint256)
  {
    uint256 totalTokenBalance = 0;
    TerminableVestingWallet[] storage vestingWallets = terminableVestingWallets[
      beneficiary
    ];

    for (uint256 i = 0; i < vestingWallets.length; i++) {
      VestingWallet vestingWallet = vestingWallets[i];
      uint256 tokenBalance = IERC20(token).balanceOf(address(vestingWallet));

      totalTokenBalance += tokenBalance;
    }

    return totalTokenBalance + totalReleasedFromTerminable(token, beneficiary);
  }

  /**
   * @dev Returns total value that can be released during vesting period from all terminable vestings of specific token for beneficiary
   * @param token Address of vested token
   * @param beneficiary Vesting receiver
   * @return total value that can be released during vesting period from terminable vesting contracts
   */
  function totalToBeReleasedFromTerminable(address token, address beneficiary)
    external
    view
    returns (uint256)
  {
    return
      totalTokenBalanceTerminable(token, beneficiary) +
      totalReleasedFromTerminable(token, beneficiary);
  }

  function totalTokenBalanceTerminable(address token, address beneficiary)
    public
    view
    returns (uint256)
  {
    uint256 totalTokenBalance = 0;
    TerminableVestingWallet[] storage vestingWallets = terminableVestingWallets[
      beneficiary
    ];

    for (uint256 i = 0; i < vestingWallets.length; i++) {
      VestingWallet vestingWallet = vestingWallets[i];
      uint256 tokenBalance = IERC20(token).balanceOf(address(vestingWallet));

      totalTokenBalance += tokenBalance;
    }

    return totalTokenBalance;
  }

  function totalTokenBalanceFixed(address token, address beneficiary)
    public
    view
    returns (uint256)
  {
    uint256 totalTokenBalance = 0;
    VestingWallet[] storage vestingWallets = fixedVestingWallets[beneficiary];

    for (uint256 i = 0; i < vestingWallets.length; i++) {
      VestingWallet vestingWallet = vestingWallets[i];
      uint256 tokenBalance = IERC20(token).balanceOf(address(vestingWallet));

      totalTokenBalance += tokenBalance;
    }

    return totalTokenBalance;
  }

  function withdrawAllFromTerminated(
    address token,
    address beneficiary,
    address to
  ) external onlyOwner {
    TerminableVestingWallet[] storage vestingWallets = terminableVestingWallets[
      beneficiary
    ];

    for (uint256 i = 0; i < vestingWallets.length; i++) {
      vestingWallets[i].withdrawAllFromTerminated(token, to);
    }
  }
}
