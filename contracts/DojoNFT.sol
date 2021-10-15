// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

import "./utils/meta-transactions/ContentMixin.sol";
import "./utils/meta-transactions/NativeMetaTransaction.sol";

contract OwnableDelegateProxy {}

contract ProxyRegistry {
    mapping(address => OwnableDelegateProxy) public proxies;
}

contract DojoNFT is ContextMixin, ERC721Enumerable, NativeMetaTransaction, Ownable {
    using SafeMath for uint256;

    address proxyRegistryAddress;
    uint256 private _currentTokenId = 0;
    string baseURI;

    struct Characteristics {
        uint8 faceMask;
        uint8 eyes;
        uint8 symbol;
        uint8 horn;
        uint8 weapon;
        uint8 helmetMaterial;
        uint8 faceMaskColor;
        uint8 faceMaskPattern;
        uint8 samuraiSex;
    }

    mapping(uint256 => Characteristics) public characteristics;

    uint16[][] public equipmentDistributionMatrix = [
        [50, 60, 85, 95, 100], // faceMask
        [10, 40, 55, 60, 100], // eyes
        [40, 60, 80, 85, 100], // symbol
        [30, 35, 40, 55, 100], // horn
        [50, 70, 85, 90, 100] // weapon
    ];

    uint16[][] public rarityDistributionMatrix = [
        [75, 95, 100], // helmetMaterial
        [75, 95, 100], // faceMaskColor
        [75, 95, 100], // faceMaskPattern
        [75, 95, 100]  // samuraiSex
    ];

    constructor(
        string memory _baseURI,
        address _proxyRegistryAddress
    ) ERC721("DojoMask", "DOJO") {
        baseURI = _baseURI;
        proxyRegistryAddress = _proxyRegistryAddress;
        _initializeEIP712("DojoMask");
    }

    function setBaseTokenURI(string memory _baseURI) public onlyOwner {
        baseURI = _baseURI;
    }

    function baseTokenURI() public view returns (string memory) {
        return baseURI;
    }

    function contractURI() public pure returns (string memory) {
        return "https://creatures-api.opensea.io/contract/opensea-creatures";
    }

    function _randPercentage(uint256 tokenId, string memory prefix) private view returns (uint) {
        return uint(keccak256(abi.encodePacked(tokenId, prefix, block.timestamp, block.difficulty, msg.sender))) % 100;
    }

    function _getOption(uint rarity, uint16[] memory distribution) pure private returns (uint8 option) {
        uint256 arrayLength = distribution.length;
        for (uint8 i=0; i<arrayLength; i++) {
            if(distribution[i] > rarity) {
                return i;
            }
        }
    }

    /**
     * @dev Mints a token to an address with a tokenURI.
     * @param _to address of the future owner of the token
     */
    function mintTo(address _to) public onlyOwner returns (uint256)  {
        uint256 newTokenId = _getNextTokenId();

        characteristics[newTokenId] = Characteristics(
            {
            faceMask: _getOption( _randPercentage(newTokenId, "faceMask"), equipmentDistributionMatrix[0]),
            eyes: _getOption(_randPercentage(newTokenId, "eyes"), equipmentDistributionMatrix[1]),
            symbol: _getOption(_randPercentage(newTokenId, "symbol"), equipmentDistributionMatrix[2]),
            horn: _getOption(_randPercentage(newTokenId, "horn"), equipmentDistributionMatrix[3]),
            weapon: _getOption(_randPercentage(newTokenId, "weapon"), equipmentDistributionMatrix[4]),
            helmetMaterial: _getOption(_randPercentage(newTokenId, "helmetMaterial"), rarityDistributionMatrix[0]),
            faceMaskColor: _getOption(_randPercentage(newTokenId, "faceMaskColor"), rarityDistributionMatrix[1]),
            faceMaskPattern: _getOption(_randPercentage(newTokenId, "faceMaskPattern"), rarityDistributionMatrix[2]),
            samuraiSex: _getOption(_randPercentage(newTokenId, "samuraiSex"), rarityDistributionMatrix[3])
        }
        );

        _safeMint(_to, newTokenId);
        _incrementTokenId();

        return newTokenId;
    }

    /**
     * @dev calculates the next token ID based on value of _currentTokenId
     * @return uint256 for the next token ID
     */
    function _getNextTokenId() private view returns (uint256) {
        return _currentTokenId;
    }

    /**
     * @dev increments the value of _currentTokenId
     */
    function _incrementTokenId() private {
        _currentTokenId++;
    }

    function tokenURI(uint256 _tokenId) override public view returns (string memory) {
        return string(abi.encodePacked(baseTokenURI(), Strings.toString(_tokenId)));
    }

    /**
     * Override isApprovedForAll to whitelist user's OpenSea proxy accounts to enable gas-less listings.
     */
    function isApprovedForAll(address owner, address operator)
        override
        public
        view
        returns (bool)
    {
        // Whitelist OpenSea proxy contract for easy trading.
        ProxyRegistry proxyRegistry = ProxyRegistry(proxyRegistryAddress);
        if (address(proxyRegistry.proxies(owner)) == operator) {
            return true;
        }

        return super.isApprovedForAll(owner, operator);
    }

    /**
     * This is used instead of msg.sender as transactions won't be sent by the original token owner, but by OpenSea.
     */
    function _msgSender()
        internal
        override
        view
        returns (address sender)
    {
        return ContextMixin.msgSender();
    }
}
