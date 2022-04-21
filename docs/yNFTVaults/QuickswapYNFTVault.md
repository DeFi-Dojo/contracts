# QuickswapYNFTVault









## Methods

### DEFAULT_ADMIN_ROLE

```solidity
function DEFAULT_ADMIN_ROLE() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### HARVESTER_ROLE

```solidity
function HARVESTER_ROLE() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### balanceOf

```solidity
function balanceOf(uint256) external view returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### balanceOfUnderlying

```solidity
function balanceOfUnderlying(uint256 _nftTokenId) external view returns (uint256)
```



*Calculates underlying asset balance belonging to particular nft token id.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _nftTokenId | uint256 | NFT token id that gives access to certain balance of underlying asset. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Underlying asset balance for certain NFT token id. |

### balancesAtBuy

```solidity
function balancesAtBuy(uint256) external view returns (uint256 tokenBalance, uint256 totalSupply)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| tokenBalance | uint256 | undefined |
| totalSupply | uint256 | undefined |

### beneficiary

```solidity
function beneficiary() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### createYNFT

```solidity
function createYNFT(address _tokenIn, uint256 _amountIn, uint256 _amountOutMinFirstToken, uint256 _amountOutMinSecondToken, uint256 _amountMinLiqudityFirstToken, uint256 _amountMinLiquditySecondToken, uint256 _deadline) external nonpayable
```



*Deposits liquidity and creates yNFT token.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _tokenIn | address | Address of ERC20 token to be deposited. |
| _amountIn | uint256 | Amount of ERC20 tokens to be deposited. |
| _amountOutMinFirstToken | uint256 | The minimum amount of output tokens that must be received for the swap not to revert. |
| _amountOutMinSecondToken | uint256 | The minimum amount of output tokens that must be received for the swap not to revert. |
| _amountMinLiqudityFirstToken | uint256 | Bounds the extent to which the (Second token) / (First token) price can go up before the transaction reverts. Must be &lt;= amountADesired. |
| _amountMinLiquditySecondToken | uint256 | Bounds the extent to which the (First token) / (Second token) price can go up before the transaction reverts. Must be &lt;= amountBDesired. |
| _deadline | uint256 | Unix timestamp after which the transaction will revert. |

### createYNFTForEther

```solidity
function createYNFTForEther(uint256 _amountOutMinFirstToken, uint256 _amountOutMinSecondToken, uint256 _amountMinLiqudityFirstToken, uint256 _amountMinLiquditySecondToken, uint256 _deadline) external payable
```



*Deposits liquidity and creates yNFT token for Ether.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _amountOutMinFirstToken | uint256 | The minimum amount of output tokens that must be received for the swap not to revert. |
| _amountOutMinSecondToken | uint256 | The minimum amount of output tokens that must be received for the swap not to revert. |
| _amountMinLiqudityFirstToken | uint256 | Bounds the extent to which the (Second token) / (First token) price can go up before the transaction reverts. Must be &lt;= amountADesired. |
| _amountMinLiquditySecondToken | uint256 | Bounds the extent to which the (First token) / (Second token) price can go up before the transaction reverts. Must be &lt;= amountBDesired. |
| _deadline | uint256 | Unix timestamp after which the transaction will revert. |

### dQuick

```solidity
function dQuick() external view returns (contract IERC20)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract IERC20 | undefined |

### depositETH

```solidity
function depositETH(uint256 _amountOutMinFirstToken, uint256 _amountOutMinSecondToken, uint256 _amountMinLiqudityFirstToken, uint256 _amountMinLiquditySecondToken, uint256 _deadline) external nonpayable
```



*Deposits Ether and provides liquidity.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _amountOutMinFirstToken | uint256 | The minimum amount of output tokens that must be received for the swap not to revert. |
| _amountOutMinSecondToken | uint256 | The minimum amount of output tokens that must be received for the swap not to revert. |
| _amountMinLiqudityFirstToken | uint256 | Bounds the extent to which the (Second token) / (First token) price can go up before the transaction reverts. Must be &lt;= amountADesired. |
| _amountMinLiquditySecondToken | uint256 | Bounds the extent to which the (First token) / (Second token) price can go up before the transaction reverts. Must be &lt;= amountBDesired. |
| _deadline | uint256 | Unix timestamp after which the transaction will revert. |

