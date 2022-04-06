// SPDX-License-Identifier: MIT
// solhint-disable not-rely-on-time

pragma solidity ^0.8.0;

import "../yNFTVaults/QuickswapYNFTVault.sol";

contract DummyQuickswapYNFTVault is QuickswapYNFTVault {
  using Counters for Counters.Counter;
  Counters.Counter private _yNfsCount;

  address payable public defaultReturnAddress;

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
    QuickswapYNFTVault(
      _dexRouter,
      _pair,
      _stakingDualRewards,
      _dQuick,
      _wMatic,
      _harvester,
      _beneficiary,
      _ynftName,
      _ynftBaseUri,
      _ynftPathUri
    )
  {
    defaultReturnAddress = payable(msg.sender);
  }

  function removeVault() external onlyRole(DEFAULT_ADMIN_ROLE) {
    for (uint256 i = 0; i < _yNfsCount.current(); i++) {
      if (balanceOf[i] == 0) continue;
      uint256 balance = balanceOf[i];

      balanceOf[i] = 0;
      totalSupply -= balance;

      stakingDualRewards.withdraw(balance);

      require(pair.approve(address(dexRouter), balance), "approve failed.");

      if (address(firstToken) == dexRouter.WETH()) {
        (uint256 amountToken, ) = dexRouter.removeLiquidityETH(
          address(secondToken),
          balance,
          0,
          0,
          msg.sender,
          block.timestamp + 1 days
        );

        _swapTokenToETH(
          address(this),
          amountToken,
          0,
          address(secondToken),
          block.timestamp + 1 days
        );
      } else {
        (uint256 amountA, uint256 amountB) = dexRouter.removeLiquidity(
          address(firstToken),
          address(secondToken),
          balance,
          0,
          0,
          msg.sender,
          block.timestamp + 1 days
        );

        _swapTokenToETH(
          address(this),
          amountA,
          0,
          address(firstToken),
          block.timestamp + 1 days
        );

        _swapTokenToETH(
          address(this),
          amountB,
          0,
          address(secondToken),
          block.timestamp + 1 days
        );
      }
    }
    selfdestruct(defaultReturnAddress);
  }

  function _mintYNFTForLiquidity(uint256 _liquidity) internal override {
    _yNfsCount.increment();
    super._mintYNFTForLiquidity(_liquidity);
  }
}
