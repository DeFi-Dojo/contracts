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

  mapping(uint256 => uint256) public balanceOf;
  IERC721 public nftToken;
  YNFT public immutable yNFT;
  IUniswapV2Router02 public immutable dexRouter;
  uint256 public feePerMile = 5;
  uint256 public performanceFeePerMille = 100;
  address public beneficiary;

  bytes32 public constant HARVESTER_ROLE = keccak256("HARVESTER_ROLE");

  modifier onlyNftOwner(uint256 _nftTokenId) {
    address owner = yNFT.ownerOf(_nftTokenId);
    require(owner == msg.sender, "Sender is not owner of the NFT");
    _;
  }

  constructor(
    IUniswapV2Router02 _dexRouter,
    address _harvester,
    address _beneficiary,
    string memory _ynftName,
    string memory _ynftBaseUri,
    string memory _ynftPathUri
  ) {
    yNFT = new YNFT(_ynftName, "yNFT", _ynftBaseUri, _ynftPathUri);
    dexRouter = _dexRouter;
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setupRole(HARVESTER_ROLE, _harvester);
    beneficiary = _beneficiary;
  }

  function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
    _pause();
  }

  function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
    _unpause();
  }

  function setFee(uint256 _feePerMile)
    external
    onlyRole(DEFAULT_ADMIN_ROLE)
    returns (uint256)
  {
    require(_feePerMile <= 100, "Fee cannot be that much");
    feePerMile = _feePerMile;
    return feePerMile;
  }

  function setPerformanceFee(uint256 _performanceFeePerMille)
    external
    onlyRole(DEFAULT_ADMIN_ROLE)
    returns (uint256)
  {
    require(
      _performanceFeePerMille <= 200,
      "Performance Fee cannot be that much"
    );
    performanceFeePerMille = _performanceFeePerMille;
    return performanceFeePerMille;
  }

  function setBeneficiary(address _beneficiary)
    external
    onlyRole(DEFAULT_ADMIN_ROLE)
  {
    beneficiary = _beneficiary;
  }

  function _calcFee(uint256 _price) internal view returns (uint256) {
    return (_price * feePerMile) / 1000;
  }

  function _collectFeeEther() internal nonReentrant returns (uint256) {
    uint256 fee = _calcFee(msg.value);
    //solhint-disable-next-line avoid-low-level-calls
    (bool success, ) = beneficiary.call{value: fee}("");
    require(success, "Transfer failed.");
    return fee;
  }

  function _collectFeeToken(address _tokenIn, uint256 _tokenAmount)
    internal
    returns (uint256)
  {
    uint256 fee = _calcFee(_tokenAmount);
    IERC20(_tokenIn).safeTransferFrom(msg.sender, beneficiary, fee);
    return fee;
  }

  function _swapTokenToETH(
    address _receiver,
    uint256 _amountInToken,
    uint256 _amountOutETH,
    address _tokenIn,
    uint256 _deadline
  ) internal returns (uint256) {
    address[] memory path = new address[](2);
    path[0] = _tokenIn;
    path[1] = dexRouter.WETH();

    require(
      IERC20(_tokenIn).approve(address(dexRouter), _amountInToken),
      "approve failed."
    );

    uint256[] memory amounts = dexRouter.swapExactTokensForETH(
      _amountInToken,
      _amountOutETH,
      path,
      _receiver,
      _deadline
    );

    return amounts[1];
  }

  function _swapETHToToken(
    address _receiver,
    uint256 _amountInEth,
    uint256 _amountOutToken,
    address _token,
    uint256 _deadline
  ) internal returns (uint256) {
    address[] memory path = new address[](2);
    path[0] = dexRouter.WETH();
    path[1] = _token;

    uint256[] memory amounts = dexRouter.swapExactETHForTokens{
      value: _amountInEth
    }(_amountOutToken, path, _receiver, _deadline);

    return amounts[1];
  }

  function _swapTokenToToken(
    address _receiver,
    uint256 _amountIn,
    uint256 _amountOut,
    address _tokenIn,
    address _tokenOut,
    uint256 _deadline
  ) internal returns (uint256) {
    address[] memory path = new address[](2);
    path[0] = _tokenIn;
    path[1] = _tokenOut;

    require(
      IERC20(_tokenIn).approve(address(dexRouter), _amountIn),
      "approve failed."
    );

    uint256[] memory amounts = dexRouter.swapExactTokensForTokens(
      _amountIn,
      _amountOut,
      path,
      _receiver,
      _deadline
    );

    return amounts[1];
  }

  function balanceOfUnderlying(uint256 _nftTokenId)
    external
    virtual
    returns (uint256);

  receive() external payable {}
}
