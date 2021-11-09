
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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

    mapping (uint256 => uint) public balanceOf;
    IAToken public aToken;
    IERC721 public nftToken;
    ILendingPool public pool;
    IAaveIncentivesController public incentivesController;
    IERC20 public rewardToken;
    YNFT public immutable yNFT;
    IUniswapV2Router02 public immutable dexRouter;
    IERC20 public immutable token;

    constructor(
        IUniswapV2Router02 _dexRouter,
        IAToken _aToken,
        IAaveIncentivesController _incentivesController
    ) {
        incentivesController = _incentivesController;
        rewardToken = REWARD_TOKEN();
        aToken = _aToken;
        pool = ILendingPool(aToken.POOL());
        yNFT = new YNFT();
        dexRouter = _dexRouter;
        token = IERC20(aToken.UNDERLYING_ASSET_ADDRESS());
    }

    function claimRewards() external returns (bool) {
        uint256 amountToClaim = incentivesController.getUserUnclaimedRewards(address(this));

        uint256 amountClaimed = incentivesController.claimRewards([address(token)], amountToClaim, address(this));

        require(rewardToken.approve(address(dexRouter), amountClaimed), 'approve failed.');

        uint deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
        address[] memory path = new address[](2);
        path[0] = address(rewardToken);
        path[1] = address(token);


        uint amountOutMin = 0;

        uint[] memory amounts = dexRouter.swapExactTokensForTokens(_amountIn, amountOutMin, path, address(this), deadline);

        pool.deposit(address(token), amounts[1], address(this), 0);

        return true;
    }

    function addLPtoNFT(uint256 nftTokenId, uint tokenAmount) internal returns (bool) {
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

        addLPtoNFT(tokenId, amounts[1]);
    }

    function createYNFTForEther(uint _amountOutMin) public payable {
        uint256 tokenId = yNFT.mint(msg.sender);

        uint deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!
        address[] memory path = new address[](2);
        path[0] = dexRouter.WETH();
        path[1] = address(token);

        uint[] memory amounts = dexRouter.swapExactETHForTokens{ value: msg.value }(_amountOutMin, path, address(this), deadline);

        addLPtoNFT(tokenId, amounts[1]);
    }
}
