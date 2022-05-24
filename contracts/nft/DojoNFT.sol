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

contract DojoNFT is
  ContextMixin,
  ERC721Enumerable,
  NativeMetaTransaction,
  Ownable
{
  using SafeMath for uint256;

  address private proxyRegistryAddress;
  uint256 public currentTokenId = 1;
  string private baseURI;

  struct Characteristics {
    uint8 faceMask;
    uint8 eyes;
    uint8 horn;
    uint8 weapon;
    uint8 helmet;
    uint8 bust;
  }

  mapping(uint256 => Characteristics) public characteristics;

  mapping(uint256 => uint256) public rarityIndex;

  uint8[] public faceMaskDistribution = [40, 25, 20, 10, 4, 1];
  uint8[] public eyesDistribution = [50, 20, 15, 10, 5];
  uint8[] public hornDistribution = [25, 20, 12, 8, 4, 1];
  uint8[] public weaponDistribution = [50, 20, 15, 10, 5];
  uint8[] public helmetDistribution = [75, 20, 5];
  uint8[] public bustDistribution = [75, 20, 5];

  struct RarityOption {
    uint8 optionId;
    uint256 rarity;
  }

  struct RarityInfo {
    RarityOption faceMask;
    RarityOption eyes;
    RarityOption horn;
    RarityOption weapon;
    RarityOption helmet;
    RarityOption bust;
  }

  constructor(string memory _baseURI, address _proxyRegistryAddress)
    ERC721("DeFi DOJO Warriors", "DOJO")
  {
    baseURI = _baseURI;
    proxyRegistryAddress = _proxyRegistryAddress;
    _initializeEIP712("DeFi DOJO Warriors");
  }

  /**
   * @dev Sets tokens metadata base URI.
   * @param _baseURI base URI.
   */
  function setBaseTokenURI(string memory _baseURI) public onlyOwner {
    baseURI = _baseURI;
  }

  /**
   * @dev Gets tokens metadata base URI.
   * @return base URI.
   */
  function baseTokenURI() public view returns (string memory) {
    return baseURI;
  }

  /**
   * @dev Checks if given NFT token id exists.
   * @return true if token exists false otherwise.
   */
  function exist(uint256 tokenId) public view returns (bool) {
    return tokenId < currentTokenId;
  }

  function _randPercentage(
    uint256 _tokenId,
    string memory _prefix,
    uint256 _blockTimestamp,
    uint256 _blockDifficulty
  ) internal view returns (uint256) {
    return
      uint256(
        keccak256(
          abi.encodePacked(
            _tokenId,
            _prefix,
            _blockTimestamp,
            _blockDifficulty,
            msg.sender
          )
        )
      ) % 100;
  }

  function _getOption(uint256 _rarity, uint8[] memory _distribution)
    internal
    pure
    returns (RarityOption memory rarityOption)
  {
    uint8 distributionLength = uint8(_distribution.length);
    uint8 distributionSum = 0;

    for (uint8 i = distributionLength - 1; i > 0; i--) {
      distributionSum += _distribution[i];

      if (_rarity < distributionSum) {
        return RarityOption({optionId: i, rarity: _distribution[i]});
      }
    }

    return RarityOption({optionId: 0, rarity: _distribution[0]});
  }

  /**
   * @dev Safely mints a new token to a given address.
   * Reverts if the given token id already exists.
   * @param _to Address of the future owner of the token.
   * @return NFT token id.
   */
  function mintTo(address _to) public onlyOwner returns (uint256) {
    // solhint-disable-next-line not-rely-on-time
    return _mintTo(_to, block.timestamp, block.difficulty);
  }

  /**
   * @dev Safely mints a new token to a given address.
   * Reverts if the given token id already exists.
   * @param _to Address of the future owner of the token.
   * @param _blockTimestamp Block timestamp used for random traits generation.
   * @param _blockDifficulty Block difficulty used for random traits generation.
   * @return Minted NFT token id.
   */
  function _mintTo(
    address _to,
    uint256 _blockTimestamp,
    uint256 _blockDifficulty
  ) internal returns (uint256) {
    uint256 newTokenId = currentTokenId;

    RarityInfo memory rarityInfo = RarityInfo({
      faceMask: _getOption(
        _randPercentage(
          newTokenId,
          "faceMask",
          _blockTimestamp,
          _blockDifficulty
        ),
        faceMaskDistribution
      ),
      eyes: _getOption(
        _randPercentage(newTokenId, "eyes", _blockTimestamp, _blockDifficulty),
        eyesDistribution
      ),
      horn: _getOption(
        _randPercentage(newTokenId, "horn", _blockTimestamp, _blockDifficulty),
        hornDistribution
      ),
      weapon: _getOption(
        _randPercentage(
          newTokenId,
          "weapon",
          _blockTimestamp,
          _blockDifficulty
        ),
        weaponDistribution
      ),
      helmet: _getOption(
        _randPercentage(
          newTokenId,
          "helmetMaterial",
          _blockTimestamp,
          _blockDifficulty
        ),
        helmetDistribution
      ),
      bust: _getOption(
        _randPercentage(newTokenId, "bust", _blockTimestamp, _blockDifficulty),
        bustDistribution
      )
    });

    characteristics[newTokenId] = Characteristics({
      faceMask: rarityInfo.faceMask.optionId,
      eyes: rarityInfo.eyes.optionId,
      horn: rarityInfo.horn.optionId,
      weapon: rarityInfo.weapon.optionId,
      helmet: rarityInfo.helmet.optionId,
      bust: rarityInfo.bust.optionId
    });

    rarityIndex[newTokenId] =
      rarityInfo.faceMask.rarity +
      rarityInfo.eyes.rarity +
      rarityInfo.horn.rarity +
      rarityInfo.weapon.rarity +
      rarityInfo.helmet.rarity +
      rarityInfo.bust.rarity;

    _safeMint(_to, newTokenId);
    currentTokenId += 1;

    return newTokenId;
  }

  /**
   * @dev Gets token metadata URI based on given token id.
   * @param _tokenId Address of the future owner of the token.
   * @return Token metadata URI.
   */
  function tokenURI(uint256 _tokenId)
    public
    view
    override
    returns (string memory)
  {
    return string(abi.encodePacked(baseTokenURI(), Strings.toString(_tokenId)));
  }

  /**
   * @dev Override isApprovedForAll to whitelist user's OpenSea proxy accounts to enable gas-less listings.
   * @dev Tells whether an operator is approved by a given owner.
   * @param _owner Owner.
   * @param _operator Opearator.
   */
  function isApprovedForAll(address _owner, address _operator)
    public
    view
    override
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
  function _msgSender() internal view override returns (address _sender) {
    return ContextMixin.msgSender();
  }
}
