// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract YNFT is ERC721, Ownable {
    using Strings for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    string private _baseUri;
    string private _pathUri;

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        string memory pathURI_
    ) ERC721(name_, symbol_) {
        _pathUri = pathURI_;
        _baseUri = baseURI_;
    }

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

    function _baseURI() internal view override returns (string memory) {
        return _baseUri;
    }

    function _pathURI() internal view returns (string memory) {
        return _pathUri;
    }

    function setBaseURI(string memory newBaseURI) public onlyOwner {
        _baseUri = newBaseURI;
    }

    function setPathURI(string memory newPathURI) public onlyOwner {
        _pathUri = newPathURI;
    }

    function tokenURI() public view returns (string memory) {
        return
            bytes(_baseUri).length > 0
                ? string(abi.encodePacked(_baseURI(), _pathURI()))
                : "";
    }

    // solhint-disable-next-line no-unused-vars
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return tokenURI();
    }
}
