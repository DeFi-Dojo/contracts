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

  function getRewardLPMining() external onlyRole(HARVESTER_ROLE) whenNotPaused {
    stakingDualRewards.getReward();
    uint256 dQuickBalance = dQuick.balanceOf(address(this));
    dQuick.transfer(beneficiary, dQuickBalance);
    uint256 wMaticBalance = wMatic.balanceOf(address(this));
    wMatic.transfer(beneficiary, wMaticBalance);
    emit YNftLpMiningRewardsAccrued(dQuickBalance, wMaticBalance);
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

  function _mintYNFTForLiquidity(uint256 _liquidity)
    internal
    virtual
    returns (uint256)
  {
    uint256 tokenId = yNFT.mint(msg.sender);
    if (totalSupply == 0) {
      balanceOf[tokenId] = _liquidity;
      totalSupply = _liquidity;
    } else {
      uint256 currentLiquidity = stakingDualRewards.balanceOf(address(this));
      uint256 balance = (_liquidity * totalSupply) / currentLiquidity;
      balanceOf[tokenId] = balance;
      totalSupply = totalSupply + balance;
    }
    emit YNftCreated(address(pair), tokenId, _liquidity);
    return tokenId;
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

  function calculatePerformanceFeeToWithdrawPerMille(
    uint256 _nftTokenId,
    uint256 _tokenBalance,
    uint256 _balanceToWithdraw
  ) private returns (uint256) {
    uint256 balanceToWithdrawWithoutAccruedRewards = (_tokenBalance *
      balancesAtBuy[_nftTokenId].tokenBalance) /
      balancesAtBuy[_nftTokenId].totalSupply;

    return
      ((_balanceToWithdraw - balanceToWithdrawWithoutAccruedRewards) *
        performanceFeePerMille) / _balanceToWithdraw;
  }

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

      if (firstTokenPerformanceFee > 0) {
        _swapTokenToETH(
          beneficiary,
          firstTokenPerformanceFee,
          _amountOutETH / 2,
          address(firstToken),
          _deadline
        );
      }
      _swapTokenToETH(
        msg.sender,
        amountFirstToken - firstTokenPerformanceFee,
        _amountOutETH / 2,
        address(firstToken),
        _deadline
      );
    }
    uint256 secondTokenPerformanceFee = (amountSecondToken *
      performanceFeeToWithdrawPerMille) / 1000;
    if (secondTokenPerformanceFee > 0) {
      _swapTokenToETH(
        beneficiary,
        secondTokenPerformanceFee,
        _amountOutETH / 2,
        address(secondToken),
        _deadline
      );
    }
    _swapTokenToETH(
      msg.sender,
      amountSecondToken - secondTokenPerformanceFee,
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

    require(pair.approve(address(dexRouter), balance), "approve failed.");

    if (address(firstToken) == dexRouter.WETH()) {
      if (performanceFee > 0) {
        dexRouter.removeLiquidityETH(
          address(secondToken),
          performanceFee,
          _amountOutMinSecondToken,
          _amountOutMinFirstToken,
          beneficiary,
          _deadline
        );
      }
      dexRouter.removeLiquidityETH(
        address(secondToken),
        balanceToWithdraw - performanceFee,
        _amountOutMinSecondToken,
        _amountOutMinFirstToken,
        msg.sender,
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

  function saveBalancesAtBuyForTokenId(uint256 tokenId) private {
    balancesAtBuy[tokenId].totalSupply = totalSupply;
    balancesAtBuy[tokenId].tokenBalance = stakingDualRewards.balanceOf(
      address(this)
    );
  }

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

    uint256 tokenId = _mintYNFTForLiquidity(liquidity);
    _farmLiquidity(liquidity);
    saveBalancesAtBuyForTokenId(tokenId);
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
    uint256 balance = balanceOf[_nftTokenId];
    uint256 currentLiquidity = stakingDualRewards.balanceOf(address(this));

    return (balance * currentLiquidity) / totalSupply;
  }
}
