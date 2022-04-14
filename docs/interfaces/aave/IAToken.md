# IAToken









## Methods

### POOL

```solidity
function POOL() external nonpayable returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### UNDERLYING_ASSET_ADDRESS

```solidity
function UNDERLYING_ASSET_ADDRESS() external nonpayable returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### allowance

```solidity
function allowance(address owner, address spender) external view returns (uint256)
```



*Returns the remaining number of tokens that `spender` will be allowed to spend on behalf of `owner` through {transferFrom}. This is zero by default. This value changes when {approve} or {transferFrom} are called.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |
| spender | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### approve

```solidity
function approve(address spender, uint256 amount) external nonpayable returns (bool)
```



*Sets `amount` as the allowance of `spender` over the caller&#39;s tokens. Returns a boolean value indicating whether the operation succeeded. IMPORTANT: Beware that changing an allowance with this method brings the risk that someone may use both the old and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this race condition is to first reduce the spender&#39;s allowance to 0 and set the desired value afterwards: https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729 Emits an {Approval} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| spender | address | undefined |
| amount | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### balanceOf

```solidity
function balanceOf(address account) external view returns (uint256)
```



*Returns the amount of tokens owned by `account`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### burn

```solidity
function burn(address user, address receiverOfUnderlying, uint256 amount, uint256 index) external nonpayable
```



*Burns aTokens from `user` and sends the equivalent amount of underlying to `receiverOfUnderlying`*

#### Parameters

| Name | Type | Description |
|---|---|---|
| user | address | The owner of the aTokens, getting them burned |
| receiverOfUnderlying | address | The address that will receive the underlying |
| amount | uint256 | The amount being burned |
| index | uint256 | The new liquidity index of the reserve* |

### getScaledUserBalanceAndSupply

```solidity
function getScaledUserBalanceAndSupply(address user) external view returns (uint256, uint256)
```



*Returns the scaled balance of the user and the scaled total supply.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| user | address | The address of the user |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The scaled balance of the user |
| _1 | uint256 | The scaled balance and the scaled total supply* |

### mint

```solidity
function mint(address user, uint256 amount, uint256 index) external nonpayable returns (bool)
```



*Mints `amount` aTokens to `user`*

#### Parameters

| Name | Type | Description |
|---|---|---|
| user | address | The address receiving the minted tokens |
| amount | uint256 | The amount of tokens getting minted |
| index | uint256 | The new liquidity index of the reserve |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | `true` if the the previous balance of the user was 0 |

### mintToTreasury

```solidity
function mintToTreasury(uint256 amount, uint256 index) external nonpayable
```



*Mints aTokens to the reserve treasury*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | The amount of tokens getting minted |
| index | uint256 | The new liquidity index of the reserve |

### scaledBalanceOf

```solidity
function scaledBalanceOf(address user) external view returns (uint256)
```



*Returns the scaled balance of the user. The scaled balance is the sum of all the updated stored balance divided by the reserve&#39;s liquidity index at the moment of the update*

#### Parameters

| Name | Type | Description |
|---|---|---|
| user | address | The user whose balance is calculated |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The scaled balance of the user* |

### scaledTotalSupply

```solidity
function scaledTotalSupply() external view returns (uint256)
```



*Returns the scaled total supply of the variable debt token. Represents sum(debt/index)*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The scaled total supply* |

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```



*Returns the amount of tokens in existence.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### transfer

```solidity
function transfer(address recipient, uint256 amount) external nonpayable returns (bool)
```



*Moves `amount` tokens from the caller&#39;s account to `recipient`. Returns a boolean value indicating whether the operation succeeded. Emits a {Transfer} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| recipient | address | undefined |
| amount | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### transferFrom

```solidity
function transferFrom(address sender, address recipient, uint256 amount) external nonpayable returns (bool)
```



*Moves `amount` tokens from `sender` to `recipient` using the allowance mechanism. `amount` is then deducted from the caller&#39;s allowance. Returns a boolean value indicating whether the operation succeeded. Emits a {Transfer} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| sender | address | undefined |
| recipient | address | undefined |
| amount | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### transferOnLiquidation

```solidity
function transferOnLiquidation(address from, address to, uint256 value) external nonpayable
```



*Transfers aTokens in the event of a borrow being liquidated, in case the liquidators reclaims the aToken*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | The address getting liquidated, current owner of the aTokens |
| to | address | The recipient |
| value | uint256 | The amount of tokens getting transferred* |

### transferUnderlyingTo

```solidity
function transferUnderlyingTo(address user, uint256 amount) external nonpayable returns (uint256)
```



*Transfers the underlying asset to `target`. Used by the LendingPool to transfer assets in borrow(), withdraw() and flashLoan()*

#### Parameters

| Name | Type | Description |
|---|---|---|
| user | address | The recipient of the aTokens |
| amount | uint256 | The amount getting transferred |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The amount transferred* |



## Events

### Approval

```solidity
event Approval(address indexed owner, address indexed spender, uint256 value)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| spender `indexed` | address | undefined |
| value  | uint256 | undefined |

### BalanceTransfer

```solidity
event BalanceTransfer(address indexed from, address indexed to, uint256 value, uint256 index)
```



*Emitted during the transfer action*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | The user whose tokens are being transferred |
| to `indexed` | address | The recipient |
| value  | uint256 | The amount being transferred |
| index  | uint256 | The new liquidity index of the reserve* |

### Burn

```solidity
event Burn(address indexed from, address indexed target, uint256 value, uint256 index)
```



*Emitted after aTokens are burned*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | The owner of the aTokens, getting them burned |
| target `indexed` | address | The address that will receive the underlying |
| value  | uint256 | The amount being burned |
| index  | uint256 | The new liquidity index of the reserve* |

### Mint

```solidity
event Mint(address indexed from, uint256 value, uint256 index)
```



*Emitted after the mint action*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | The address performing the mint |
| value  | uint256 | The amount being |
| index  | uint256 | The new liquidity index of the reserve* |

### Transfer

```solidity
event Transfer(address indexed from, address indexed to, uint256 value)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| value  | uint256 | undefined |



