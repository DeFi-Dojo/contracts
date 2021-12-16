
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./interfaces/uniswapv2/IUniswapV2Router02.sol";
import "./interfaces/aave/ILendingPool.sol";
import "./interfaces/aave/IAToken.sol";
import "./interfaces/aave/IAaveIncentivesController.sol";
import "./YNFT.sol";


contract AaveYNFTVault is ReentrancyGuard, AccessControl, Pausable {
    using SafeERC20 for IAToken;
    using SafeERC20 for IERC20;

    IAaveIncentivesController public incentivesController;
    mapping (uint256 => uint) public balanceOf;
    IAToken public aToken;
    IERC721 public nftToken;
    ILendingPool public pool;
    IERC20 public rewardToken;
    YNFT public immutable yNFT;
    IUniswapV2Router02 public immutable dexRouter;
    IERC20 public immutable underlyingToken;
    uint public totalSupply;
    uint public feePercentage = 1;
    address public beneficiary;

    bytes32 public constant CLAIMER_ROLE = keccak256("CLAIMER_ROLE");

    modifier onlyNftOwner(uint nftTokenId) {
        address owner = yNFT.ownerOf(nftTokenId);
        require(owner == msg.sender, 'Sender is not owner of the NFT');
        _;
    }

    constructor(
        IUniswapV2Router02 _dexRouter,
        IAToken _aToken,
        IAaveIncentivesController _incentivesController,
        address _claimer
    ) {
        incentivesController = _incentivesController;
        rewardToken = IERC20(incentivesController.REWARD_TOKEN());
        aToken = _aToken;
        pool = ILendingPool(aToken.POOL());
        yNFT = new YNFT();
        dexRouter = _dexRouter;
        underlyingToken = IERC20(aToken.UNDERLYING_ASSET_ADDRESS());
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

    function setBeneficiary(address _beneficiary) external onlyRole(DEFAULT_ADMIN_ROLE) {
        beneficiary = _beneficiary;
    }

    function setFee(uint _feePercentage) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint) {
        require(_feePercentage <= 10, "Fee cannot be that much");
        feePercentage = _feePercentage;
        return feePercentage;
    }

    function _calcFee(uint _price) private view returns (uint) {
        return (_price * feePercentage) / 100;
    }

    function getAmountToClaim() external view returns (uint256) {
        address[] memory assets = new address[](1);
        assets[0] = address(aToken);

        uint256 amountToClaim = incentivesController.getRewardsBalance(assets, address(this));

        return amountToClaim;
    }

    // front run, sandwich attack
    function claimRewards(uint _amountOutMin, uint _deadline) external whenNotPaused onlyRole(CLAIMER_ROLE) {
        address[] memory claimAssets = new address[](1);
        claimAssets[0] = address(aToken);

        uint256 amountToClaim = incentivesController.getRewardsBalance(claimAssets, address(this));
        uint256 amountClaimed = incentivesController.claimRewards(claimAssets, amountToClaim, address(this));

        require(rewardToken.approve(address(dexRouter), amountClaimed), 'approve failed.');

        address[] memory path = new address[](2);
        path[0] = address(rewardToken);
        path[1] = address(underlyingToken);

        uint[] memory amounts = dexRouter.swapExactTokensForTokens(amountClaimed, _amountOutMin, path, address(this), _deadline);

        require(underlyingToken.approve(address(pool), amounts[1]), 'approve failed.');

        pool.deposit(address(underlyingToken), amounts[1], address(this), 0);

    }

    function _withdraw(uint256 _nftTokenId, address _receiver) private returns (uint) {

        uint currentAmountOfAToken = aToken.balanceOf(address(this));

        uint amountToWithdraw = balanceOf[_nftTokenId] * currentAmountOfAToken / totalSupply;

        totalSupply = totalSupply - balanceOf[_nftTokenId];

        balanceOf[_nftTokenId] = 0;

        return pool.withdraw(address(underlyingToken), amountToWithdraw, _receiver);
    }

    function _deposit(uint _tokenAmount) private {
        uint256 tokenId = yNFT.mint(msg.sender);

       require(underlyingToken.approve(address(pool), _tokenAmount), 'approve failed.');

        uint currentAmountOfAToken = aToken.balanceOf(address(this));

        pool.deposit(address(underlyingToken), _tokenAmount, address(this), 0);

        if (totalSupply == 0) {
            balanceOf[tokenId] = _tokenAmount;
            totalSupply = _tokenAmount;
        } else {
            uint balance = _tokenAmount * totalSupply / currentAmountOfAToken;

            balanceOf[tokenId] = balance;

            totalSupply = totalSupply + balance;
        }
    }

    function withdrawToUnderlyingToken(uint256 _nftTokenId) external whenNotPaused onlyNftOwner(_nftTokenId) {

        _withdraw(_nftTokenId, msg.sender);

        yNFT.burn(_nftTokenId);
    }

    function withdrawToEther(uint256 _nftTokenId, uint _amountOutMin, uint _deadline) external whenNotPaused onlyNftOwner(_nftTokenId) {
        uint amount = _withdraw(_nftTokenId, address(this));

        require(underlyingToken.approve(address(dexRouter), amount), 'approve failed.');

        address[] memory path = new address[](2);

        path[0] = address(underlyingToken);
        path[1] = dexRouter.WETH();

        dexRouter.swapExactTokensForETH(amount, _amountOutMin, path, msg.sender, _deadline);

        yNFT.burn(_nftTokenId);
    }

    function createYNFT(address _tokenIn, uint _amountIn, uint _amountOutMin, uint _deadline) whenNotPaused external {

        uint fee = _calcFee(_amountIn);
        IERC20(_tokenIn).safeTransferFrom(msg.sender, beneficiary, fee);

        uint amountInToBuy = _amountIn - fee;

        if(_tokenIn == address(underlyingToken)) {
            _deposit(amountInToBuy);
        } else {
            IERC20(_tokenIn).safeTransferFrom(msg.sender, address(this), amountInToBuy);
            address[] memory path = new address[](2);
            path[0] = _tokenIn;
            path[1] = address(underlyingToken);

            require(IERC20(_tokenIn).approve(address(dexRouter), amountInToBuy), 'approve failed.');

            uint[] memory amounts = dexRouter.swapExactTokensForTokens(amountInToBuy, _amountOutMin, path, address(this), _deadline);

            _deposit(amounts[1]);
        }
    }

    function createYNFTForEther(uint _amountOutMin, uint _deadline) external whenNotPaused nonReentrant payable {
        uint fee = _calcFee(msg.value);

        (bool success, ) = beneficiary.call{value: fee}("");
        require(success, "Transfer failed.");

        address[] memory path = new address[](2);
        path[0] = dexRouter.WETH();
        path[1] = address(underlyingToken);

        uint[] memory amounts = dexRouter.swapExactETHForTokens{ value: msg.value - fee }(_amountOutMin, path, address(this), _deadline);

        _deposit(amounts[1]);
    }
}
