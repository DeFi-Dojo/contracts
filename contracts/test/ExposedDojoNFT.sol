// SPDX-License-Identifier: MIT
// solhint-disable func-name-mixedcase

pragma solidity ^0.8.0;

import "../nft/DojoNFT.sol";

contract ExposedDojoNFT is DojoNFT {
  /* solhint-disable no-empty-blocks */
  constructor(string memory _baseURI, address _proxyRegistryAddress)
    DojoNFT(_baseURI, _proxyRegistryAddress)
  {}

  /* solhint-enable no-empty-blocks */

  function public_getNextTokenId() public view returns (uint256) {
    return currentTokenId;
  }

  function public_incrementTokenId() public {}

  function public_randPercentage(
    uint256 tokenId,
    string memory prefix,
    uint256 _blockTimestamp,
    uint256 _blockDifficulty
  ) public view returns (uint256) {
    return _randPercentage(tokenId, prefix, _blockTimestamp, _blockDifficulty);
  }

  function public_getOption(uint256 rarity, uint8[] memory distribution)
    public
    pure
    returns (RarityOption memory rarityOption)
  {
    return _getOption(rarity, distribution);
  }

  function public_mintTo(
    address _to,
    uint256 _blockTimestamp,
    uint256 _blockDifficulty
  ) public returns (uint256) {
    return _mintTo(_to, _blockTimestamp, _blockDifficulty);
  }
}
