# FactoryERC721





This is a generic factory contract that can be used to mint tokens. The configuration for minting is specified by an _optionId, which can be used to delineate various ways of minting.



## Methods

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
function name() external view returns (string)
```

Returns the name of this factory.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### numOptions

```solidity
function numOptions() external view returns (uint256)
```

Number of options the factory supports.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### supportsFactoryInterface

```solidity
function supportsFactoryInterface() external view returns (bool)
```

Indicates that this is a factory contract. Ideally would use EIP 165 supportsInterface()




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### symbol

```solidity
function symbol() external view returns (string)
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




