# OpenSeaFactory







*Similar to https://github.com/ProjectOpenSea/opensea-creatures/blob/master/contracts/CreatureFactory.sol*

## Methods

### baseURI

```solidity
function baseURI() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### canMint

```solidity
function canMint(uint256 _optionId) external view returns (bool)
```



*Returns whether the option ID can be minted. Can return false if the developer wishes to restrict a total supply per option ID (or overall).*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _optionId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### isApprovedForAll

```solidity
function isApprovedForAll(address _owner, address _operator) external view returns (bool)
```



*Hack to get things to work automatically on OpenSea. Use isApprovedForAll so the frontend doesn&#39;t have to worry about different method names.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _owner | address | undefined |
| _operator | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### mint

```solidity
function mint(uint256 _optionId, address _toAddress) external nonpayable
```



*Mints asset(s) in accordance to a specific address with a particular &quot;option&quot;. This should be callable only by the contract owner or the owner&#39;s Wyvern Proxy (later universal login will solve this). Options should also be delineated 0 - (numOptions() - 1) for convenient indexing.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _optionId | uint256 | the option id |
| _toAddress | address | address of the future owner of the asset(s) |

### name

```solidity
function name() external pure returns (string)
```

Returns the name of this factory.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### nftAddress

```solidity
function nftAddress() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### numOptions

```solidity
function numOptions() external view returns (uint256)
```

Number of options the factory supports.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### ownerOf

```solidity
function ownerOf(uint256 _tokenId) external view returns (address _owner)
```



*Hack to get things to work automatically on OpenSea. Use isApprovedForAll so the frontend doesn&#39;t have to worry about different method names.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _owner | address | undefined |

### proxyRegistryAddress

```solidity
function proxyRegistryAddress() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### setBaseTokenURI

```solidity
function setBaseTokenURI(string _baseURI) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _baseURI | string | undefined |

### setNFTBaseTokenURI

```solidity
function setNFTBaseTokenURI(string _baseURI) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _baseURI | string | undefined |

### supportsFactoryInterface

```solidity
function supportsFactoryInterface() external pure returns (bool)
```

Indicates that this is a factory contract. Ideally would use EIP 165 supportsInterface()




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### symbol

```solidity
function symbol() external pure returns (string)
```

Returns the symbol for this factory.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### tokenURI

```solidity
function tokenURI(uint256 _optionId) external view returns (string)
```



*Returns a URL specifying some metadata about the option. This metadata can be of the same structure as the ERC721 metadata.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _optionId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### transferFrom

```solidity
function transferFrom(address _from, address _to, uint256 _tokenId) external nonpayable
```



*Hack to get things to work automatically on OpenSea. Use transferFrom so the frontend doesn&#39;t have to worry about different method names.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _from | address | undefined |
| _to | address | undefined |
| _tokenId | uint256 | undefined |

### transferOwnership

```solidity
function transferOwnership(address _newOwner) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _newOwner | address | undefined |



## Events

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |

### Transfer

```solidity
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |



