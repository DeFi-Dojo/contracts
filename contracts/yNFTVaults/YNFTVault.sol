
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "../interfaces/uniswapv2/IUniswapV2Router02.sol";
import "../interfaces/uniswapv2/IUniswapV2Pair.sol";
import "./YNFT.sol";


abstract contract YNFTVault is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    mapping (uint256 => uint) public balanceOf;
    IERC721 public nftToken;
    YNFT public immutable yNFT;
    IUniswapV2Router02 immutable public dexRouter;
    uint public feePerMile = 5;
    address public beneficiary;

    bytes32 public constant HARVESTER_ROLE = keccak256("HARVESTER_ROLE");

    modifier onlyNftOwner(uint _nftTokenId) {
        address owner = yNFT.ownerOf(_nftTokenId);
        require(owner == msg.sender, "Sender is not owner of the NFT");
        _;
    }

    constructor(
        IUniswapV2Router02 _dexRouter,
        address _harvester
    ) {
        yNFT = new YNFT();
        dexRouter = _dexRouter;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(HARVESTER_ROLE, _harvester);
        beneficiary = msg.sender;
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function setFee(uint _feePerMile) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint) {
        require(_feePerMile <= 100, "Fee cannot be that much");
        feePerMile = _feePerMile;
        return feePerMile;
    }


    function setBeneficiary(address _beneficiary) external onlyRole(DEFAULT_ADMIN_ROLE) {
        beneficiary = _beneficiary;
    }

    function _calcFee(uint _price) internal view returns (uint) {
        return (_price * feePerMile) / 1000;
    }

    function _collectFeeEther() internal nonReentrant returns (uint){
        uint fee = _calcFee(msg.value);
        //solhint-disable-next-line avoid-low-level-calls
        (bool success, ) = beneficiary.call{value: fee}("");
        require(success, "Transfer failed.");
        return fee;
    }

    function _collectFeeToken(address _tokenIn, uint _tokenAmount) internal returns (uint){
        uint fee = _calcFee(_tokenAmount);
        IERC20(_tokenIn).safeTransferFrom(msg.sender, beneficiary, fee);
        return fee;
    }

    function _swapTokenToETH(address _receiver, uint _amountInToken, uint _amountOutETH, address _tokenIn, uint _deadline) internal returns (uint){
        address[] memory path = new address[](2);
        path[0] =  _tokenIn;
        path[1] =  dexRouter.WETH();

        require(IERC20(_tokenIn).approve(address(dexRouter), _amountInToken), "approve failed.");

        uint[] memory amounts = dexRouter.swapExactTokensForETH(_amountInToken, _amountOutETH, path, _receiver, _deadline);

        return amounts[1];
    }

    function _swapETHToToken(address _receiver, uint _amountInEth, uint _amountOutToken, address _token, uint _deadline) internal returns (uint){
        address[] memory path = new address[](2);
        path[0] = dexRouter.WETH();
        path[1] = _token;

        uint[] memory amounts = dexRouter.swapExactETHForTokens{ value: _amountInEth }(_amountOutToken, path, _receiver, _deadline);

        return amounts[1];
    }

    function _swapTokenToToken(address _receiver, uint _amountIn, uint _amountOut, address _tokenIn, address _tokenOut, uint _deadline) internal returns (uint){
        address[] memory path = new address[](2);
        path[0] = _tokenIn;
        path[1] = _tokenOut;

        require(IERC20(_tokenIn).approve(address(dexRouter), _amountIn), "approve failed.");

        uint[] memory amounts = dexRouter.swapExactTokensForTokens(_amountIn, _amountOut, path, _receiver, _deadline);

        return amounts[1];
    }

     receive() external payable {
     }
}
