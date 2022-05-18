# TerminableVestingWallet

## Methods

### beneficiary

```solidity
function beneficiary() external view returns (address)
```

_Getter for the beneficiary address._

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### duration

```solidity
function duration() external view returns (uint256)
```

_Getter for the vesting duration._

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### isTerminated

```solidity
function isTerminated() external view returns (bool)
```

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |

### owner

```solidity
function owner() external view returns (address)
```

_Returns the address of the current owner._

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### release

```solidity
function release(address token) external nonpayable
```

_Release the tokens that have already vested. Emits a {TokensReleased} event._

#### Parameters

| Name  | Type    | Description |
| ----- | ------- | ----------- |
| token | address | undefined   |

### release

```solidity
function release() external nonpayable
```

_Release the native token (ether) that have already vested. Emits a {TokensReleased} event._

### released

```solidity
function released() external view returns (uint256)
```

_Amount of eth already released_

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### released

```solidity
function released(address token) external view returns (uint256)
```

_Amount of token already released_

#### Parameters

| Name  | Type    | Description |
| ----- | ------- | ----------- |
| token | address | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```

_Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner._

### start

```solidity
function start() external view returns (uint256)
```

_Getter for the start timestamp._

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### terminateVesting

```solidity
function terminateVesting() external nonpayable
```

_Terminates vesting - stops accruing further assets._

### terminationTimestamp

```solidity
function terminationTimestamp() external view returns (uint256)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```

_Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner._

#### Parameters

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| newOwner | address | undefined   |

### vestedAmount

```solidity
function vestedAmount(uint64 timestamp) external view returns (uint256)
```

_Calculates the amount of ether that has already vested. Default implementation is a linear vesting curve._

#### Parameters

| Name      | Type   | Description |
| --------- | ------ | ----------- |
| timestamp | uint64 | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### vestedAmount

```solidity
function vestedAmount(address token, uint64 timestamp) external view returns (uint256)
```

_Calculates the amount of tokens that has already vested. Default implementation is a linear vesting curve._

#### Parameters

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| token     | address | undefined   |
| timestamp | uint64  | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

## Events

### ERC20Released

```solidity
event ERC20Released(address indexed token, uint256 amount)
```

#### Parameters

| Name            | Type    | Description |
| --------------- | ------- | ----------- |
| token `indexed` | address | undefined   |
| amount          | uint256 | undefined   |

### EtherReleased

```solidity
event EtherReleased(uint256 amount)
```

#### Parameters

| Name   | Type    | Description |
| ------ | ------- | ----------- |
| amount | uint256 | undefined   |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```

#### Parameters

| Name                    | Type    | Description |
| ----------------------- | ------- | ----------- |
| previousOwner `indexed` | address | undefined   |
| newOwner `indexed`      | address | undefined   |
