// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/aave/ILendingPool.sol";
import "../interfaces/aave/IAToken.sol";
import "../interfaces/aave/IAaveIncentivesController.sol";
import "./YNFTVault.sol";
import "./YNFT.sol";

contract AaveYNFTVault is YNFTVault {
  using SafeERC20 for IAToken;
  using SafeERC20 for IERC20;

  IAaveIncentivesController public incentivesController;
  IAToken public aToken;
  ILendingPool public pool;
  IERC20 public rewardToken;
  IERC20 public immutable underlyingToken;

  event RewardsClaimed(address underlyingToken, uint256 amount);
  event YNftWithdrawn(
    address underlyingToken,
    uint256 tokenId,
    uint256 amountWithdrawn,
    uint256 performanceFee
  );
  event YNftCreated(
    address underlyingToken,
    uint256 tokenId,
    uint256 deposited
  );

  constructor(
    IUniswapV2Router02 _dexRouter,
    IAToken _aToken,
    IAaveIncentivesController _incentivesController,
    address _harvester,
    address _beneficiary,
    string memory _ynftName,
    string memory _ynftBaseUri,
    string memory _ynftPathUri
  )
    YNFTVault(
      _dexRouter,
      _harvester,
      _beneficiary,
      _ynftName,
      _ynftBaseUri,
      _ynftPathUri
    )
  {
    incentivesController = _incentivesController;
    rewardToken = IERC20(incentivesController.REWARD_TOKEN());
    aToken = _aToken;
    pool = ILendingPool(aToken.POOL());
    underlyingToken = IERC20(aToken.UNDERLYING_ASSET_ADDRESS());
  }

  /**
   * @dev Claims AAVE rewards, swaps to underlying token, deposits to the pool.
   * @param _amountOutMin The minimum amount of output tokens that must be received for the swap not to revert.
   * @param _deadline Unix timestamp after which the transaction will revert.
   */
  // front run, sandwich attack
  function claimRewards(uint256 _amountOutMin, uint256 _deadline)
    external
    whenNotPaused
    onlyRole(HARVESTER_ROLE)
  {
    address[] memory claimAssets = new address[](1);
    claimAssets[0] = address(aToken);

    uint256 amountToClaim = incentivesController.getRewardsBalance(
      claimAssets,
      address(this)
    );
    uint256 amountClaimed = incentivesController.claimRewards(
      claimAssets,
      amountToClaim,
      address(this)
    );

    require(
      rewardToken.approve(address(dexRouter), amountClaimed),
      "approve failed."
    ); // TODO: check for duplication
    uint256 amount = _swapTokenToToken(
      address(this),
      amountClaimed,
      _amountOutMin,
      address(rewardToken),
      address(underlyingToken),
      _deadline
    );

    require(underlyingToken.approve(address(pool), amount), "approve failed.");

    pool.deposit(address(underlyingToken), amount, address(this), 0);

    emit RewardsClaimed(address(underlyingToken), amount);
  }

  /**
   * @dev Withdraws underlying tokens to yNFT owner, burns yNFT token, transfers fee to beneficiary.
   * @param _nftTokenId NFT token id that gives access to certain balance of underlying asset.
   */
  function withdrawToUnderlyingTokens(uint256 _nftTokenId)
    external
    whenNotPaused
    onlyNftOwner(_nftTokenId)
  {
    _withdraw(_nftTokenId, msg.sender);
  }

  /**
   * @dev Withdraws yNFT to Ether and sends to yNFT owner, burns yNFT token, transfers fee to beneficiary.
   * @param _nftTokenId NFT token id that gives access to certain balance of underlying asset.
   * @param _amountOutMin The minimum amount of output tokens that must be received for the swap not to revert.
   * @param _deadline Unix timestamp after which the transaction will revert.
   */
  function withdrawToEther(
    uint256 _nftTokenId,
    uint256 _amountOutMin,
    uint256 _deadline
  ) external whenNotPaused onlyNftOwner(_nftTokenId) {
    uint256 amount = _withdraw(_nftTokenId, address(this));

    _swapTokenToETH(
      msg.sender,
      amount,
      _amountOutMin,
      address(underlyingToken),
      _deadline
    );
  }

  /**
   * @dev Deposits a certain amount of an asset into AAVE protocol pool and creates yNFT token.
   * @param _tokenIn Address of ERC20 token to be deposited.
   * @param _amountIn Amount of ERC20 tokens to be deposited.
   * @param _amountOutMin The minimum amount of output tokens that must be received for the swap not to revert.
   * @param _deadline Unix timestamp after which the transaction will revert.
   */
  function createYNFT(
    address _tokenIn,
    uint256 _amountIn,
    uint256 _amountOutMin,
    uint256 _deadline
  ) external whenNotPaused {
    uint256 amountInToBuy = _amountIn - _collectFeeToken(_tokenIn, _amountIn);

    IERC20(_tokenIn).safeTransferFrom(msg.sender, address(this), amountInToBuy);

    if (_tokenIn == address(underlyingToken)) {
      _deposit(amountInToBuy);
    } else {
      uint256 amount = _swapTokenToToken(
        address(this),
        amountInToBuy,
        _amountOutMin,
        _tokenIn,
        address(underlyingToken),
        _deadline
      );
      _deposit(amount);
    }
  }

  /**
   * @dev Deposits a certain amount of Ether into AAVE protocol pool and creates yNFT token.
   * @param _amountOutMin The minimum amount of output tokens that must be received for the swap not to revert.
   * @param _deadline Unix timestamp after which the transaction will revert.
   */
  function createYNFTForEther(uint256 _amountOutMin, uint256 _deadline)
    external
    payable
    whenNotPaused
  {
    uint256 amountToBuy = msg.value - _collectFeeEther();

    uint256 amount = _swapETHToToken(
      address(this),
      amountToBuy,
      _amountOutMin,
      address(underlyingToken),
      _deadline
    );

    _deposit(amount);
  }

  /**
   * @dev Gets amount of AAVE rewards that can be claimed.
   * @return Amount to claim.
   */
  function getAmountToClaim() external view returns (uint256) {
    address[] memory assets = new address[](1);
    assets[0] = address(aToken);

    uint256 amountToClaim = incentivesController.getRewardsBalance(
      assets,
      address(this)
    );

    return amountToClaim;
  }

  /**
   * @dev Calculates fee in underlying tokens that will be paid on yNFT withdrawal
   * @param tokenId yNFT token id
   * @return performanceFeeToWithdraw Performance fee estimation
   */
  function estimatePerformanceFee(uint256 tokenId)
    external
    view
    returns (uint256)
  {
    uint256 currentAmountOfAToken = aToken.balanceOf(address(this));

    uint256 amountToWithdraw = (balanceOf[tokenId] * currentAmountOfAToken) /
      totalSupply;

    uint256 amountToWithdrawWithoutAccruedRewards = (balanceOf[tokenId] *
      balancesAtBuy[tokenId].tokenBalance) / balancesAtBuy[tokenId].totalSupply;

    uint256 performanceFeeToWithdraw = (performanceFeePerMille *
      (amountToWithdraw - amountToWithdrawWithoutAccruedRewards)) / 1000;

    return performanceFeeToWithdraw;
  }

  /**
   * @dev Calculates underlying asset balance belonging to particular yNFT token id.
   * @param _nftTokenId NFT token id that gives access to certain balance of underlying asset.
   * @return Underlying asset balance for certain NFT token id.
   */
  function balanceOfUnderlying(uint256 _nftTokenId)
    public
    view
    override
    returns (uint256)
  {
    uint256 currentAmountOfAToken = aToken.balanceOf(address(this));
    uint256 balance = (balanceOf[_nftTokenId] * currentAmountOfAToken) /
      totalSupply;

    return balance;
  }

  /**
   * @dev Returns underlying asset balance at the moment of yNft purchase.
   * @param _nftTokenId NFT token id that gives access to certain balance of underlying asset.
   * @return Underlying asset balance at purchase for certain NFT token id.
   */
  function balanceOfUnderlyingAtBuy(uint256 _nftTokenId)
    public
    view
    override
    returns (uint256)
  {
    return
      (balanceOf[_nftTokenId] * balancesAtBuy[_nftTokenId].tokenBalance) /
      balancesAtBuy[_nftTokenId].totalSupply;
  }

  function _deposit(uint256 _tokenAmount) internal virtual {
    uint256 tokenId = yNFT.mint(msg.sender);

    require(
      underlyingToken.approve(address(pool), _tokenAmount),
      "approve failed."
    );

    uint256 currentAmountOfAToken = aToken.balanceOf(address(this));

    pool.deposit(address(underlyingToken), _tokenAmount, address(this), 0);

    if (totalSupply == 0) {
      balanceOf[tokenId] = _tokenAmount;
      totalSupply = _tokenAmount;
    } else {
      uint256 balance = (_tokenAmount * totalSupply) / currentAmountOfAToken; // TODO: doesn't work if _tokenAmount * totalSupply < currentAmountOfAToken
      balanceOf[tokenId] = balance;

      totalSupply = totalSupply + balance;
    }

    balancesAtBuy[tokenId].tokenBalance = aToken.balanceOf(address(this));
    balancesAtBuy[tokenId].totalSupply = totalSupply;

    emit YNftCreated(address(underlyingToken), tokenId, _tokenAmount);
  }

  function _withdraw(uint256 _nftTokenId, address _receiver)
    private
    returns (uint256)
  {
    uint256 currentAmountOfAToken = aToken.balanceOf(address(this));
    uint256 amountToWithdraw = (balanceOf[_nftTokenId] *
      currentAmountOfAToken) / totalSupply;

    uint256 amountToWithdrawWithoutAccruedRewards = (balanceOf[_nftTokenId] *
      balancesAtBuy[_nftTokenId].tokenBalance) /
      balancesAtBuy[_nftTokenId].totalSupply;

    totalSupply = totalSupply - balanceOf[_nftTokenId];

    balanceOf[_nftTokenId] = 0;

    yNFT.burn(_nftTokenId);
    (
      uint256 amountWithdrawn,
      uint256 performanceFee
    ) = withdrawFromPoolWithPerformanceFee(
        amountToWithdraw,
        amountToWithdrawWithoutAccruedRewards,
        _receiver
      );
    emit YNftWithdrawn(
      address(underlyingToken),
      _nftTokenId,
      amountWithdrawn,
      performanceFee
    );
    return amountWithdrawn - performanceFee;
  }

  function withdrawFromPoolWithPerformanceFee(
    uint256 _amountToWithdraw,
    uint256 _amountToWithdrawWithoutAccruedRewards,
    address _receiver
  ) private returns (uint256, uint256) {
    uint256 performanceFee = 0;
    uint256 performanceFeeToWithdraw = 0;

    if (_amountToWithdraw > _amountToWithdrawWithoutAccruedRewards) {
      performanceFeeToWithdraw =
        (performanceFeePerMille *
          (_amountToWithdraw - _amountToWithdrawWithoutAccruedRewards)) /
        1000;
      if (performanceFeeToWithdraw > 0) {
        performanceFee = pool.withdraw(
          address(underlyingToken),
          performanceFeeToWithdraw,
          beneficiary
        );
      }
    }

    uint256 amountWithdrawn = pool.withdraw(
      address(underlyingToken),
      _amountToWithdraw - performanceFeeToWithdraw,
      _receiver
    );

    return (amountWithdrawn, performanceFee);
  }
}
