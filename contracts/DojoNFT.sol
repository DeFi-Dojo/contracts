// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract DojoNFT is ERC721URIStorage, Ownable {
    address public nftMarketplaceAddress;
    using Counters for Counters.Counter;
    Counters.Counter public totalSupply;
    string internal baseURI;
    using Strings for uint8;

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

    constructor(address _nftMarketplaceAddress, string memory initialBaseURI) ERC721("DojoNFT", "DNFT") {
        nftMarketplaceAddress = _nftMarketplaceAddress;
        baseURI = initialBaseURI;
    }

    function setBaseURI(string memory newBaseURI) public onlyOwner returns (string memory) {
        baseURI = newBaseURI;
        return baseURI;
    }

    function _baseURI() override internal view virtual returns (string memory) {
        return baseURI;
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

    function mint() public returns (uint256) {
        uint256 newTokenId = totalSupply.current();
        totalSupply.increment();

        uint8 _faceMask = _getOption( _randPercentage(newTokenId, "faceMask"), equipmentDistributionMatrix[0]);
        uint8 _eyes =  _getOption(_randPercentage(newTokenId, "eyes"), equipmentDistributionMatrix[1]);
        uint8 _symbol =  _getOption(_randPercentage(newTokenId, "symbol"), equipmentDistributionMatrix[2]);
        uint8 _horn =  _getOption(_randPercentage(newTokenId, "horn"), equipmentDistributionMatrix[3]);
        uint8 _weapon =  _getOption(_randPercentage(newTokenId, "weapon"), equipmentDistributionMatrix[4]);
        uint8 _helmetMaterial =  _getOption(_randPercentage(newTokenId, "helmetMaterial"), rarityDistributionMatrix[0]);
        uint8 _faceMaskColor =  _getOption(_randPercentage(newTokenId, "faceMaskColor"), rarityDistributionMatrix[1]);
        uint8 _faceMaskPattern =  _getOption(_randPercentage(newTokenId, "faceMaskPattern"), rarityDistributionMatrix[2]);
        uint8 _samuraiSex =  _getOption(_randPercentage(newTokenId, "samuraiSex"), rarityDistributionMatrix[3]);

        characteristics[newTokenId] = Characteristics(
        {
            faceMask: _faceMask,
            eyes: _eyes,
            symbol: _symbol,
            horn: _horn,
            weapon: _weapon,
            helmetMaterial: _helmetMaterial,
            faceMaskColor: _faceMaskColor,
            faceMaskPattern: _faceMaskPattern,
            samuraiSex: _samuraiSex
        }
    );

        _safeMint(msg.sender, newTokenId);

        setApprovalForAll(nftMarketplaceAddress, true);

        string memory rarityQuery = string(abi.encodePacked(
            "&helmetMaterial=", _helmetMaterial.toString(),
            "&faceMaskColor=", _faceMaskColor.toString(),
            "&faceMaskPattern=", _faceMaskPattern.toString(),
            "&samuraiSex=", _samuraiSex.toString()
        ));

        _setTokenURI(newTokenId, string(abi.encodePacked(
            "?faceMask=", _faceMask.toString(),
            "&eyes=", _eyes.toString(),
            "&symbol=", _symbol.toString(),
            "&horn=", _horn.toString(),
            "&weapon=", _weapon.toString(),
            rarityQuery
            )));

        return newTokenId;
    }
}