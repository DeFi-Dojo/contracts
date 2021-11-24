
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./sushiswap/uniswapv2/interfaces/IUniswapV2Router02.sol";
import "./sushiswap/uniswapv2/interfaces/IUniswapV2Pair.sol";
import "./YNFT.sol";


contract DexYNFTVault is Ownable {
    using SafeERC20 for IERC20;

    mapping (uint256 => uint) public balanceOf;
    IERC721 public nftToken;
    YNFT public immutable yNFT;
    IUniswapV2Router02 public dexRouter;
    uint public feePercentage = 1;
    IERC20 public firstToken;
    IERC20 public secondToken;
    IUniswapV2Pair public pair;

    modifier onlyNftOwner(uint nftTokenId) {
        address owner = yNFT.ownerOf(nftTokenId);
        require(owner == msg.sender, 'Sender is not owner of the NFT');
        _;
    }

    constructor(
        IUniswapV2Router02 _dexRouter,
        IUniswapV2Pair _pair
    ) {
        yNFT = new YNFT();
        dexRouter = _dexRouter;
        pair = _pair;
        firstToken = IERC20(pair.token0());
        secondToken = IERC20(pair.token1());
    }

    function setFee(uint _feePercentage)  external onlyOwner returns (uint) {
        feePercentage = _feePercentage;
        return feePercentage;
    }

    function calcFee(uint price) internal view returns (uint) {
        return (price * feePercentage) / 100;
    }

    function _mintYNFTForLiquidity(uint liquidity) private {
        uint256 tokenId = yNFT.mint(msg.sender);
        balanceOf[tokenId] = liquidity;
    }

    function _collectFee() private returns (uint){
        uint fee = calcFee(msg.value);
        payable(owner()).transfer(fee);
        return fee;
    }


    function _swapETHToToken(uint _amountInEth, uint _amountOutToken, address token, uint deadline) private returns (uint){
        address[] memory path = new address[](2);
        path[0] = dexRouter.WETH();
        path[1] = token;

        uint[] memory amounts = dexRouter.swapExactETHForTokens{ value: _amountInEth }(_amountOutToken, path, address(this), deadline);

        return amounts[1];
    }


    function createYNFTForEther(
     uint _amountOutMinFirstToken,
     uint _amountOutMinSecondToken,
     uint _amountMinLiqudityFirstToken,
     uint _amountMinLiquditySecondToken,
     uint deadline
      ) public payable {
        uint amountToBuyOneAsstet = (msg.value - _collectFee()) / 2;

        uint amountFirstToken = _swapETHToToken(amountToBuyOneAsstet, _amountOutMinFirstToken, address(firstToken), deadline);

        uint amountSecondToken = _swapETHToToken(amountToBuyOneAsstet, _amountOutMinSecondToken, address(secondToken), deadline);

       require(firstToken.approve(address(dexRouter), amountFirstToken), 'approve failed.');

       require(secondToken.approve(address(dexRouter), amountSecondToken), 'approve failed.');

        (,, uint liquidity) = dexRouter.addLiquidity(
            address(firstToken),
            address(secondToken),
            amountFirstToken,
            amountSecondToken,
            _amountMinLiqudityFirstToken,
            _amountMinLiquditySecondToken,
            address(this),
            deadline
        );

        _mintYNFTForLiquidity(liquidity);
    }
}
