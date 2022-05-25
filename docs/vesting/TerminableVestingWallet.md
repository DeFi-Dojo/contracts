# TerminableVestingWallet









## Methods

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

### isTerminated

```solidity
function isTerminated() external view returns (bool)
```



*Indicates if current vesting is terminated*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | true if vesting is terminated |

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

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

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### start

```solidity
function start() external view returns (uint256)
```



*Getter for the start timestamp.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### terminateVesting

```solidity
function terminateVesting() external nonpayable
```



*Terminates vesting - stops accruing further assets.*


### terminationTimestamp

```solidity
function terminationTimestamp() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |

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
function vestedAmount(address token, uint64 timestamp) external view returns (uint256)
```



*Calculates the amount of tokens that has already vested. Default implementation is a linear vesting curve.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | undefined |
| timestamp | uint64 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### withdrawAllFromTerminated

```solidity
function withdrawAllFromTerminated(address token, address to) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | undefined |
| to | address | undefined |



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

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |



