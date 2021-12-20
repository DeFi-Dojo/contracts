
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/uniswapv2/IUniswapV2Router02.sol";
import "./interfaces/uniswapv2/IUniswapV2Pair.sol";
import "./interfaces/sushiswap/IMiniChefV2.sol";
import "./YNFT.sol";


contract DexYNFTVault is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    mapping (uint256 => uint) public balanceOf;
    IERC721 public nftToken;
    YNFT public immutable yNFT;
    IUniswapV2Router02 immutable public dexRouter;
    uint public feePercentage = 1;
    IERC20 immutable public firstToken;
    IERC20 immutable public secondToken;
    IUniswapV2Pair immutable public pair;
    IMiniChefV2 immutable public masterChef;
    uint immutable public chefPoolPid;
    address public beneficiary;

    bytes32 public constant CLAIMER_ROLE = keccak256("CLAIMER_ROLE");

    modifier onlyNftOwner(uint _nftTokenId) {
        address owner = yNFT.ownerOf(_nftTokenId);
        require(owner == msg.sender, "Sender is not owner of the NFT");
        _;
    }

    constructor(
        IUniswapV2Router02 _dexRouter,
        IUniswapV2Pair _pair,
        IMiniChefV2 _masterChef,
        uint32 _chefPoolPid,
        address _claimer
    ) {
        yNFT = new YNFT();
        dexRouter = _dexRouter;
        pair = _pair;
        masterChef = _masterChef;
        chefPoolPid = _chefPoolPid;
        firstToken = IERC20(_pair.token0());
        secondToken = IERC20(_pair.token1());
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(CLAIMER_ROLE, _claimer);
        beneficiary = msg.sender;
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function setFee(uint _feePercentage) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint) {
        require(_feePercentage <= 10, "Fee cannot be that much");
        feePercentage = _feePercentage;
        return feePercentage;
    }

    function depositHarvestedTokens(
        address _tokenIn,
        uint _amountOutMinFirstToken,
        uint _amountOutMinSecondToken,
        uint _amountMinLiqudityFirstToken,
        uint _amountMinLiquditySecondToken,
        uint _deadline
    ) external onlyRole(CLAIMER_ROLE) whenNotPaused {
        require(_tokenIn != address(pair), "Cannot deposit LP tokens");

        uint balance = IERC20(_tokenIn).balanceOf(address(_tokenIn));

        uint amountToBuyOneAsstet = balance / 2;

        uint liquidity = _depositLiquidityForToken(
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

    function depositHarvestedETH(
        uint _amountOutMinFirstToken,
        uint _amountOutMinSecondToken,
        uint _amountMinLiqudityFirstToken,
        uint _amountMinLiquditySecondToken,
        uint _deadline
    ) external onlyRole(CLAIMER_ROLE) whenNotPaused {
        uint balance = address(this).balance;

        uint amountToBuyOneAsstet = balance / 2;

        uint liquidity = _depositLiquidityForEther(amountToBuyOneAsstet, _amountOutMinFirstToken, _amountOutMinSecondToken, _amountMinLiqudityFirstToken, _amountMinLiquditySecondToken, _deadline);

        _farmLiquidity(liquidity);
    }

    function setBeneficiary(address _beneficiary) external onlyRole(DEFAULT_ADMIN_ROLE) {
        beneficiary = _beneficiary;
    }

    function harvest() external onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
        masterChef.harvest(chefPoolPid, address(this));
    }

    function _withrdrawFromFarm(uint _balance) private {
        masterChef.withdraw(chefPoolPid, _balance, address(this));
    }

    function _farmLiquidity(uint _liquidity) private {
        require(pair.approve(address(masterChef), _liquidity), "approve failed.");
        masterChef.deposit(chefPoolPid, _liquidity, address(this));
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
        //solhint-disable-next-line avoid-low-level-calls
        (bool success, ) = beneficiary.call{value: fee}("");
        require(success, "Transfer failed.");
        return fee;
    }

    function _collectFeeToken(address _tokenIn, uint _tokenAmount) private returns (uint){
        uint fee = _calcFee(_tokenAmount);
        IERC20(_tokenIn).safeTransferFrom(msg.sender, beneficiary, fee);
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

    function _depositLiquidityForEther(
        uint _amountToBuyOneAsstet,
        uint _amountOutMinFirstToken,
        uint _amountOutMinSecondToken,
        uint _amountMinLiqudityFirstToken,
        uint _amountMinLiquditySecondToken,
        uint _deadline
      ) private returns (uint){
        uint amountSecondToken = _swapETHToToken(address(this), _amountToBuyOneAsstet, _amountOutMinSecondToken, address(secondToken), _deadline);

        require(secondToken.approve(address(dexRouter), amountSecondToken), "approve failed.");

        uint liquidity;
        if (address(firstToken) == dexRouter.WETH()) {
            (,, liquidity) = dexRouter.addLiquidityETH{ value: _amountToBuyOneAsstet }(
                address(secondToken),
                amountSecondToken,
                _amountMinLiquditySecondToken,
                _amountMinLiqudityFirstToken,
                address(this),
                _deadline
            );
        } else {
            uint amountFirstToken = _swapETHToToken(address(this), _amountToBuyOneAsstet, _amountOutMinFirstToken, address(firstToken), _deadline);
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
        return liquidity;

    }

    function _depositLiquidityForToken(
        address _tokenIn,
        uint _amountToBuyOneAsstet,
        uint _amountOutMinFirstToken,
        uint _amountOutMinSecondToken,
        uint _amountMinLiqudityFirstToken,
        uint _amountMinLiquditySecondToken,
        uint _deadline
      ) private returns (uint){

        uint amountFirstToken;
        if (_tokenIn == address(firstToken)) {
            amountFirstToken = _amountToBuyOneAsstet;
        } else {
            amountFirstToken = _swapTokenToToken(address(this), _amountToBuyOneAsstet, _amountOutMinFirstToken, _tokenIn, address(firstToken), _deadline);
        }
        require(firstToken.approve(address(dexRouter), amountFirstToken), "approve failed.");


        uint amountSecondToken;
        if (_tokenIn == address(secondToken)) {
            amountSecondToken = _amountToBuyOneAsstet;
        } else {
            amountSecondToken = _swapTokenToToken(address(this), _amountToBuyOneAsstet, _amountOutMinSecondToken, _tokenIn, address(secondToken), _deadline);
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

        return liquidity;
    }

    function withdrawToEther(uint256 _nftTokenId,  uint _amountOutMinFirstToken, uint _amountOutMinSecondToken, uint _amountOutETH, uint _deadline) external whenNotPaused nonReentrant onlyNftOwner(_nftTokenId) {

        uint balance = balanceOf[_nftTokenId];

        balanceOf[_nftTokenId] = 0;

        _withrdrawFromFarm(balance);

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
            _swapTokenToETH(msg.sender, amountFirstToken, _amountOutETH / 2, address(firstToken), _deadline);
        }

        _swapTokenToETH(msg.sender, amountSecondToken, _amountOutETH / 2, address(secondToken), _deadline);

        yNFT.burn(_nftTokenId);
    }

    function withdrawToUnderlyingTokens(uint256 _nftTokenId,  uint _amountOutMinFirstToken, uint _amountOutMinSecondToken, uint _deadline) external whenNotPaused onlyNftOwner(_nftTokenId) returns (bool) {

        uint balance = balanceOf[_nftTokenId];

        _withrdrawFromFarm(balance);

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
      ) external whenNotPaused {

        uint amountInToBuy = _amountIn - _collectFeeToken(_tokenIn, _amountIn);

        IERC20(_tokenIn).safeTransferFrom(msg.sender, address(this), amountInToBuy);

        uint amountToBuyOneAsstet = amountInToBuy / 2;

        uint liquidity = _depositLiquidityForToken(_tokenIn, amountToBuyOneAsstet, _amountOutMinFirstToken, _amountOutMinSecondToken, _amountMinLiqudityFirstToken, _amountMinLiquditySecondToken, _deadline);

        _mintYNFTForLiquidity(liquidity);
        _farmLiquidity(liquidity);
    }


    function createYNFTForEther(
     uint _amountOutMinFirstToken,
     uint _amountOutMinSecondToken,
     uint _amountMinLiqudityFirstToken,
     uint _amountMinLiquditySecondToken,
     uint _deadline
      ) external payable whenNotPaused {
        uint amountToBuyOneAsstet = (msg.value - _collectFeeEther()) / 2;

        uint liquidity = _depositLiquidityForEther(amountToBuyOneAsstet, _amountOutMinFirstToken, _amountOutMinSecondToken, _amountMinLiqudityFirstToken, _amountMinLiquditySecondToken, _deadline);

        _mintYNFTForLiquidity(liquidity);
        _farmLiquidity(liquidity);
    }

     receive() external payable {
     }
}