### depositTokens

```solidity
function depositTokens(address _tokenIn, uint256 _amountOutMinFirstToken, uint256 _amountOutMinSecondToken, uint256 _amountMinLiqudityFirstToken, uint256 _amountMinLiquditySecondToken, uint256 _deadline) external nonpayable
```



*Deposits tokens and provides liquidity using ERC20 tokens.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _tokenIn | address | Address of ERC20 token to be deposited. |
| _amountOutMinFirstToken | uint256 | The minimum amount of output tokens that must be received for the swap not to revert. |
| _amountOutMinSecondToken | uint256 | The minimum amount of output tokens that must be received for the swap not to revert. |
| _amountMinLiqudityFirstToken | uint256 | Bounds the extent to which the (Second token) / (First token) price can go up before the transaction reverts. Must be &lt;= amountADesired. |
| _amountMinLiquditySecondToken | uint256 | Bounds the extent to which the (First token) / (Second token) price can go up before the transaction reverts. Must be &lt;= amountBDesired. |
| _deadline | uint256 | Unix timestamp after which the transaction will revert. |

### dexRouter

```solidity
function dexRouter() external view returns (contract IUniswapV2Router02)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract IUniswapV2Router02 | undefined |

### estimatePerformanceFee

```solidity
function estimatePerformanceFee(uint256 tokenId) external view returns (uint256 token0Amount, uint256 token1Amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| token0Amount | uint256 | undefined |
| token1Amount | uint256 | undefined |

### feePerMile

```solidity
function feePerMile() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### firstToken

```solidity
function firstToken() external view returns (contract IERC20)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract IERC20 | undefined |

### getRewardLPMining

```solidity
function getRewardLPMining() external nonpayable
```



*Accrue rewards from LP mining to beneficiary address.*


### getRoleAdmin

```solidity
function getRoleAdmin(bytes32 role) external view returns (bytes32)
```



*Returns the admin role that controls `role`. See {grantRole} and {revokeRole}. To change a role&#39;s admin, use {_setRoleAdmin}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### grantRole

```solidity
function grantRole(bytes32 role, address account) external nonpayable
```



*Grants `role` to `account`. If `account` had not been already granted `role`, emits a {RoleGranted} event. Requirements: - the caller must have ``role``&#39;s admin role.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

### hasRole

```solidity
function hasRole(bytes32 role, address account) external view returns (bool)
```



*Returns `true` if `account` has been granted `role`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### nftToken

```solidity
function nftToken() external view returns (contract IERC721)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract IERC721 | undefined |

### pair

```solidity
function pair() external view returns (contract IUniswapV2Pair)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract IUniswapV2Pair | undefined |

### pause

```solidity
function pause() external nonpayable
```






### paused

```solidity
function paused() external view returns (bool)
```



*Returns true if the contract is paused, and false otherwise.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### performanceFeePerMille

```solidity
function performanceFeePerMille() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### renounceRole

```solidity
function renounceRole(bytes32 role, address account) external nonpayable
```



*Revokes `role` from the calling account. Roles are often managed via {grantRole} and {revokeRole}: this function&#39;s purpose is to provide a mechanism for accounts to lose their privileges if they are compromised (such as when a trusted device is misplaced). If the calling account had been revoked `role`, emits a {RoleRevoked} event. Requirements: - the caller must be `account`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

### revokeRole

```solidity
function revokeRole(bytes32 role, address account) external nonpayable
```



*Revokes `role` from `account`. If `account` had been granted `role`, emits a {RoleRevoked} event. Requirements: - the caller must have ``role``&#39;s admin role.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

### secondToken

```solidity
function secondToken() external view returns (contract IERC20)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract IERC20 | undefined |

### setBeneficiary

```solidity
function setBeneficiary(address _beneficiary) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _beneficiary | address | undefined |

### setFee

```solidity
function setFee(uint256 _feePerMile) external nonpayable returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _feePerMile | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### setPerformanceFee

```solidity
function setPerformanceFee(uint256 _performanceFeePerMille) external nonpayable returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _performanceFeePerMille | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### stakingDualRewards

```solidity
function stakingDualRewards() external view returns (contract IStakingDualRewards)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract IStakingDualRewards | undefined |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```



*See {IERC165-supportsInterface}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceId | bytes4 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### unpause

```solidity
function unpause() external nonpayable
```






### wMatic

```solidity
function wMatic() external view returns (contract IERC20)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract IERC20 | undefined |

### withdrawToEther

```solidity
function withdrawToEther(uint256 _nftTokenId, uint256 _amountOutMinFirstToken, uint256 _amountOutMinSecondToken, uint256 _amountOutETH, uint256 _deadline) external nonpayable
```



*Withdraw yNFT token holder balance to Ether, burn yNFT.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _nftTokenId | uint256 | NFT token id that gives access to certain balance of underlying asset. |
| _amountOutMinFirstToken | uint256 | The minimum amount of output tokens that must be received for the swap not to revert. |
| _amountOutMinSecondToken | uint256 | The minimum amount of output tokens that must be received for the swap not to revert. |
| _amountOutETH | uint256 | The minimum amount of ETH that must be received for the transaction not to revert. |
| _deadline | uint256 | Unix timestamp after which the transaction will revert. |

### withdrawToUnderlyingTokens

```solidity
function withdrawToUnderlyingTokens(uint256 _nftTokenId, uint256 _amountOutMinFirstToken, uint256 _amountOutMinSecondToken, uint256 _deadline) external nonpayable
```



*Withdraw yNFT token holder balance to underlying tokens, burn yNFT.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _nftTokenId | uint256 | NFT token id that gives access to certain balance of underlying asset. |
| _amountOutMinFirstToken | uint256 | The minimum amount of output tokens that must be received for the swap not to revert. |
| _amountOutMinSecondToken | uint256 | The minimum amount of output tokens that must be received for the swap not to revert. |
| _deadline | uint256 | Unix timestamp after which the transaction will revert. |

### yNFT

```solidity
function yNFT() external view returns (contract YNFT)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract YNFT | undefined |



## Events

### BeneficiarySet

```solidity
event BeneficiarySet(address newBeneficiary)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newBeneficiary  | address | undefined |

### FeeSet

```solidity
event FeeSet(uint256 newFee)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newFee  | uint256 | undefined |

### Paused

```solidity
event Paused(address account)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account  | address | undefined |

### PerformanceFeeSet

```solidity
event PerformanceFeeSet(uint256 newPerformanceFee)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newPerformanceFee  | uint256 | undefined |

### RoleAdminChanged

```solidity
event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| role `indexed` | bytes32 | undefined |
| previousAdminRole `indexed` | bytes32 | undefined |
| newAdminRole `indexed` | bytes32 | undefined |

### RoleGranted

```solidity
event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| role `indexed` | bytes32 | undefined |
| account `indexed` | address | undefined |
| sender `indexed` | address | undefined |

### RoleRevoked

```solidity
event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| role `indexed` | bytes32 | undefined |
| account `indexed` | address | undefined |
| sender `indexed` | address | undefined |

### Unpaused

```solidity
event Unpaused(address account)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account  | address | undefined |

### YNftAssetDeposited

```solidity
event YNftAssetDeposited(address token, uint256 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token  | address | undefined |
| amount  | uint256 | undefined |

### YNftCreated

```solidity
event YNftCreated(address pair, uint256 tokenId, uint256 liquidity)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| pair  | address | undefined |
| tokenId  | uint256 | undefined |
| liquidity  | uint256 | undefined |

### YNftLpMiningRewardsAccrued

```solidity
event YNftLpMiningRewardsAccrued(uint256 dQuickBalance, uint256 wMaticBalance)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| dQuickBalance  | uint256 | undefined |
| wMaticBalance  | uint256 | undefined |

### YNftWithdrawn

```solidity
event YNftWithdrawn(address pair, uint256 tokenId, uint256 liquidityWithdrawn, uint256 performanceFee)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| pair  | address | undefined |
| tokenId  | uint256 | undefined |
| liquidityWithdrawn  | uint256 | undefined |
| performanceFee  | uint256 | undefined |



