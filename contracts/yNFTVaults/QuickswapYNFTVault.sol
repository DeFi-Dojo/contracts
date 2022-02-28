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
    IStakingRewards public immutable dragonSyrup;
    IERC20 public immutable dQuick;

    constructor(
        IUniswapV2Router02 _dexRouter,
        IUniswapV2Pair _pair,
        IStakingDualRewards _stakingDualRewards,
        IStakingRewards _dragonSyrup,
        IERC20 _dQuick,
        address _harvester,
        address _beneficiary
    ) YNFTVault(_dexRouter, _harvester, _beneficiary) {
        pair = _pair;
        stakingDualRewards = _stakingDualRewards;
        dragonSyrup = _dragonSyrup;
        dQuick = _dQuick;
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
    }

    function getRewardLPMining()
        external
        onlyRole(HARVESTER_ROLE)
        whenNotPaused
    {
        stakingDualRewards.getReward();
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

    function getRewardFromDragonSyrup()
        external
        onlyRole(HARVESTER_ROLE)
        whenNotPaused
    {
        dragonSyrup.getReward();
    }

    function farmDQuick() external onlyRole(HARVESTER_ROLE) whenNotPaused {
        uint256 balance = dQuick.balanceOf(address(this));
        require(
            dQuick.approve(address(dragonSyrup), balance),
            "approve failed."
        );
        dragonSyrup.stake(balance);
    }

    function withdrawDQuick(uint256 _amount)
        external
        onlyRole(HARVESTER_ROLE)
        whenNotPaused
    {
        dragonSyrup.withdraw(_amount);
    }

    function exitDQuick() external onlyRole(HARVESTER_ROLE) whenNotPaused {
        dragonSyrup.exit();
    }

    function _mintYNFTForLiquidity(uint256 _liquidity) private {
        uint256 tokenId = yNFT.mint(msg.sender);
        balanceOf[tokenId] = _liquidity;
    }

    // TODO BUG: Cannot buy yNFT for WMATIC in WMATIC/USDT pool on quickswap https://jira.minebest.com/browse/DEX-322
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
            (, , liquidity) = dexRouter.addLiquidityETH{
                value: _amountToBuyOneAsstet
            }(
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
        require(
            firstToken.approve(address(dexRouter), amountFirstToken),
            "approve failed."
        );

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

    function withdrawToEther(
        uint256 _nftTokenId,
        uint256 _amountOutMinFirstToken,
        uint256 _amountOutMinSecondToken,
        uint256 _amountOutETH,
        uint256 _deadline
    ) external whenNotPaused nonReentrant onlyNftOwner(_nftTokenId) {
        uint256 balance = balanceOf[_nftTokenId];

        balanceOf[_nftTokenId] = 0;

        _withrdrawFromLPMining(balance);

        require(pair.approve(address(dexRouter), balance), "approve failed.");

        uint256 amountFirstToken;
        uint256 amountSecondToken;

        if (address(firstToken) == dexRouter.WETH()) {
            (amountSecondToken, amountFirstToken) = dexRouter
                .removeLiquidityETH(
                    address(secondToken),
                    balance,
                    _amountOutMinSecondToken,
                    _amountOutMinFirstToken,
                    address(this),
                    _deadline
                );

            //solhint-disable-next-line avoid-low-level-calls
            (bool success, ) = msg.sender.call{value: amountFirstToken}("");
            require(success, "Transfer failed.");
        } else {
            (amountFirstToken, amountSecondToken) = dexRouter.removeLiquidity(
                address(firstToken),
                address(secondToken),
                balance,
                _amountOutMinFirstToken,
                _amountOutMinSecondToken,
                address(this),
                _deadline
            );
            _swapTokenToETH(
                msg.sender,
                amountFirstToken,
                _amountOutETH / 2,
                address(firstToken),
                _deadline
            );
        }

        _swapTokenToETH(
            msg.sender,
            amountSecondToken,
            _amountOutETH / 2,
            address(secondToken),
            _deadline
        );

        yNFT.burn(_nftTokenId);
    }

    function withdrawToUnderlyingTokens(
        uint256 _nftTokenId,
        uint256 _amountOutMinFirstToken,
        uint256 _amountOutMinSecondToken,
        uint256 _deadline
    ) external whenNotPaused onlyNftOwner(_nftTokenId) {
        uint256 balance = balanceOf[_nftTokenId];

        balanceOf[_nftTokenId] = 0;

        _withrdrawFromLPMining(balance);

        require(pair.approve(address(dexRouter), balance), "approve failed.");

        if (address(firstToken) == dexRouter.WETH()) {
            dexRouter.removeLiquidityETH(
                address(secondToken),
                balance,
                _amountOutMinSecondToken,
                _amountOutMinFirstToken,
                msg.sender,
                _deadline
            );
        } else {
            dexRouter.removeLiquidity(
                address(firstToken),
                address(secondToken),
                balance,
                _amountOutMinFirstToken,
                _amountOutMinSecondToken,
                msg.sender,
                _deadline
            );
        }

        yNFT.burn(_nftTokenId);
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
        uint256 amountInToBuy = _amountIn -
            _collectFeeToken(_tokenIn, _amountIn);

        IERC20(_tokenIn).safeTransferFrom(
            msg.sender,
            address(this),
            amountInToBuy
        );

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

        _mintYNFTForLiquidity(liquidity);
        _farmLiquidity(liquidity);
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

        _mintYNFTForLiquidity(liquidity);
        _farmLiquidity(liquidity);
    }

    // TODO: create quickswap specific implemetation
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
    {}
}
