# AaveYNFTVault









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

### aToken

```solidity
function aToken() external view returns (contract IAToken)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract IAToken | undefined |

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





#### Parameters

| Name | Type | Description |
|---|---|---|
| _nftTokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

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

### claimRewards

```solidity
function claimRewards(uint256 _amountOutMin, uint256 _deadline) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _amountOutMin | uint256 | undefined |
| _deadline | uint256 | undefined |

### createYNFT

```solidity
function createYNFT(address _tokenIn, uint256 _amountIn, uint256 _amountOutMin, uint256 _deadline) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _tokenIn | address | undefined |
| _amountIn | uint256 | undefined |
| _amountOutMin | uint256 | undefined |
| _deadline | uint256 | undefined |

### createYNFTForEther

```solidity
function createYNFTForEther(uint256 _amountOutMin, uint256 _deadline) external payable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _amountOutMin | uint256 | undefined |
| _deadline | uint256 | undefined |

### dexRouter

```solidity
function dexRouter() external view returns (contract IUniswapV2Router02)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract IUniswapV2Router02 | undefined |

### feePerMile

```solidity
function feePerMile() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### getAmountToClaim

```solidity
function getAmountToClaim() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

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

### incentivesController

```solidity
function incentivesController() external view returns (contract IAaveIncentivesController)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract IAaveIncentivesController | undefined |

### nftToken

```solidity
function nftToken() external view returns (contract IERC721)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract IERC721 | undefined |

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

### pool

```solidity
function pool() external view returns (contract ILendingPool)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract ILendingPool | undefined |

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

### rewardToken

```solidity
function rewardToken() external view returns (contract IERC20)
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

### underlyingToken

```solidity
function underlyingToken() external view returns (contract IERC20)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract IERC20 | undefined |

### unpause

```solidity
function unpause() external nonpayable
```






### withdrawToEther

```solidity
function withdrawToEther(uint256 _nftTokenId, uint256 _amountOutMin, uint256 _deadline) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _nftTokenId | uint256 | undefined |
| _amountOutMin | uint256 | undefined |
| _deadline | uint256 | undefined |

### withdrawToUnderlyingTokens

```solidity
function withdrawToUnderlyingTokens(uint256 _nftTokenId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _nftTokenId | uint256 | undefined |

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

### RewardsClaimed

```solidity
event RewardsClaimed(address underlyingToken, uint256 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| underlyingToken  | address | undefined |
| amount  | uint256 | undefined |

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

### YNftCreated

```solidity
event YNftCreated(address underlyingToken, uint256 tokenId, uint256 deposited)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| underlyingToken  | address | undefined |
| tokenId  | uint256 | undefined |
| deposited  | uint256 | undefined |

### YNftWithdrawn

```solidity
event YNftWithdrawn(address underlyingToken, uint256 tokenId, uint256 amountWithdrawn, uint256 performanceFee)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| underlyingToken  | address | undefined |
| tokenId  | uint256 | undefined |
| amountWithdrawn  | uint256 | undefined |
| performanceFee  | uint256 | undefined |



