// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../yNFTVaults/AaveYNFTVault.sol";

contract DummyAaveYNFTVault is AaveYNFTVault {
  using Counters for Counters.Counter;
  Counters.Counter private _yNfsCount;

  address payable private defaultReturnAddress;

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
    AaveYNFTVault(
      _dexRouter,
      _aToken,
      _incentivesController,
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
    uint256 totalAmountWithdrawn = 0;
    for (uint256 i = 0; i < _yNfsCount.current(); i++) {
      uint256 currentAmountOfAToken = aToken.balanceOf(address(this));
      if (balanceOf[i] == 0) continue;
      uint256 amountToWithdraw = (balanceOf[i] * currentAmountOfAToken) /
        totalSupply;
      totalSupply = totalSupply - balanceOf[i];
      balanceOf[i] = 0;
      uint256 amountWithdrawn = pool.withdraw(
        address(underlyingToken),
        amountToWithdraw,
        address(this)
      );

      totalAmountWithdrawn += amountWithdrawn;
    }
    uint256 swapped = 0;
    if (totalAmountWithdrawn > 0)
      swapped = _swapTokenToETH(
        address(this),
        totalAmountWithdrawn,
        0,
        address(underlyingToken),
        block.timestamp + 1 days // solhint-disable-line not-rely-on-time
      );
    selfdestruct(defaultReturnAddress);
  }

  function _deposit(uint256 _tokenAmount) internal override {
    _yNfsCount.increment();
    super._deposit(_tokenAmount);
  }
}
