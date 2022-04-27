# TokenVesting



> TokenVesting





## Methods

### computeReleasableAmount

```solidity
function computeReleasableAmount(address _beneficiary) external view returns (uint256)
```

Computes the vested amount of tokens for the given vesting schedule identifier.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _beneficiary | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | the vested amount |

### createVestingSchedule

```solidity
function createVestingSchedule(address _beneficiary, uint256 _start, uint256 _cliff, uint256 _duration, uint256 _slicePeriodSeconds, uint256 _amount) external nonpayable
```

Creates a new vesting schedule for a beneficiary.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _beneficiary | address | address of the beneficiary to whom vested tokens are transferred |
| _start | uint256 | start time of the vesting period |
| _cliff | uint256 | duration in seconds of the cliff in which tokens will begin to vest |
| _duration | uint256 | duration in seconds of the period in which the tokens will vest |
| _slicePeriodSeconds | uint256 | duration of a slice period for the vesting in seconds |
| _amount | uint256 | total amount of tokens to be released at the end of the vesting |

### getVestingSchedule

```solidity
function getVestingSchedule(address _beneficiary) external view returns (struct TokenVesting.VestingSchedule)
```



*Returns vesting schedule associated with _beneficiary, if it exists.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _beneficiary | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | TokenVesting.VestingSchedule | vesting schedule |

### getVestingSchedulesTotalAmount

```solidity
function getVestingSchedulesTotalAmount() external view returns (uint256)
```

Returns the total amount of vesting schedules.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | the total amount of vesting schedules |

### getWithdrawableAmount

```solidity
function getWithdrawableAmount() external view returns (uint256)
```



*Returns the amount of tokens that can be withdrawn by the owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | the amount of tokens |

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
function release(address _beneficiary, uint256 _amount) external nonpayable
```

Release vested amount of tokens.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _beneficiary | address | address of beneficiary |
| _amount | uint256 | the amount to release |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### token

```solidity
function token() external view returns (contract IERC20)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract IERC20 | undefined |

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |

### vestingSchedules

```solidity
function vestingSchedules(address) external view returns (bool initialized, address beneficiary, uint256 cliff, uint256 start, uint256 duration, uint256 slicePeriodSeconds, uint256 amountTotal, uint256 released)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| initialized | bool | undefined |
| beneficiary | address | undefined |
| cliff | uint256 | undefined |
| start | uint256 | undefined |
| duration | uint256 | undefined |
| slicePeriodSeconds | uint256 | undefined |
| amountTotal | uint256 | undefined |
| released | uint256 | undefined |

### vestingSchedulesTotalAmount

```solidity
function vestingSchedulesTotalAmount() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### withdraw

```solidity
function withdraw(uint256 amount) external nonpayable
```

Withdraw the specified amount if possible.



#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | the amount to withdraw |



## Events

### Created

```solidity
event Created(address beneficiary, uint256 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| beneficiary  | address | undefined |
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

### Released

```solidity
event Released(address beneficiary, uint256 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| beneficiary  | address | undefined |
| amount  | uint256 | undefined |



