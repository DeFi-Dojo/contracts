// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; // suing v3 to be compatible with IUniswapV2Pair

import "./sushiswap/uniswapv2/interfaces/IUniswapV2Pair.sol";
import "./sushiswap/uniswapv2/interfaces/IUniswapV2Router02.sol";

contract SushiLPNFT {
    using SafeERC20 for IUniswapV2Pair;
    using SafeERC20 for IERC20;

    mapping (uint256 => uint) public balanceOf;
    IERC721 public immutable nftToken;
    IUniswapV2Pair public immutable pair;
    IUniswapV2Router02 public immutable router;

    constructor(IUniswapV2Pair _pair, IUniswapV2Router02 _router, IERC721 _nftToken) {
      pair = _pair;
      router = _router;
      nftToken = _nftToken;
    }

    function addLPtoNFT(uint256 nftTokenId, uint tokenAmount) public returns (bool) {
        // todo: replace this with `safeTransferFrom`, but that requires using different dependencies
        // For now, for PoC purposes, this will suffice
        pair.transferFrom(msg.sender, address(this), tokenAmount);
        balanceOf[nftTokenId] += tokenAmount;
        return true;
    }

    function redeemLPTokens(uint256 nftTokenId, uint tokenAmount) public returns (bool) {
        require(tokenAmount <= balanceOf[nftTokenId], 'Amount exeeds balance');

        address owner = nftToken.ownerOf(nftTokenId);
        require(owner == msg.sender, 'Sender is not owner of the NFT');

        balanceOf[nftTokenId] -= tokenAmount;
        
        uint totalSupply = pair.totalSupply();
        address token0 = pair.token0();
        address token1 = pair.token1();

        uint token0InPair = IERC20(token0).balanceOf(address(pair));
        uint token1InPair = IERC20(token1).balanceOf(address(pair));
        uint amount0Min = token0InPair * tokenAmount / totalSupply;
        uint amount1Min = token1InPair * tokenAmount / totalSupply;

        pair.approve(address(router), tokenAmount);
        router.removeLiquidity(
            token0, 
            token1, 
            tokenAmount, 
            amount0Min, 
            amount1Min, 
            msg.sender, 
            block.timestamp + 10000
        );

        return true;
    }

}