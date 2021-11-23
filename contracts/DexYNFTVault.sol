
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./sushiswap/uniswapv2/interfaces/IUniswapV2Router02.sol";
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

    modifier onlyNftOwner(uint nftTokenId) {
        address owner = yNFT.ownerOf(nftTokenId);
        require(owner == msg.sender, 'Sender is not owner of the NFT');
        _;
    }

    constructor(
        IUniswapV2Router02 _dexRouter,
        IERC20 _firstToken,
        IERC20 _secondToken
    ) {
        yNFT = new YNFT();
        dexRouter = _dexRouter;
        firstToken = _firstToken;
        secondToken = _secondToken;
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


    function createYNFTForEther(
     uint _amountOutMinFirstToken,
     uint _amountOutMinSecondToken,
     uint _amountMinLiqudityFirstToken,
     uint _amountMinLiquditySecondToken,
     uint deadline
      ) public payable {
        uint amountToBuyOneAsstet = (msg.value - _collectFee()) / 2;

        address[] memory pathFirstToken = new address[](2);
        pathFirstToken[0] = dexRouter.WETH();
        pathFirstToken[1] = address(firstToken);

        uint[] memory amountsFirstToken = dexRouter.swapExactETHForTokens{ value: amountToBuyOneAsstet }(_amountOutMinFirstToken, pathFirstToken, address(this), deadline);

        address[] memory pathSecondToken = new address[](2);
        pathSecondToken[0] = dexRouter.WETH();
        pathSecondToken[1] = address(secondToken);

        uint[] memory amountsSecondToken = dexRouter.swapExactETHForTokens{ value: amountToBuyOneAsstet }(_amountOutMinSecondToken, pathSecondToken, address(this), deadline);

       require(firstToken.approve(address(dexRouter), amountsFirstToken[1]), 'approve failed.');

       require(secondToken.approve(address(dexRouter), amountsSecondToken[1]), 'approve failed.');

        (,, uint liquidity) = dexRouter.addLiquidity(
            address(firstToken),
            address(secondToken),
            amountsFirstToken[1],
            amountsSecondToken[1],
            _amountMinLiqudityFirstToken,
            _amountMinLiquditySecondToken,
            address(this),
            deadline
        );

        _mintYNFTForLiquidity(liquidity);
    }
}
