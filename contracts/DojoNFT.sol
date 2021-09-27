// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract DojoNFT is ERC721Enumerable {
    address public owner;
    address public nftMarketplaceAddress;

    constructor(address _nftMarketplaceAddress) ERC721("DojoNFT", "DNFT") {
        owner = msg.sender;
        nftMarketplaceAddress = _nftMarketplaceAddress;
    }

    function mint() public returns (uint256) {
        require(msg.sender == owner, "Sender not an owner");

        uint256 newTokenId = totalSupply();
        _safeMint(msg.sender, newTokenId);

        setApprovalForAll(nftMarketplaceAddress, true);

        return newTokenId;
    }
}