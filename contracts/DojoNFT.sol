// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DojoNFT is ERC721 {
    constructor(uint256 tokenId) ERC721("DojoNFT", "DNFT") {
        _mint(msg.sender, tokenId);
    }
}