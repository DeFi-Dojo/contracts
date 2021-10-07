// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IAToken is IERC20 {
    function underlyingAssetAddress() external returns(address);
    function redeem(uint256 _amount) external;
}

contract AaveLPNFT {
    using SafeERC20 for IAToken;
    using SafeERC20 for IERC20;

    mapping (uint256 => uint) public balanceOf;
    IAToken public aToken;
    IERC721 public nftToken;

    constructor(IAToken _aToken, IERC721 _nftToken) {
      aToken = _aToken;
      nftToken = _nftToken;
    }

    function addLPtoNFT(uint256 nftTokenId, uint tokenAmount) public returns (bool) {
        aToken.safeTransferFrom(msg.sender, address(this), tokenAmount);
        balanceOf[nftTokenId] += tokenAmount;
        return true;
    }

    function redeemLPTokens(uint256 nftTokenId, uint tokenAmount) public returns (bool) {
        require(tokenAmount <= balanceOf[nftTokenId], 'Amount exeeds balance');

        address owner = nftToken.ownerOf(nftTokenId);
        require(owner == msg.sender, 'Sender is not owner of the NFT');

        aToken.redeem(tokenAmount);

        IERC20 underlyingERC20 = IERC20(aToken.underlyingAssetAddress());
        underlyingERC20.safeTransfer(msg.sender, tokenAmount);

        balanceOf[nftTokenId] -= tokenAmount;
        return true;
    }

}