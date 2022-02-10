// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract YNFT is ERC721, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  // solhint-disable-next-line no-emty-blocks
  constructor() ERC721("Dojo yNFT", "yNFT") {}

  function mint(address user) public onlyOwner returns (uint256) {
    uint256 newItemId = _tokenIds.current();
    _mint(user, newItemId);
    _tokenIds.increment();
    return newItemId;
  }

  function burn(uint256 tokenId) public onlyOwner returns (bool) {
    _burn(tokenId);
    return true;
  }
}
