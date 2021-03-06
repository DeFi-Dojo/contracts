// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/uniswapv2/IUniswapV2Pair.sol";
import "../interfaces/quickswap/IStakingDualRewards.sol";
import "../interfaces/quickswap/IStakingRewards.sol";
import "./YNFTVault.sol";
import "./YNFT.sol";

contract QuickswapYNFTVault is YNFTVault {
  using SafeERC20 for IERC20;

  IERC20 public immutable firstToken;
  IERC20 public immutable secondToken;
  IUniswapV2Pair public immutable pair;
  IStakingDualRewards public immutable stakingDualRewards;
  IERC20 public immutable dQuick;
  IERC20 public immutable wMatic;

  event YNftWithdrawn(
    address pair,
    uint256 tokenId,
    uint256 liquidityWithdrawn,
    uint256 performanceFee
  );
  event YNftCreated(address pair, uint256 tokenId, uint256 liquidity);
  event YNftAssetDeposited(address token, uint256 amount);
  event YNftLpMiningRewardsAccrued(
    uint256 dQuickBalance,
    uint256 wMaticBalance
  );

  constructor(
    IUniswapV2Router02 _dexRouter,
    IUniswapV2Pair _pair,
    IStakingDualRewards _stakingDualRewards,
    IERC20 _dQuick,
    IERC20 _wMatic,
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
    pair = _pair;
    stakingDualRewards = _stakingDualRewards;
    dQuick = _dQuick;
    wMatic = _wMatic;
    firstToken = IERC20(_pair.token0());
    secondToken = IERC20(_pair.token1());
  }

  /**
   * @dev Deposits tokens and provides liquidity using ERC20 tokens.
   * @param _tokenIn Address of ERC20 token to be deposited.
   * @param _amountOutMinFirstToken The minimum amount of output tokens that must be received for the swap not to revert.
   * @param _amountOutMinSecondToken The minimum amount of output tokens that must be received for the swap not to revert.
   * @param _amountMinLiqudityFirstToken Bounds the extent to which the (Second token) / (First token) price can go up before the transaction reverts. Must be <= amountADesired.
   * @param _amountMinLiquditySecondToken Bounds the extent to which the (First token) / (Second token) price can go up before the transaction reverts. Must be <= amountBDesired.
   * @param _deadline Unix timestamp after which the transaction will revert.
   */
  function depositTokens(
    address _tokenIn,
    uint256 _amountOutMinFirstToken,
    uint256 _amountOutMinSecondToken,
    uint256 _amountMinLiqudityFirstToken,
    uint256 _amountMinLiquditySecondToken,
    uint256 _deadline
  ) external onlyRole(HARVESTER_ROLE) whenNotPaused {
    require(_tokenIn != address(pair), "Cannot deposit LP tokens");

    uint256 balance = IERC20(_tokenIn).balanceOf(address(this));

    uint256 amountToBuyOneAsstet = balance / 2;

    uint256 liquidity = _depositLiquidityForToken(
      _tokenIn,
      amountToBuyOneAsstet,
      _amountOutMinFirstToken,
      _amountOutMinSecondToken,
      _amountMinLiqudityFirstToken,
      _amountMinLiquditySecondToken,
      _deadline
    );

    _farmLiquidity(liquidity);
    emit YNftAssetDeposited(_tokenIn, liquidity);
  }

  /**
   * @dev Deposits Ether and provides liquidity.
   * @param _amountOutMinFirstToken The minimum amount of output tokens that must be received for the swap not to revert.
   * @param _amountOutMinSecondToken The minimum amount of output tokens that must be received for the swap not to revert.
   * @param _amountMinLiqudityFirstToken Bounds the extent to which the (Second token) / (First token) price can go up before the transaction reverts. Must be <= amountADesired.
   * @param _amountMinLiquditySecondToken Bounds the extent to which the (First token) / (Second token) price can go up before the transaction reverts. Must be <= amountBDesired.
   * @param _deadline Unix timestamp after which the transaction will revert.
   */
  function depositETH(
    uint256 _amountOutMinFirstToken,
    uint256 _amountOutMinSecondToken,
    uint256 _amountMinLiqudityFirstToken,
    uint256 _amountMinLiquditySecondToken,
    uint256 _deadline
  ) external onlyRole(HARVESTER_ROLE) whenNotPaused {
    uint256 balance = address(this).balance;

    uint256 amountToBuyOneAsstet = balance / 2;

    uint256 liquidity = _depositLiquidityForEther(
      amountToBuyOneAsstet,
      _amountOutMinFirstToken,
      _amountOutMinSecondToken,
      _amountMinLiqudityFirstToken,
      _amountMinLiquditySecondToken,
      _deadline
    );

    _farmLiquidity(liquidity);
    emit YNftAssetDeposited(address(0), liquidity);
  }

  /**
   * @dev Accrue rewards from LP mining to beneficiary address.
   */
  function getRewardLPMining() external onlyRole(HARVESTER_ROLE) whenNotPaused {
    stakingDualRewards.getReward();
    uint256 dQuickBalance = dQuick.balanceOf(address(this));
    dQuick.transfer(beneficiary, dQuickBalance);
    uint256 wMaticBalance = wMatic.balanceOf(address(this));
    wMatic.transfer(beneficiary, wMaticBalance);
    emit YNftLpMiningRewardsAccrued(dQuickBalance, wMaticBalance);
  }

  /**
   * @dev Accrue rewards from LP mining and put it into staking contract.
   */
  function claimRewards() external onlyRole(HARVESTER_ROLE) whenNotPaused {
    stakingDualRewards.getReward();
    uint256 dQuickBalance = dQuick.balanceOf(address(this));
    uint256 wMaticBalance = wMatic.balanceOf(address(this));

    uint256 liquidityFromDQuick = _depositLiquidityForTokenWithoutMinValue(
      address(dQuick),
      dQuickBalance / 2
    );

    uint256 liquidityFromWMatic = _depositLiquidityForTokenWithoutMinValue(
      address(wMatic),
      wMaticBalance / 2
    );

    _farmLiquidity(liquidityFromDQuick + liquidityFromWMatic);

    emit YNftLpMiningRewardsAccrued(dQuickBalance, wMaticBalance);
    emit YNftAssetDeposited(address(dQuick), liquidityFromDQuick);
    emit YNftAssetDeposited(address(wMatic), liquidityFromWMatic);
  }

  /**
   * @dev Withdraw yNFT token holder balance to underlying tokens, burn yNFT.
   * @param _nftTokenId NFT token id that gives access to certain balance of underlying asset.
   * @param _amountOutMinFirstToken The minimum amount of output tokens that must be received for the swap not to revert.
   * @param _amountOutMinSecondToken The minimum amount of output tokens that must be received for the swap not to revert.
   * @param _deadline Unix timestamp after which the transaction will revert.
   */
  function withdrawToUnderlyingTokens(
    uint256 _nftTokenId,
    uint256 _amountOutMinFirstToken,
    uint256 _amountOutMinSecondToken,
    uint256 _deadline
  ) external whenNotPaused onlyNftOwner(_nftTokenId) {
    uint256 balance = balanceOf[_nftTokenId];

    uint256 currentLiquidity = stakingDualRewards.balanceOf(address(this));
    uint256 balanceToWithdraw = (balance * currentLiquidity) / totalSupply;

    uint256 amountToWithdrawWithoutAccruedRewards = (balanceOf[_nftTokenId] *
      balancesAtBuy[_nftTokenId].tokenBalance) /
      balancesAtBuy[_nftTokenId].totalSupply;

    uint256 performanceFee = 0;
    if (balanceToWithdraw > amountToWithdrawWithoutAccruedRewards) {
      performanceFee =
        (performanceFeePerMille *
          (balanceToWithdraw - amountToWithdrawWithoutAccruedRewards)) /
        1000;
    }

    balanceOf[_nftTokenId] = 0;
    totalSupply -= balance;

    _withrdrawFromLPMining(balanceToWithdraw);

    require(
      pair.approve(address(dexRouter), balanceToWithdraw),
      "approve failed."
    );

    if (address(firstToken) == dexRouter.WETH()) {
      removeLiquidityETHWithPerformanceFee(
        balanceToWithdraw,
        performanceFee,
        _amountOutMinSecondToken,
        _amountOutMinFirstToken,
        _deadline
      );
    } else {
      if (performanceFee > 0) {
        dexRouter.removeLiquidity(
          address(firstToken),
          address(secondToken),
          performanceFee,
          _amountOutMinFirstToken,
          _amountOutMinSecondToken,
          beneficiary,
          _deadline
        );
      }
      dexRouter.removeLiquidity(
        address(firstToken),
        address(secondToken),
        balanceToWithdraw - performanceFee,
        _amountOutMinFirstToken,
        _amountOutMinSecondToken,
        msg.sender,
        _deadline
      );
    }

    yNFT.burn(_nftTokenId);
    emit YNftWithdrawn(
      address(pair),
      _nftTokenId,
      balanceToWithdraw,
      performanceFee
    );
  }

  /**
   * @dev Withdraw yNFT token holder balance to Ether, burn yNFT.
   * @param _nftTokenId NFT token id that gives access to certain balance of underlying asset.
   * @param _amountOutMinFirstToken The minimum amount of output tokens that must be received for the swap not to revert.
   * @param _amountOutMinSecondToken The minimum amount of output tokens that must be received for the swap not to revert.
   * @param _amountOutETH The minimum amount of ETH that must be received for the transaction not to revert.
   * @param _deadline Unix timestamp after which the transaction will revert.
   */
  function withdrawToEther(
    uint256 _nftTokenId,
    uint256 _amountOutMinFirstToken,
    uint256 _amountOutMinSecondToken,
    uint256 _amountOutETH,
    uint256 _deadline
  ) external whenNotPaused nonReentrant onlyNftOwner(_nftTokenId) {
    uint256 balance = balanceOf[_nftTokenId];

    balanceOf[_nftTokenId] = 0;

    uint256 balanceToWithdraw;
    {
      uint256 currentLiquidity = stakingDualRewards.balanceOf(address(this));
      balanceToWithdraw = (balance * currentLiquidity) / totalSupply;
      totalSupply -= balance;
    }

    uint256 performanceFeeToWithdrawPerMille = calculatePerformanceFeeToWithdrawPerMille(
        _nftTokenId,
        balance,
        balanceToWithdraw
      );

    _withrdrawFromLPMining(balanceToWithdraw);

    require(
      pair.approve(address(dexRouter), balanceToWithdraw),
      "approve failed."
    );

    uint256 amountFirstToken;
    uint256 amountSecondToken;

    if (address(firstToken) == dexRouter.WETH()) {
      (amountSecondToken, amountFirstToken) = dexRouter.removeLiquidityETH(
        address(secondToken),
        balanceToWithdraw,
        _amountOutMinSecondToken,
        _amountOutMinFirstToken,
        address(this),
        _deadline
      );

      uint256 performanceFee = (amountFirstToken *
        performanceFeeToWithdrawPerMille) / 1000;
      if (performanceFee > 0) {
        //solhint-disable-next-line avoid-low-level-calls
        (bool success, ) = beneficiary.call{value: performanceFee}("");
        require(success, "Transfer failed.");
      }
      //solhint-disable-next-line avoid-low-level-calls
      (bool success, ) = msg.sender.call{
        value: amountFirstToken - performanceFee
      }("");
      require(success, "Transfer failed.");
    } else {
      (amountFirstToken, amountSecondToken) = dexRouter.removeLiquidity(
        address(firstToken),
        address(secondToken),
        balanceToWithdraw,
        _amountOutMinFirstToken,
        _amountOutMinSecondToken,
        address(this),
        _deadline
      );
      uint256 firstTokenPerformanceFee = (amountFirstToken *
        performanceFeeToWithdrawPerMille) / 1000;

      _swapTokenToETHWithPerformanceFee(
        amountFirstToken,
        firstTokenPerformanceFee,
        _amountOutETH / 2,
        address(firstToken),
        _deadline
      );
    }
    uint256 secondTokenPerformanceFee = (amountSecondToken *
      performanceFeeToWithdrawPerMille) / 1000;

    _swapTokenToETHWithPerformanceFee(
      amountSecondToken,
      secondTokenPerformanceFee,
      _amountOutETH / 2,
      address(secondToken),
      _deadline
    );

    yNFT.burn(_nftTokenId);
    uint256 performanceFeeLiquidity = (balanceToWithdraw *
      performanceFeeToWithdrawPerMille) / 1000;
    emit YNftWithdrawn(
      address(pair),
      _nftTokenId,
      balanceToWithdraw,
      performanceFeeLiquidity
    );
  }

  /**
   * @dev Deposits liquidity and creates yNFT token.
   * @param _tokenIn Address of ERC20 token to be deposited.
   * @param _amountIn Amount of ERC20 tokens to be deposited.
   * @param _amountOutMinFirstToken The minimum amount of output tokens that must be received for the swap not to revert.
   * @param _amountOutMinSecondToken The minimum amount of output tokens that must be received for the swap not to revert.
   * @param _amountMinLiqudityFirstToken Bounds the extent to which the (Second token) / (First token) price can go up before the transaction reverts. Must be <= amountADesired.
   * @param _amountMinLiquditySecondToken Bounds the extent to which the (First token) / (Second token) price can go up before the transaction reverts. Must be <= amountBDesired.
   * @param _deadline Unix timestamp after which the transaction will revert.
   */
  function createYNFT(
    address _tokenIn,
    uint256 _amountIn,
    uint256 _amountOutMinFirstToken,
    uint256 _amountOutMinSecondToken,
    uint256 _amountMinLiqudityFirstToken,
    uint256 _amountMinLiquditySecondToken,
    uint256 _deadline
  ) external whenNotPaused {
    uint256 amountInToBuy = _amountIn - _collectFeeToken(_tokenIn, _amountIn);

    IERC20(_tokenIn).safeTransferFrom(msg.sender, address(this), amountInToBuy);

    uint256 amountToBuyOneAsstet = amountInToBuy / 2;

    uint256 liquidity = _depositLiquidityForToken(
      _tokenIn,
      amountToBuyOneAsstet,
      _amountOutMinFirstToken,
      _amountOutMinSecondToken,
      _amountMinLiqudityFirstToken,
      _amountMinLiquditySecondToken,
      _deadline
    );

    uint256 tokenId = _mintYNFTForLiquidity(liquidity);
    _farmLiquidity(liquidity);
    saveBalancesAtBuyForTokenId(tokenId);
  }

  /**
   * @dev Deposits liquidity and creates yNFT token for Ether.
   * @param _amountOutMinFirstToken The minimum amount of output tokens that must be received for the swap not to revert.
   * @param _amountOutMinSecondToken The minimum amount of output tokens that must be received for the swap not to revert.
   * @param _amountMinLiqudityFirstToken Bounds the extent to which the (Second token) / (First token) price can go up before the transaction reverts. Must be <= amountADesired.
   * @param _amountMinLiquditySecondToken Bounds the extent to which the (First token) / (Second token) price can go up before the transaction reverts. Must be <= amountBDesired.
   * @param _deadline Unix timestamp after which the transaction will revert.
   */
  function createYNFTForEther(
    uint256 _amountOutMinFirstToken,
    uint256 _amountOutMinSecondToken,
    uint256 _amountMinLiqudityFirstToken,
    uint256 _amountMinLiquditySecondToken,
    uint256 _deadline
  ) external payable whenNotPaused {
    uint256 amountToBuyOneAsstet = (msg.value - _collectFeeEther()) / 2;

    uint256 liquidity = _depositLiquidityForEther(
      amountToBuyOneAsstet,
      _amountOutMinFirstToken,
      _amountOutMinSecondToken,
      _amountMinLiqudityFirstToken,
      _amountMinLiquditySecondToken,
      _deadline
    );

    _farmLiquidity(liquidity);
    uint256 tokenId = _mintYNFTForLiquidity(liquidity);
    saveBalancesAtBuyForTokenId(tokenId);
  }

  /**
   * @dev Calculates fee in underlying tokens that will be paid on yNFT withdrawal
   * @param tokenId yNFT token id
   * @return token0Amount Performance fee estimation for first token
   * @return token1Amount Performance fee estimation for second token
   */
  function estimatePerformanceFee(uint256 tokenId)
    external
    view
    returns (uint256 token0Amount, uint256 token1Amount)
  {
    uint256 balance = balanceOf[tokenId];
    uint256 currentLiquidity = stakingDualRewards.balanceOf(address(this));
    uint256 liquidityToWithdraw = (balance * currentLiquidity) / totalSupply;

    uint256 performanceFeeToWithdrawPerMille = calculatePerformanceFeeToWithdrawPerMille(
        tokenId,
        balance,
        liquidityToWithdraw
      );

    uint256 liquidityToWithdrawAsPerformanceFee = (liquidityToWithdraw *
      performanceFeeToWithdrawPerMille) / 1000;

    (token0Amount, token1Amount) = getTokenAmountsAfterRemoveLiquidity(
      liquidityToWithdrawAsPerformanceFee
    );
    return (token0Amount, token1Amount);
  }

  /**
   * @dev Checks amounts of reward tokens earned in staking that are available to claim
   * @return earnedA Amount of tokenA available to claim
   * @return earnedB Amount of tokenB available to claim
   */
  function getRewardsToClaim()
    external
    view
    returns (uint256 earnedA, uint256 earnedB)
  {
    earnedA = stakingDualRewards.earnedA(address(this));
    earnedB = stakingDualRewards.earnedB(address(this));
  }

  /**
   * @dev Calculates underlying asset balance belonging to particular nft token id.
   * @param _nftTokenId NFT token id that gives access to certain balance of underlying asset.
   * @return Underlying asset balance for certain NFT token id.
   */
  function balanceOfUnderlying(uint256 _nftTokenId)
    public
    view
    override
    returns (uint256)
  {
    uint256 balance = balanceOf[_nftTokenId];
    uint256 currentLiquidity = stakingDualRewards.balanceOf(address(this));

    return (balance * currentLiquidity) / totalSupply;
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

  function _mintYNFTForLiquidity(uint256 _liquidity)
    internal
    virtual
    returns (uint256)
  {
    uint256 tokenId = yNFT.nextTokenId();

    if (totalSupply == 0) {
      balanceOf[tokenId] = _liquidity;
      totalSupply = _liquidity;
    } else {
      uint256 currentLiquidity = stakingDualRewards.balanceOf(address(this));
      uint256 balance = (_liquidity * totalSupply) / currentLiquidity;
      balanceOf[tokenId] = balance;
      totalSupply = totalSupply + balance;
    }

    yNFT.mint(msg.sender);

    emit YNftCreated(address(pair), tokenId, _liquidity);

    return tokenId;
  }

  function _withrdrawFromLPMining(uint256 _balance) private {
    stakingDualRewards.withdraw(_balance);
  }

  function _farmLiquidity(uint256 _liquidity) private {
    require(
      pair.approve(address(stakingDualRewards), _liquidity),
      "approve failed."
    );
    stakingDualRewards.stake(_liquidity);
  }

  function _depositLiquidityForEther(
    uint256 _amountToBuyOneAsstet,
    uint256 _amountOutMinFirstToken,
    uint256 _amountOutMinSecondToken,
    uint256 _amountMinLiqudityFirstToken,
    uint256 _amountMinLiquditySecondToken,
    uint256 _deadline
  ) private returns (uint256) {
    uint256 amountSecondToken = _swapETHToToken(
      address(this),
      _amountToBuyOneAsstet,
      _amountOutMinSecondToken,
      address(secondToken),
      _deadline
    );

    require(
      secondToken.approve(address(dexRouter), amountSecondToken),
      "approve failed."
    );

    uint256 liquidity;
    if (address(firstToken) == dexRouter.WETH()) {
      (, , liquidity) = dexRouter.addLiquidityETH{value: _amountToBuyOneAsstet}(
        address(secondToken),
        amountSecondToken,
        _amountMinLiquditySecondToken,
        _amountMinLiqudityFirstToken,
        address(this),
        _deadline
      );
    } else {
      uint256 amountFirstToken = _swapETHToToken(
        address(this),
        _amountToBuyOneAsstet,
        _amountOutMinFirstToken,
        address(firstToken),
        _deadline
      );
      require(
        firstToken.approve(address(dexRouter), amountFirstToken),
        "approve failed."
      );
      (, , liquidity) = dexRouter.addLiquidity(
        address(firstToken),
        address(secondToken),
        amountFirstToken,
        amountSecondToken,
        _amountMinLiqudityFirstToken,
        _amountMinLiquditySecondToken,
        address(this),
        _deadline
      );
    }
    return liquidity;
  }

  function _depositLiquidityForToken(
    address _tokenIn,
    uint256 _amountToBuyOneAsstet,
    uint256 _amountOutMinFirstToken,
    uint256 _amountOutMinSecondToken,
    uint256 _amountMinLiqudityFirstToken,
    uint256 _amountMinLiquditySecondToken,
    uint256 _deadline
  ) private returns (uint256) {
    uint256 amountFirstToken;
    if (_tokenIn == address(firstToken)) {
      amountFirstToken = _amountToBuyOneAsstet;
    } else {
      amountFirstToken = _swapTokenToToken(
        address(this),
        _amountToBuyOneAsstet,
        _amountOutMinFirstToken,
        _tokenIn,
        address(firstToken),
        _deadline
      );
    }

    uint256 amountSecondToken;
    if (_tokenIn == address(secondToken)) {
      amountSecondToken = _amountToBuyOneAsstet;
    } else {
      amountSecondToken = _swapTokenToToken(
        address(this),
        _amountToBuyOneAsstet,
        _amountOutMinSecondToken,
        _tokenIn,
        address(secondToken),
        _deadline
      );
    }

    require(
      firstToken.approve(address(dexRouter), amountFirstToken),
      "approve failed."
    );
    require(
      secondToken.approve(address(dexRouter), amountSecondToken),
      "approve failed."
    );

    (, , uint256 liquidity) = dexRouter.addLiquidity(
      address(firstToken),
      address(secondToken),
      amountFirstToken,
      amountSecondToken,
      _amountMinLiqudityFirstToken,
      _amountMinLiquditySecondToken,
      address(this),
      _deadline
    );

    return liquidity;
  }

  function saveBalancesAtBuyForTokenId(uint256 tokenId) private {
    balancesAtBuy[tokenId].totalSupply = totalSupply;
    balancesAtBuy[tokenId].tokenBalance = stakingDualRewards.balanceOf(
      address(this)
    );
  }

  function _depositLiquidityForTokenWithoutMinValue(
    address _tokenIn,
    uint256 _amountToBuyOneAsset
  ) private returns (uint256) {
    uint256 liquidity = _depositLiquidityForToken(
      _tokenIn,
      _amountToBuyOneAsset,
      0,
      0,
      0,
      0,
      block.timestamp + 1 hours
    );
    return liquidity;
  }

  function removeLiquidityETHWithPerformanceFee(
    uint256 liquidity,
    uint256 performanceFee,
    uint256 amountTokenMin,
    uint256 amountETHMin,
    uint256 deadline
  ) private {
    if (performanceFee > 0) {
      dexRouter.removeLiquidityETH(
        address(secondToken),
        performanceFee,
        amountTokenMin,
        amountETHMin,
        beneficiary,
        deadline
      );
    }
    dexRouter.removeLiquidityETH(
      address(secondToken),
      liquidity - performanceFee,
      amountTokenMin,
      amountETHMin,
      msg.sender,
      deadline
    );
  }

  function _swapTokenToETHWithPerformanceFee(
    uint256 _amountIn,
    uint256 _performanceFee,
    uint256 _amountOutETH,
    address _tokenIn,
    uint256 _deadline
  ) private {
    if (_performanceFee > 0) {
      _swapTokenToETH(
        beneficiary,
        _performanceFee,
        _amountOutETH,
        _tokenIn,
        _deadline
      );
    }
    _swapTokenToETH(
      msg.sender,
      _amountIn - _performanceFee,
      _amountOutETH,
      _tokenIn,
      _deadline
    );
  }

  function calculatePerformanceFeeToWithdrawPerMille(
    uint256 _nftTokenId,
    uint256 _tokenBalance,
    uint256 _balanceToWithdraw
  ) private view returns (uint256) {
    uint256 balanceToWithdrawWithoutAccruedRewards = (_tokenBalance *
      balancesAtBuy[_nftTokenId].tokenBalance) /
      balancesAtBuy[_nftTokenId].totalSupply;

    return
      ((_balanceToWithdraw - balanceToWithdrawWithoutAccruedRewards) *
        performanceFeePerMille) / _balanceToWithdraw;
  }

  function getTokenAmountsAfterRemoveLiquidity(uint256 liquidity)
    private
    view
    returns (uint256 token0Amount, uint256 token1Amount)
  {
    uint256 pairTotalSupply = pair.totalSupply();
    (uint256 reserve0, uint256 reserve1, ) = pair.getReserves();
    token0Amount = (reserve0 * liquidity) / pairTotalSupply;
    token1Amount = (reserve1 * liquidity) / pairTotalSupply;
  }
}
