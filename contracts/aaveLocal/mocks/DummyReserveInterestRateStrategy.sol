pragma solidity ^0.5.0;

import "../interfaces/IReserveInterestRateStrategy.sol";

contract DummyReserveInterestRateStrategy is IReserveInterestRateStrategy {

    function getBaseVariableBorrowRate() external view returns (uint256){
		return 0;
	}

    function calculateInterestRates(
        address _reserve,
        uint256 _utilizationRate,
        uint256 _totalBorrowsStable,
        uint256 _totalBorrowsVariable,
        uint256 _averageStableBorrowRate)
    external
    view
    returns (uint256 liquidityRate, uint256 stableBorrowRate, uint256 variableBorrowRate){
		return (0, 0, 0);
	}
}