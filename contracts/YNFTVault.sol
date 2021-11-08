
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./sushiswap/uniswapv2/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/aave/ILendingPool.sol";
import "./interfaces/aave/IAToken.sol";
import "./YNFT.sol";


contract YNFTVault is Ownable {
    using SafeERC20 for IAToken;
    using SafeERC20 for IERC20;

    mapping (uint256 => uint) public balanceOf;
    IAToken public aToken;
    IERC721 public nftToken;
    ILendingPool public pool;

    YNFT public immutable yNFT;
    IUniswapV2Router02 public immutable dexRouter;
    IERC20 public immutable token;

    constructor(address _dexRouter, IAToken _aToken) {
        aToken = _aToken;
        pool = ILendingPool(aToken.POOL());
        yNFT = new YNFT();
        dexRouter = IUniswapV2Router02(_dexRouter);
        token = IERC20(aToken.UNDERLYING_ASSET_ADDRESS());
    }

    function addLPtoNFT(uint256 nftTokenId, uint tokenAmount) internal returns (bool) {
       require(token.approve(address(pool), tokenAmount), 'approve failed.');

        pool.deposit(address(token), tokenAmount, address(this), 0);
        balanceOf[nftTokenId] = tokenAmount;
        return true;
    }

    function withdraw(uint256 nftTokenId) public returns (bool) {
        address owner = yNFT.ownerOf(nftTokenId);
        require(owner == msg.sender, 'Sender is not owner of the NFT');

        pool.withdraw(address(token), balanceOf[nftTokenId], msg.sender);

        yNFT.burn(nftTokenId);

        return true;
    }

    function createYNFT(address tokenIn, uint _amountIn, uint _amountOutMin) public {
        uint256 tokenId = yNFT.mint(msg.sender);

        require(token.transferFrom(msg.sender, address(this), _amountIn), 'transferFrom failed.');

        uint deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = address(token);

        require(token.approve(address(dexRouter), _amountIn), 'approve failed.');

        dexRouter.swapExactTokensForETH(_amountIn, _amountOutMin, path, msg.sender, deadline);
    }

    function createYNFTForEther(uint _amountOutMin) public payable {
        uint256 tokenId = yNFT.mint(msg.sender);

        uint deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
        address[] memory path = new address[](2);
        path[0] = dexRouter.WETH();
        path[1] = address(token);

        uint[] memory amounts = dexRouter.swapExactETHForTokens{ value: msg.value }(_amountOutMin, path, address(this), deadline);

        addLPtoNFT(tokenId, amounts[1]);
    }
}
