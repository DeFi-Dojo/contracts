
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import "@openzeppelin/contracts/utils/Counters.sol";
import "./sushiswap/uniswapv2/interfaces/IUniswapV2Router02.sol";
import "./YNFT.sol";


contract YNFTFactory {
    YNFT public immutable yNFT;
    IUniswapV2Router02 public immutable dexRouter;
    address private daiAddress = 0x639cB7b21ee2161DF9c882483C9D55c90c20Ca3e;

    constructor(address _dexRouter) {
        yNFT = new YNFT();
        dexRouter = IUniswapV2Router02(_dexRouter);
    }

    function createYNFT(address user) public payable {
        uint256 tokenId = yNFT.mint(user);
        uint deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
        uint[] memory amounts = dexRouter.swapETHForExactTokens{ value: msg.value }(getEstimatedDAIforETH(msg.value), getPathForDAItoETH(), address(this), deadline);

        // refund leftover ETH to user
        (bool success,) = msg.sender.call{ value: address(this).balance }("");
        require(success, "refund failed");
    }

    function getEstimatedDAIforETH(uint ethAmount) public view returns (uint) {
        return dexRouter.getAmountsIn(ethAmount, getPathForDAItoETH())[0];
    }

  function getPathForDAItoETH() private view returns (address[] memory) {
    address[] memory path = new address[](2);
    path[0] = daiAddress;
    path[1] = dexRouter.WETH();
    return path;
  }
}
