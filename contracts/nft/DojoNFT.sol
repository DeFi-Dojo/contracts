// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

import "../utils/meta-transactions/ContentMixin.sol";
import "../utils/meta-transactions/NativeMetaTransaction.sol";

contract OwnableDelegateProxy {}

contract ProxyRegistry {
    mapping(address => OwnableDelegateProxy) public proxies;
}

contract DojoNFT is ContextMixin, ERC721Enumerable, NativeMetaTransaction, Ownable {
    using SafeMath for uint256;

    address private proxyRegistryAddress;
    uint256 public currentTokenId = 1;
    string private baseURI;

    struct Characteristics {
        uint8 faceMask;
        uint8 eyes;
        uint8 symbol;
        uint8 horn;
        uint8 weapon;
        uint8 helmet;
        uint8 bust;
    }

    mapping(uint256 => Characteristics) public characteristics;

    mapping(uint256 => uint256) public rarityIndex;

    uint8[][] public equipmentDistributionMatrix = [
        [50, 70, 85, 95, 100], // faceMask
        [50, 70, 85, 95, 100], // eyes
        [50, 70, 85, 95, 100], // symbol
        [50, 70, 85, 95, 100], // horn
        [50, 70, 85, 95, 100] // weapon
    ];

    uint8[][] public armorDistributionMatrix = [
        [75, 95, 100], // helmet
        [75, 95, 100] // bust
    ];

    struct RarityOption {
        uint8 optionId;
        uint256 rarity;
    }

    struct RarityInfo {
        RarityOption faceMask;
        RarityOption eyes;
        RarityOption symbol;
        RarityOption horn;
        RarityOption weapon;
        RarityOption helmet;
        RarityOption bust;
    }

    constructor(
        string memory _baseURI,
        address _proxyRegistryAddress
    ) ERC721("DeFi DOJO Warriors", "DOJO") {
        baseURI = _baseURI;
        proxyRegistryAddress = _proxyRegistryAddress;
        _initializeEIP712("DeFi DOJO Warriors");
    }

    function setBaseTokenURI(string memory _baseURI) public onlyOwner {
        baseURI = _baseURI;
    }

    function baseTokenURI() public view returns (string memory) {
        return baseURI;
    }

     function exist(uint256 tokenId) public view returns (bool) {
        return tokenId < currentTokenId;
    }

    function _randPercentage(uint256 _tokenId, string memory _prefix, uint256 _blockTimestamp, uint256 _blockDifficulty) internal view returns (uint) {
        return uint(keccak256(abi.encodePacked(_tokenId, _prefix, _blockTimestamp, _blockDifficulty, msg.sender))) % 100;
    }

    function _getOption(uint _rarity, uint8[] memory _distribution) internal pure returns (RarityOption memory rarityOption) {
        uint256 arrayLength = _distribution.length;
        for (uint8 i=0; i<arrayLength; i++) {
            if(_distribution[i] >= _rarity) {
                if(i == 0) {
                    return RarityOption({optionId: i, rarity: _distribution[i] });
                }
                return RarityOption({optionId: i, rarity: _distribution[i] - _distribution[i - 1] });
            }
        }
    }

    function mintTo(address _to) public onlyOwner returns (uint256)  {
        return _mintTo(_to, block.timestamp, block.difficulty);
    }

    /**
     * @dev Mints a token to an address with a tokenURI.
     * @param _to address of the future owner of the token
     */
    function _mintTo(address _to, uint256 _blockTimestamp, uint256 _blockDifficulty) internal returns (uint256)  {
        uint256 newTokenId = currentTokenId;

        RarityInfo memory rarityInfo = RarityInfo({
            faceMask: _getOption(_randPercentage(newTokenId, "faceMask", _blockTimestamp, _blockDifficulty), equipmentDistributionMatrix[0]),
            eyes: _getOption(_randPercentage(newTokenId, "eyes", _blockTimestamp, _blockDifficulty), equipmentDistributionMatrix[1]),
            symbol: _getOption(_randPercentage(newTokenId, "symbol", _blockTimestamp, _blockDifficulty), equipmentDistributionMatrix[2]),
            horn: _getOption(_randPercentage(newTokenId, "horn", _blockTimestamp, _blockDifficulty), equipmentDistributionMatrix[3]),
            weapon:  _getOption(_randPercentage(newTokenId, "weapon", _blockTimestamp, _blockDifficulty), equipmentDistributionMatrix[4]),
            helmet: _getOption(_randPercentage(newTokenId, "helmetMaterial", _blockTimestamp, _blockDifficulty), armorDistributionMatrix[0]),
            bust: _getOption(_randPercentage(newTokenId, "faceMaskColor", _blockTimestamp, _blockDifficulty), armorDistributionMatrix[1])
        });

        characteristics[newTokenId] = Characteristics({
            faceMask: rarityInfo.faceMask.optionId,
            eyes: rarityInfo.eyes.optionId,
            symbol: rarityInfo.symbol.optionId,
            horn: rarityInfo.horn.optionId,
            weapon: rarityInfo.weapon.optionId,
            helmet: rarityInfo.helmet.optionId,
            bust: rarityInfo.bust.optionId
        });

        rarityIndex[newTokenId] = rarityInfo.faceMask.rarity + rarityInfo.eyes.rarity + rarityInfo.symbol.rarity + rarityInfo.horn.rarity + rarityInfo.weapon.rarity + rarityInfo.helmet.rarity + rarityInfo.bust.rarity;

        _safeMint(_to, newTokenId);
        currentTokenId += 1;

        return newTokenId;
    }

    function tokenURI(uint256 _tokenId) override public view returns (string memory) {
        return string(abi.encodePacked(baseTokenURI(), Strings.toString(_tokenId)));
    }

    /**
     * Override isApprovedForAll to whitelist user's OpenSea proxy accounts to enable gas-less listings.
     */
    function isApprovedForAll(address _owner, address _operator)
        override
        public
        view
        returns (bool)
    {
        // Whitelist OpenSea proxy contract for easy trading.
        ProxyRegistry proxyRegistry = ProxyRegistry(proxyRegistryAddress);
        if (address(proxyRegistry.proxies(_owner)) == _operator) {
            return true;
        }

        return super.isApprovedForAll(_owner, _operator);
    }

    /**
     * This is used instead of msg.sender as transactions won't be sent by the original token owner, but by OpenSea.
     */
    function _msgSender()
        internal
        override
        view
        returns (address _sender)
    {
        return ContextMixin.msgSender();
    }
}
