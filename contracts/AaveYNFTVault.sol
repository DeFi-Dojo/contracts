
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./sushiswap/uniswapv2/interfaces/IUniswapV2Router02.sol";
import "./interfaces/aave/ILendingPool.sol";
import "./interfaces/aave/IAToken.sol";
import "./interfaces/aave/IAaveIncentivesController.sol";
import "./YNFT.sol";


contract AaveYNFTVault is Ownable {
    using SafeERC20 for IAToken;
    using SafeERC20 for IERC20;

    AggregatorV3Interface internal incentiveTokenPriceFeed;
    uint public incentiveTokenPriceFeedDecimals;
    uint public incentiveTokenDecimals;
    IAaveIncentivesController public incentivesController;
    mapping (uint256 => uint) public balanceOf;
    IAToken public aToken;
    IERC721 public nftToken;
    ILendingPool public pool;
    IERC20 public rewardToken;
    YNFT public immutable yNFT;
    IUniswapV2Router02 public immutable dexRouter;
    IERC20 public immutable underlyingToken;
    uint etherDecimals = 18;
    uint public tokenDecimals;
    AggregatorV3Interface public etherPriceFeed;
    uint public etherPriceFeedDecimals;
    uint public totalSupply;
    uint public feePercentage = 1;


    modifier onlyNftOwner(uint nftTokenId) {
        address owner = yNFT.ownerOf(nftTokenId);
        require(owner == msg.sender, 'Sender is not owner of the NFT');
        _;
    }

    constructor(
        IUniswapV2Router02 _dexRouter,
        IAToken _aToken,
        IAaveIncentivesController _incentivesController,
        AggregatorV3Interface _incentiveTokenPriceFeed,
        uint _incentiveTokenDecimals,
        uint _incentiveTokenPriceFeedDecimals,
        uint _tokenDecimals,
        AggregatorV3Interface _etherPriceFeed,
        uint _etherPriceFeedDecimals
    ) {
        incentivesController = _incentivesController;
        rewardToken = IERC20(incentivesController.REWARD_TOKEN());
        aToken = _aToken;
        pool = ILendingPool(aToken.POOL());
        yNFT = new YNFT();
        dexRouter = _dexRouter;
        underlyingToken = IERC20(aToken.UNDERLYING_ASSET_ADDRESS());
        incentiveTokenPriceFeed = _incentiveTokenPriceFeed;
        incentiveTokenDecimals = _incentiveTokenDecimals;
        incentiveTokenPriceFeedDecimals = _incentiveTokenPriceFeedDecimals;
        tokenDecimals = _tokenDecimals;
        etherPriceFeed = _etherPriceFeed;
        etherPriceFeedDecimals = _etherPriceFeedDecimals;
    }

    function _calcSlipage(uint _price) private pure returns (uint) {
        // slipage 3%
        return (_price / 100) * 97;
    }

    function setFee(uint _feePercentage) external onlyOwner returns (uint) {
        feePercentage = _feePercentage;
        return feePercentage;
    }

    function _calcFee(uint _price) private view returns (uint) {
        return (_price * feePercentage) / 100;
    }

    function getLatestPriceOfIncetiveTokenToUnderlyingToken() public view returns (uint) {
        (,int price,,,) = incentiveTokenPriceFeed.latestRoundData();
        // normalize to 10^18
        uint power = incentiveTokenDecimals-incentiveTokenPriceFeedDecimals+(etherDecimals - incentiveTokenDecimals);
        return _calcSlipage(uint(price) * 10 ** power);
    }

    function getLatestPriceOfEtherToUnderlyingToken() public view returns (uint) {
        (,int price,,,) = etherPriceFeed.latestRoundData();
        // normalize to 10^18
        uint power = etherDecimals - etherPriceFeedDecimals;
        return uint(price) * 10 ** power;
    }

    function getAmountToClaim() external view returns (uint256) {
        address[] memory assets = new address[](1);
        assets[0] = address(aToken);

        uint256 amountToClaim = incentivesController.getRewardsBalance(assets, address(this));

        return amountToClaim;
    }

    function claimRewards(uint _deadline) external returns (bool) {
        address[] memory claimAssets = new address[](1);
        claimAssets[0] = address(aToken);

        uint256 amountToClaim = incentivesController.getRewardsBalance(claimAssets, address(this));
        uint256 amountClaimed = incentivesController.claimRewards(claimAssets, amountToClaim, address(this));

        require(rewardToken.approve(address(dexRouter), amountClaimed), 'approve failed.');

        address[] memory path = new address[](2);
        path[0] = address(rewardToken);
        path[1] = address(underlyingToken);

        uint amountOutMin = (getLatestPriceOfIncetiveTokenToUnderlyingToken() * amountClaimed) / 10**incentiveTokenDecimals;

        uint[] memory amounts = dexRouter.swapExactTokensForTokens(amountClaimed, amountOutMin, path, address(this), _deadline);

        require(underlyingToken.approve(address(pool), amounts[1]), 'approve failed.');

        pool.deposit(address(underlyingToken), amounts[1], address(this), 0);

        return true;
    }

    function _withdraw(uint256 _nftTokenId, address _receiver) private returns (uint) {

        uint currentAmountOfAToken = aToken.balanceOf(address(this));

        uint amountToWithdraw = balanceOf[_nftTokenId] * currentAmountOfAToken / totalSupply;

        totalSupply = totalSupply - balanceOf[_nftTokenId];

        balanceOf[_nftTokenId] = 0;

        return pool.withdraw(address(underlyingToken), amountToWithdraw, _receiver);
    }

    function _deposit(uint256 _nftTokenId, uint _tokenAmount) private returns (bool) {
       require(underlyingToken.approve(address(pool), _tokenAmount), 'approve failed.');

        uint currentAmountOfAToken = aToken.balanceOf(address(this));

        pool.deposit(address(underlyingToken), _tokenAmount, address(this), 0);

        if (totalSupply == 0) {
            balanceOf[_nftTokenId] = _tokenAmount;
            totalSupply = _tokenAmount;
        } else {
            uint balance = _tokenAmount * totalSupply / currentAmountOfAToken;

            balanceOf[_nftTokenId] = balance;

            totalSupply = totalSupply + balance;
        }

        return true;
    }

    function withdrawToUnderlyingToken(uint256 _nftTokenId) external onlyNftOwner(_nftTokenId) returns (bool) {

        _withdraw(_nftTokenId, msg.sender);

        yNFT.burn(_nftTokenId);

        return true;
    }

    function withdrawToEther(uint256 _nftTokenId, uint _deadline) external onlyNftOwner(_nftTokenId) returns (bool) {
        uint amount = _withdraw(_nftTokenId, address(this));

        require(underlyingToken.approve(address(dexRouter), amount), 'approve failed.');

        address[] memory path = new address[](2);

        path[0] = address(underlyingToken);
        path[1] = dexRouter.WETH();

        uint amountOutMin = (amount * 10 ** (etherDecimals - tokenDecimals) / getLatestPriceOfEtherToUnderlyingToken()) * 10 ** etherDecimals;

        dexRouter.swapExactTokensForETH(amount, _calcSlipage(amountOutMin  * 10 ** etherDecimals), path, msg.sender, _deadline);

        yNFT.burn(_nftTokenId);

        return true;
    }

    function createYNFT(address _tokenIn, uint _amountIn, uint _amountOutMin, uint _deadline) external {
        uint256 tokenId = yNFT.mint(msg.sender);

        uint fee = _calcFee(_amountIn);
        IERC20(_tokenIn).safeTransferFrom(msg.sender, owner(), fee);

        uint amountInToBuy = _amountIn - fee;

        IERC20(_tokenIn).safeTransferFrom(msg.sender, address(this), amountInToBuy);

        address[] memory path = new address[](2);
        path[0] = _tokenIn;
        path[1] = address(underlyingToken);

        require(IERC20(_tokenIn).approve(address(dexRouter), amountInToBuy), 'approve failed.');

        uint[] memory amounts = dexRouter.swapExactTokensForTokens(amountInToBuy, _amountOutMin, path, address(this), _deadline);

        _deposit(tokenId, amounts[1]);
    }

    function createYNFTForEther(uint _amountOutMin, uint _deadline) external payable {
        uint256 tokenId = yNFT.mint(msg.sender);

        uint fee = _calcFee(msg.value);

        payable(owner()).transfer(fee);

        address[] memory path = new address[](2);
        path[0] = dexRouter.WETH();
        path[1] = address(underlyingToken);

        uint[] memory amounts = dexRouter.swapExactETHForTokens{ value: msg.value - fee }(_amountOutMin, path, address(this), _deadline);

        _deposit(tokenId, amounts[1]);
    }
}
