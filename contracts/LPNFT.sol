// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract LPNFT {
    using SafeERC20 for IERC20;

    mapping (uint256 => uint) public balanceOf;
    IERC20 public erc20Token;
    IERC721 public nftToken;

    constructor(IERC20 _erc20Token, IERC721 _nftToken) {
      erc20Token = _erc20Token;
      nftToken = _nftToken;
    }

    function addLPtoNFT(uint256 nftTokenId, uint tokenAmount) public returns (bool) {
        erc20Token.safeTransferFrom(msg.sender, address(this), tokenAmount);
        balanceOf[nftTokenId] += tokenAmount;
        return true;
    }

    function redeemLPTokens(uint256 nftTokenId, uint tokenAmount) public returns (bool) {
        require(tokenAmount <= balanceOf[nftTokenId], 'Amount exeeds balance');

        address owner = nftToken.ownerOf(nftTokenId);
        require(owner == msg.sender, 'Sender is not owner of the NFT');

        // TODO: add aave cashout  support here
        // erc20Token.safeTransfer(msg.sender, tokenAmount);

        balanceOf[nftTokenId] -= tokenAmount;
        return true;
    }

}