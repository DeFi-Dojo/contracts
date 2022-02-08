pragma solidity ^0.8.0;

import "../yNFTVaults/AaveYNFTVault.sol";

contract DummyAaveYNFTVault is AaveYNFTVault{
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
        selfdestruct(defaultReturnAddress);
    }

    function removeVaultToAddress(address payable returnAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        selfdestruct(returnAddress);
    }
}