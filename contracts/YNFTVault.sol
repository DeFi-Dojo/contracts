
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


contract YNFTVault is Ownable {
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
    IERC20 public immutable token;

    constructor(
        IUniswapV2Router02 _dexRouter,
        IAToken _aToken,
        IAaveIncentivesController _incentivesController,
        AggregatorV3Interface _incentiveTokenPriceFeed,
        uint _incentiveTokenDecimals,
        uint _incentiveTokenPriceFeedDecimals
    ) {
        incentivesController = _incentivesController;
        rewardToken = IERC20(incentivesController.REWARD_TOKEN());
        aToken = _aToken;
        pool = ILendingPool(aToken.POOL());
        yNFT = new YNFT();
        dexRouter = _dexRouter;
        token = IERC20(aToken.UNDERLYING_ASSET_ADDRESS());
        incentiveTokenPriceFeed = _incentiveTokenPriceFeed;
        incentiveTokenDecimals = _incentiveTokenDecimals;
        incentiveTokenPriceFeedDecimals = _incentiveTokenPriceFeedDecimals;
    }

    /**
     * Returns the latest price
     */
    function getLatestPrice() public view returns (uint) {
        (,int price,,,) = incentiveTokenPriceFeed.latestRoundData();
        uint power = incentiveTokenDecimals-incentiveTokenPriceFeedDecimals;
        // slipage 2%
        return ((uint(price) * 10 ** power) / 50) * 49;
    }

    function getAmountToClaim() external view returns (uint256) {
        address[] memory assets = new address[](1);
        assets[0] = address(aToken);

        uint256 amountToClaim = incentivesController.getRewardsBalance(assets, address(this));

        return amountToClaim;
    }

    function claimRewards() external returns (bool) {
        address[] memory claimAssets = new address[](1);
        claimAssets[0] = address(aToken);

        uint256 amountToClaim = incentivesController.getRewardsBalance(claimAssets, address(this));
        uint256 amountClaimed = incentivesController.claimRewards(claimAssets, amountToClaim, address(this));

        require(rewardToken.approve(address(dexRouter), amountClaimed), 'approve failed.');

        uint deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
        address[] memory path = new address[](2);
        path[0] = address(rewardToken);
        path[1] = address(token);

        uint amountOutMin = (getLatestPrice() * amountClaimed) / 10**incentiveTokenDecimals;

        uint[] memory amounts = dexRouter.swapExactTokensForTokens(amountClaimed, amountOutMin, path, address(this), deadline);

        require(token.approve(address(pool), amounts[1]), 'approve failed.');

        pool.deposit(address(token), amounts[1], address(this), 0);

        return true;
    }

    function deposit(uint256 nftTokenId, uint tokenAmount) internal returns (bool) {
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

        require(IERC20(tokenIn).transferFrom(msg.sender, address(this), _amountIn), 'transferFrom failed.');

        uint deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = address(token);

        require(IERC20(tokenIn).approve(address(dexRouter), _amountIn), 'approve failed.');

        uint[] memory amounts = dexRouter.swapExactTokensForTokens(_amountIn, _amountOutMin, path, address(this), deadline);

        deposit(tokenId, amounts[1]);
    }

    function createYNFTForEther(uint _amountOutMin) public payable {
        uint256 tokenId = yNFT.mint(msg.sender);

        uint deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
        address[] memory path = new address[](2);
        path[0] = dexRouter.WETH();
        path[1] = address(token);

        uint[] memory amounts = dexRouter.swapExactETHForTokens{ value: msg.value }(_amountOutMin, path, address(this), deadline);

        deposit(tokenId, amounts[1]);
    }
}
