
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./sushiswap/uniswapv2/interfaces/IUniswapV2Router02.sol";
// import "./sushiswap/uniswapv2/interfaces/IUniswapV2Factory.sol";
import "./YNFT.sol";


contract YNFTFactory {
    YNFT public immutable yNFT;
    IUniswapV2Router02 public immutable dexRouter;
    IERC20 public immutable DAI;
    // IUniswapV2Factory public immutable override factory;

    address private daiAddress = 0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa;

    constructor(address _dexRouter) {
        yNFT = new YNFT();
        dexRouter = IUniswapV2Router02(_dexRouter);
        DAI = IERC20(daiAddress);
        // factory = IUniswapV2Factory(dexRouter.factory);
    }

    function createYNFT(address user, uint _amountIn, uint _amountOutMin) public {
        uint256 tokenId = yNFT.mint(user);

        require(DAI.transferFrom(msg.sender, address(this), _amountIn), 'transferFrom failed.');

        uint deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
        address[] memory path = new address[](2);
        path[0] = daiAddress;
        path[1] = dexRouter.WETH();

        require(DAI.approve(address(dexRouter), _amountIn), 'approve failed.');

        dexRouter.swapExactTokensForETH(_amountIn, _amountOutMin, path, user, deadline);
    }

    // function getAmountOutMin(uint256 _amountIn) external view returns (uint256) {

    //     address[] memory path = new address[](2);
    //     path[0] = daiAddress;
    //     path[1] = dexRouter.WETH();
    //     uint256[] memory amountOutMins = dexRouter.getAmountsOut(_amountIn, path);
    //     return amountOutMins[path.length -1];
    // }

  // function getPathForDAItoETH() public view returns (address[] memory) {
  //   address[] memory path = new address[](2);
  //   path[0] = dexRouter.WETH();
  //   path[1] = daiAddress;
  //   return path;
  // }
}
