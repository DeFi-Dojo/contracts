# Vesting









## Methods

### addVest

```solidity
function addVest(contract IERC20 _token, uint256 _amount, uint256 _startTimestamp, uint256 _durationWeeks) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | contract IERC20 | undefined |
| _amount | uint256 | undefined |
| _startTimestamp | uint256 | undefined |
| _durationWeeks | uint256 | undefined |

### beneficiary

```solidity
function beneficiary() external view returns (address)
```



*Getter for the beneficiary address.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### duration

```solidity
function duration() external view returns (uint256)
```



*Getter for the vesting duration.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### release

```solidity
function release(address token) external nonpayable
```



*Release the tokens that have already vested. Emits a {TokensReleased} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | undefined |

### release

```solidity
function release() external nonpayable
```



*Release the native token (ether) that have already vested. Emits a {TokensReleased} event.*


### released

```solidity
function released() external view returns (uint256)
```



*Amount of eth already released*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### released

```solidity
function released(address token) external view returns (uint256)
```



*Amount of token already released*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### start

```solidity
function start() external view returns (uint256)
```



*Getter for the start timestamp.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### vestedAmount

```solidity
function vestedAmount(uint64 timestamp) external view returns (uint256)
```



*Calculates the amount of ether that has already vested. Default implementation is a linear vesting curve.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| timestamp | uint64 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### vestedAmount

```solidity
function vestedAmount(address _token, uint64 _timestamp) external view returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | undefined |
| _timestamp | uint64 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### vests

```solidity
function vests(uint256) external view returns (contract IERC20 token, uint256 startWeek, uint256 durationWeeks, uint256 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| token | contract IERC20 | undefined |
| startWeek | uint256 | undefined |
| durationWeeks | uint256 | undefined |
| amount | uint256 | undefined |



## Events

### ERC20Released

```solidity
event ERC20Released(address indexed token, uint256 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | address | undefined |
| amount  | uint256 | undefined |

### EtherReleased

```solidity
event EtherReleased(uint256 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| amount  | uint256 | undefined |



