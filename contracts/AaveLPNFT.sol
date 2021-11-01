// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./aaveV2/ILendingPool.sol";
import "./aaveV2/IAToken.sol";


contract AaveLPNFT {
    using SafeERC20 for IAToken;
    using SafeERC20 for IERC20;

    mapping (uint256 => uint) public balanceOf;
    IAToken public aToken;
    IERC721 public nftToken;
    ILendingPool public pool;
    IERC20 public underlyingToken;

    constructor(IAToken _aToken, IERC721 _nftToken) {
      aToken = _aToken;
      pool = ILendingPool(aToken.POOL());
      underlyingToken = IERC20(aToken.UNDERLYING_ASSET_ADDRESS());

      nftToken = _nftToken;
    }

    function addLPtoNFT(uint256 nftTokenId, uint tokenAmount) public returns (bool) {
        aToken.safeTransferFrom(msg.sender, address(this), tokenAmount);
        balanceOf[nftTokenId] += tokenAmount;
        return true;
    }

    function redeemLPTokens(uint256 nftTokenId, uint tokenAmount) public returns (bool) {
        require(tokenAmount <= balanceOf[nftTokenId], 'Amount exeeds balance');

        // address owner = nftToken.ownerOf(nftTokenId);
        // require(owner == msg.sender, 'Sender is not owner of the NFT');
        balanceOf[nftTokenId] -= tokenAmount;

        pool.withdraw(address(underlyingToken), tokenAmount, msg.sender);

        return true;
    }

}