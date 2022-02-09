
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
    uint public totalSupply;

    constructor(
        IUniswapV2Router02 _dexRouter,
        IAToken _aToken,
        IAaveIncentivesController _incentivesController,
        address _harvester,
        address _beneficiary
    ) YNFTVault(_dexRouter, _harvester, _beneficiary) {
        incentivesController = _incentivesController;
        rewardToken = IERC20(incentivesController.REWARD_TOKEN());
        aToken = _aToken;
        pool = ILendingPool(aToken.POOL());
        underlyingToken = IERC20(aToken.UNDERLYING_ASSET_ADDRESS());
    }

    function getAmountToClaim() external view returns (uint256) {
        address[] memory assets = new address[](1);
        assets[0] = address(aToken);

        uint256 amountToClaim = incentivesController.getRewardsBalance(assets, address(this));

        return amountToClaim;
    }

    // front run, sandwich attack
    function claimRewards(uint _amountOutMin, uint _deadline) external whenNotPaused onlyRole(HARVESTER_ROLE) {
        address[] memory claimAssets = new address[](1);
        claimAssets[0] = address(aToken);

        uint256 amountToClaim = incentivesController.getRewardsBalance(claimAssets, address(this));
        uint256 amountClaimed = incentivesController.claimRewards(claimAssets, amountToClaim, address(this));

        require(rewardToken.approve(address(dexRouter), amountClaimed), "approve failed."); // TODO: check for duplication
        uint amount = _swapTokenToToken(
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

    function _withdraw(uint256 _nftTokenId, address _receiver) internal returns (uint) {

        uint currentAmountOfAToken = aToken.balanceOf(address(this));

        uint amountToWithdraw = balanceOf[_nftTokenId] * currentAmountOfAToken / totalSupply;

        totalSupply = totalSupply - balanceOf[_nftTokenId];

        balanceOf[_nftTokenId] = 0;

        yNFT.burn(_nftTokenId);

        return pool.withdraw(address(underlyingToken), amountToWithdraw, _receiver);
    }

    function _deposit(uint _tokenAmount) virtual internal {
       uint256 tokenId = yNFT.mint(msg.sender);

       require(underlyingToken.approve(address(pool), _tokenAmount), "approve failed.");

        uint currentAmountOfAToken = aToken.balanceOf(address(this));

        pool.deposit(address(underlyingToken), _tokenAmount, address(this), 0);

        if (totalSupply == 0) {
            balanceOf[tokenId] = _tokenAmount;
            totalSupply = _tokenAmount;
        } else {
            uint balance = _tokenAmount * totalSupply / currentAmountOfAToken;

            balanceOf[tokenId] = balance;

            totalSupply = totalSupply + balance;
        }
    }

    function withdrawToUnderlyingTokens(uint256 _nftTokenId) external whenNotPaused onlyNftOwner(_nftTokenId) {

        _withdraw(_nftTokenId, msg.sender);
    }

    function withdrawToEther(uint256 _nftTokenId, uint _amountOutMin, uint _deadline) external whenNotPaused onlyNftOwner(_nftTokenId) {
        uint amount = _withdraw(_nftTokenId, address(this));

       _swapTokenToETH(msg.sender, amount, _amountOutMin, address(underlyingToken), _deadline);
    }

    function createYNFT(address _tokenIn, uint _amountIn, uint _amountOutMin, uint _deadline) external whenNotPaused {

        uint amountInToBuy = _amountIn - _collectFeeToken(_tokenIn, _amountIn);

        if(_tokenIn == address(underlyingToken)) {
            _deposit(amountInToBuy);
        } else {
            IERC20(_tokenIn).safeTransferFrom(msg.sender, address(this), amountInToBuy);
            uint amount = _swapTokenToToken(
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

    function createYNFTForEther(uint _amountOutMin, uint _deadline) external whenNotPaused payable {
        uint amountToBuy = msg.value - _collectFeeEther();

        uint amount = _swapETHToToken(address(this), amountToBuy, _amountOutMin, address(underlyingToken), _deadline);

        _deposit(amount);
    }
}
