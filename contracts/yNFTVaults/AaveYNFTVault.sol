// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
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
  uint256 public totalSupply;

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

  function getAmountToClaim() external view returns (uint256) {
    address[] memory assets = new address[](1);
    assets[0] = address(aToken);

    uint256 amountToClaim = incentivesController.getRewardsBalance(
      assets,
      address(this)
    );

    return amountToClaim;
  }

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
  }

  function _withdraw(uint256 _nftTokenId, address _receiver)
    private
    returns (uint256)
  {
    uint256 currentAmountOfAToken = aToken.balanceOf(address(this));

    uint256 amountToWithdraw = (balanceOf[_nftTokenId] *
      currentAmountOfAToken) / totalSupply;

    totalSupply = totalSupply - balanceOf[_nftTokenId];

    balanceOf[_nftTokenId] = 0;

    yNFT.burn(_nftTokenId);

    return pool.withdraw(address(underlyingToken), amountToWithdraw, _receiver);
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
      uint256 balance = (_tokenAmount * totalSupply) / currentAmountOfAToken;

      balanceOf[tokenId] = balance;

      totalSupply = totalSupply + balance;
    }
  }

  function withdrawToUnderlyingTokens(uint256 _nftTokenId)
    external
    whenNotPaused
    onlyNftOwner(_nftTokenId)
  {
    _withdraw(_nftTokenId, msg.sender);
  }

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

  /*
   * @dev Calculates underlying asset balance belonging to particular nft token id.
   * @param (uint256 _nftTokenId) nft token id that gives access to certain balance of underlying asset.
   * @return (uint256) underlying asset balance for certain nft token id.
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
}
