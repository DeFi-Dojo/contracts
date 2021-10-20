// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../DojoNFT.sol";

contract ExposedDojoNFT is DojoNFT {

    constructor(
        string memory _baseURI,
        address _proxyRegistryAddress
    ) DojoNFT(_baseURI, _proxyRegistryAddress) {
    }

    function public_getNextTokenId() view public returns (uint) {
        return _getNextTokenId();
    }

    function public_incrementTokenId() public {
        _incrementTokenId();
    }

    function public_randPercentage(uint256 tokenId, string memory prefix, uint256 _blockTimestamp, uint256 _blockDifficulty) public view returns (uint) {
        return _randPercentage(tokenId, prefix, _blockTimestamp, _blockDifficulty);
    }

    function public_getOption(uint rarity, uint16[] memory distribution) pure public returns (uint8 option) {
        return _getOption(rarity, distribution);
    }

    function public_mintTo(address _to, uint256 _blockTimestamp, uint256 _blockDifficulty) public returns (uint256)  {
        return _mintTo(_to, _blockTimestamp, _blockDifficulty);
    }
}