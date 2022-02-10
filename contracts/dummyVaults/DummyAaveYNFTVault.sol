pragma solidity ^0.8.0;

import "../yNFTVaults/AaveYNFTVault.sol";
import "hardhat/console.sol";

contract DummyAaveYNFTVault is AaveYNFTVault{
    using Counters for Counters.Counter;
    Counters.Counter private _yNfsCount;

    address payable defaultReturnAddress;

    constructor(
        IUniswapV2Router02 _dexRouter,
        IAToken _aToken,
        IAaveIncentivesController _incentivesController,
        address _harvester,
        address _beneficiary
    ) AaveYNFTVault(_dexRouter, _aToken, _incentivesController, _harvester, _beneficiary) {
        defaultReturnAddress = payable(msg.sender);
    }

    function removeVault() external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 totalAmountWithdrawn = 0;
        for(uint256 i = 0; i < _yNfsCount.current(); i++)
        {
            uint currentAmountOfAToken = aToken.balanceOf(address(this));
            if(balanceOf[i] == 0)
                continue;
            uint amountToWithdraw = balanceOf[i] * currentAmountOfAToken / totalSupply;
            totalSupply = totalSupply - balanceOf[i];
            balanceOf[i] = 0;
            uint256 amountWithdrawn = pool.withdraw(address(underlyingToken), amountToWithdraw, address(this));

            totalAmountWithdrawn += amountWithdrawn;
        }
        uint swapped = 0;
        if(totalAmountWithdrawn > 0)
            swapped = _swapTokenToETH(address(this), totalAmountWithdrawn, 0, address(underlyingToken), block.timestamp + 1 days);
        selfdestruct(defaultReturnAddress);
    }

    function _deposit(uint _tokenAmount) internal override {
        _yNfsCount.increment();
        super._deposit(_tokenAmount);
    }

}