
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/uniswapv2/IUniswapV2Router02.sol";
import "./interfaces/uniswapv2/IUniswapV2Pair.sol";
import "./YNFT.sol";


contract DexYNFTVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    mapping (uint256 => uint) public balanceOf;
    IERC721 public nftToken;
    YNFT public immutable yNFT;
    IUniswapV2Router02 immutable public dexRouter;
    uint public feePercentage = 1;
    IERC20 public firstToken;
    IERC20 public secondToken;
    IUniswapV2Pair public pair;

    modifier onlyNftOwner(uint _nftTokenId) {
        address owner = yNFT.ownerOf(_nftTokenId);
        require(owner == msg.sender, "Sender is not owner of the NFT");
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

    function setFee(uint _feePercentage) external onlyOwner returns (uint) {
        feePercentage = _feePercentage;
        return feePercentage;
    }

    function _mintYNFTForLiquidity(uint _liquidity) private {
        uint256 tokenId = yNFT.mint(msg.sender);
        balanceOf[tokenId] = _liquidity;
    }

    function _calcFee(uint _price) private view returns (uint) {
        return (_price * feePercentage) / 100;
    }

    function _collectFeeEther() private nonReentrant returns (uint){
        uint fee = _calcFee(msg.value);
        (bool success, ) = owner().call{value: fee}("");
        require(success, "Transfer failed.");
        return fee;
    }

    function _collectFeeToken(address _tokenIn, uint _tokenAmount) private returns (uint){
        uint fee = _calcFee(_tokenAmount);
        IERC20(_tokenIn).safeTransferFrom(msg.sender, owner(), fee);
        return fee;
    }

    function _swapTokenToETH(address _receiver, uint _amountInToken, uint _amountOutETH, address _tokenIn, uint _deadline) private returns (uint){
        address[] memory path = new address[](2);
        path[0] =  _tokenIn;
        path[1] =  dexRouter.WETH();

        require(IERC20(_tokenIn).approve(address(dexRouter), _amountInToken), "approve failed.");

        uint[] memory amounts = dexRouter.swapExactTokensForETH(_amountInToken, _amountOutETH, path, _receiver, _deadline);

        return amounts[1];
    }

    function _swapETHToToken(address _receiver, uint _amountInEth, uint _amountOutToken, address _token, uint _deadline) private returns (uint){
        address[] memory path = new address[](2);
        path[0] = dexRouter.WETH();
        path[1] = _token;

        uint[] memory amounts = dexRouter.swapExactETHForTokens{ value: _amountInEth }(_amountOutToken, path, _receiver, _deadline);

        return amounts[1];
    }

    function _swapTokenToToken(address _receiver, uint _amountIn, uint _amountOut, address _tokenIn, address _tokenOut, uint _deadline) private returns (uint){
        address[] memory path = new address[](2);
        path[0] = _tokenIn;
        path[1] = _tokenOut;

        require(IERC20(_tokenIn).approve(address(dexRouter), _amountIn), "approve failed.");

        uint[] memory amounts = dexRouter.swapExactTokensForTokens(_amountIn, _amountOut, path, _receiver, _deadline);

        return amounts[1];
    }

    function withdrawToEther(uint256 _nftTokenId,  uint _amountOutMinFirstToken, uint _amountOutMinSecondToken, uint _amountOutETH, uint _deadline) external nonReentrant onlyNftOwner(_nftTokenId) returns (bool) {

        uint balance = balanceOf[_nftTokenId];

        balanceOf[_nftTokenId] = 0;

        require(pair.approve(address(dexRouter), balance), "approve failed.");


        uint amountFirstToken;
        uint amountSecondToken;

        if (address(firstToken) == dexRouter.WETH()) {
            (amountSecondToken, amountFirstToken) = dexRouter.removeLiquidityETH(
                address(secondToken),
                balance,
                _amountOutMinSecondToken,
                _amountOutMinFirstToken,
                address(this),
                _deadline
            );

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
            _swapTokenToETH(msg.sender, amountFirstToken, _amountOutETH / 2, address(firstToken), _deadline);
        }

        _swapTokenToETH(msg.sender, amountSecondToken, _amountOutETH / 2, address(secondToken), _deadline);

        yNFT.burn(_nftTokenId);

        return true;
    }

    function withdrawToUnderlyingTokens(uint256 _nftTokenId,  uint _amountOutMinFirstToken, uint _amountOutMinSecondToken, uint _deadline) external onlyNftOwner(_nftTokenId) returns (bool) {

        uint balance = balanceOf[_nftTokenId];

        balanceOf[_nftTokenId] = 0;

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

        return true;
    }

    function createYNFT(
        address _tokenIn,
        uint _amountIn,
        uint _amountOutMinFirstToken,
        uint _amountOutMinSecondToken,
        uint _amountMinLiqudityFirstToken,
        uint _amountMinLiquditySecondToken,
        uint _deadline
      ) external {

        uint amountInToBuy = _amountIn - _collectFeeToken(_tokenIn, _amountIn);

        IERC20(_tokenIn).safeTransferFrom(msg.sender, address(this), amountInToBuy);

        uint amountToBuyOneAsstet = amountInToBuy / 2;

        uint amountFirstToken;
        if (_tokenIn == address(firstToken)) {
            amountFirstToken = amountToBuyOneAsstet;
        } else {
            amountFirstToken = _swapTokenToToken(address(this), amountToBuyOneAsstet, _amountOutMinFirstToken, _tokenIn, address(firstToken), _deadline);
        }
        require(firstToken.approve(address(dexRouter), amountFirstToken), "approve failed.");


        uint amountSecondToken;
        if (_tokenIn == address(secondToken)) {
            amountSecondToken = amountToBuyOneAsstet;
        } else {
            amountSecondToken = _swapTokenToToken(address(this), amountToBuyOneAsstet, _amountOutMinSecondToken, _tokenIn, address(secondToken), _deadline);
        }
        require(secondToken.approve(address(dexRouter), amountSecondToken), "approve failed.");

        (,, uint liquidity) = dexRouter.addLiquidity(
                address(firstToken),
                address(secondToken),
                amountFirstToken,
                amountSecondToken,
                _amountMinLiqudityFirstToken,
                _amountMinLiquditySecondToken,
                address(this),
                _deadline
            );

        _mintYNFTForLiquidity(liquidity);

    }


    function createYNFTForEther(
     uint _amountOutMinFirstToken,
     uint _amountOutMinSecondToken,
     uint _amountMinLiqudityFirstToken,
     uint _amountMinLiquditySecondToken,
     uint _deadline
      ) external payable {
        uint amountToBuyOneAsstet = (msg.value - _collectFeeEther()) / 2;

        uint amountSecondToken = _swapETHToToken(address(this), amountToBuyOneAsstet, _amountOutMinSecondToken, address(secondToken), _deadline);

        require(secondToken.approve(address(dexRouter), amountSecondToken), "approve failed.");

        uint liquidity;
        if (address(firstToken) == dexRouter.WETH()) {
            (,, liquidity) = dexRouter.addLiquidityETH{ value: amountToBuyOneAsstet }(
                address(secondToken),
                amountSecondToken,
                _amountMinLiquditySecondToken,
                _amountMinLiqudityFirstToken,
                address(this),
                _deadline
            );
        } else {
            uint amountFirstToken = _swapETHToToken(address(this), amountToBuyOneAsstet, _amountOutMinFirstToken, address(firstToken), _deadline);
            require(firstToken.approve(address(dexRouter), amountFirstToken), "approve failed.");
            (,, liquidity) = dexRouter.addLiquidity(
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
        _mintYNFTForLiquidity(liquidity);

    }

    // solhint-disable-next-line
     receive() external payable {
     }
}
