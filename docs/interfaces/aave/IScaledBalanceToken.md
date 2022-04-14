# IScaledBalanceToken









## Methods

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




