// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../interfaces/nft/IFactoryERC721.sol";
import "./DojoNFT.sol";

/// @dev Similar to https://github.com/ProjectOpenSea/opensea-creatures/blob/master/contracts/CreatureFactory.sol
contract OpenSeaFactory is FactoryERC721, Ownable {
  using Strings for string;

  event Transfer(
    address indexed from,
    address indexed to,
    uint256 indexed tokenId
  );

  address public proxyRegistryAddress;
  address public nftAddress;
  string public baseURI;

  /**
   * @dev Enforce the existence of only 1000 OpenSea creatures.
   */
  uint256 private creatureSupply;

  /**
   * @dev One option for minting.
   */
  uint256 private numOptions_ = 1;
  uint256 private singleCreatureOption = 0;

  constructor(
    address _proxyRegistryAddress,
    address _nftAddress,
    uint256 _creatureSupply,
    string memory _baseURI
  ) {
    proxyRegistryAddress = _proxyRegistryAddress;
    nftAddress = _nftAddress;
    creatureSupply = _creatureSupply;
    baseURI = _baseURI;

    fireTransferEvents(address(0), owner());
  }

  function name() external pure override returns (string memory) {
    return "DeFi DOJO Warriors";
  }

  function symbol() external pure override returns (string memory) {
    return "DOJO";
  }

  function supportsFactoryInterface() public pure override returns (bool) {
    return true;
  }

  function numOptions() public view override returns (uint256) {
    return numOptions_;
  }

  function transferOwnership(address _newOwner) public override onlyOwner {
    address _prevOwner = owner();
    super.transferOwnership(_newOwner);
    fireTransferEvents(_prevOwner, _newOwner);
  }

  function fireTransferEvents(address _from, address _to) private {
    for (uint256 i = 0; i < numOptions_; i++) {
      emit Transfer(_from, _to, i);
    }
  }

  function setBaseTokenURI(string calldata _baseURI) external onlyOwner {
    baseURI = _baseURI;
  }

  function setNFTBaseTokenURI(string calldata _baseURI) external onlyOwner {
    DojoNFT mask = DojoNFT(nftAddress);
    mask.setBaseTokenURI(_baseURI);
  }

  function mint(uint256 _optionId, address _toAddress) public override {
    // Must be sent from the owner proxy or owner.
    ProxyRegistry proxyRegistry = ProxyRegistry(proxyRegistryAddress);
    assert(
      address(proxyRegistry.proxies(owner())) == _msgSender() ||
        owner() == _msgSender()
    );
    require(canMint(_optionId), "Cannot mint");

    DojoNFT mask = DojoNFT(nftAddress);
    if (_optionId == singleCreatureOption) {
      mask.mintTo(_toAddress);
    }
  }

  function canMint(uint256 _optionId) public view override returns (bool) {
    if (_optionId >= numOptions_) {
      return false;
    }

    DojoNFT mask = DojoNFT(nftAddress);
    uint256 creatureSupply_ = mask.totalSupply();

    uint256 numItemsAllocated = 0;
    if (_optionId == singleCreatureOption) {
      numItemsAllocated = 1;
    }
    return creatureSupply_ <= (creatureSupply - numItemsAllocated);
  }

  function tokenURI(uint256 _optionId)
    external
    view
    override
    returns (string memory)
  {
    return string(abi.encodePacked(baseURI, Strings.toString(_optionId)));
  }

  /**
   * @dev Hack to get things to work automatically on OpenSea.
   * Use transferFrom so the frontend doesn't have to worry about different method names.
   */
  /* solhint-disable no-unused-vars */
  function transferFrom(
    address _from,
    address _to,
    uint256 _tokenId /* solhint-enable no-unused-vars */
  ) public {
    mint(_tokenId, _to);
  }

  /**
   * @dev Hack to get things to work automatically on OpenSea.
   * Use isApprovedForAll so the frontend doesn't have to worry about different method names.
   */
  function isApprovedForAll(address _owner, address _operator)
    public
    view
    returns (bool)
  {
    if (owner() == _owner && _owner == _operator) {
      return true;
    }

    ProxyRegistry proxyRegistry = ProxyRegistry(proxyRegistryAddress);
    if (
      owner() == _owner && address(proxyRegistry.proxies(_owner)) == _operator
    ) {
      return true;
    }

    return false;
  }

  /**
   * @dev Hack to get things to work automatically on OpenSea.
   * Use isApprovedForAll so the frontend doesn't have to worry about different method names.
   */
  // solhint-disable-next-line no-unused-vars
  function ownerOf(uint256 _tokenId) public view returns (address _owner) {
    return owner();
  }
}
