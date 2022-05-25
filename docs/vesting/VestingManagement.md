# VestingManagement









## Methods

### addNewFixedVesting

```solidity
function addNewFixedVesting(address beneficiaryAddress, uint64 startTimestamp, uint64 durationSeconds) external nonpayable
```



*Adds new vesting schedule for beneficiary. Vesting may not be terminated.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| beneficiaryAddress | address | Address to which payout may be done |
| startTimestamp | uint64 | Timestamp at which accruing value begins |
| durationSeconds | uint64 | Duration of linear vesting after which all value will be claimable or claimed |

### addNewTerminableVesting

```solidity
function addNewTerminableVesting(address beneficiaryAddress, uint64 startTimestamp, uint64 durationSeconds) external nonpayable
```



*Adds new vesting schedule for beneficiary. Vesting may be terminated by admin.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| beneficiaryAddress | address | Address to which payout may be done |
| startTimestamp | uint64 | Timestamp at which accruing value begins |
| durationSeconds | uint64 | Duration of linear vesting after which all value will be claimable or claimed |

### fixedVestingWallets

```solidity
function fixedVestingWallets(address, uint256) external view returns (contract VestingWallet)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |
| _1 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract VestingWallet | undefined |

### getFixedVestingsCount

```solidity
function getFixedVestingsCount(address beneficiary) external view returns (uint256)
```



*Returns number of different fixed (non-terminable) vesting schedules for beneficiary*

#### Parameters

| Name | Type | Description |
|---|---|---|
| beneficiary | address | Vesting receiver |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | number of fixed vesting contracts |

### getTerminableVestingsCount

```solidity
function getTerminableVestingsCount(address beneficiary) external view returns (uint256)
```



*Returns number of different terminable vesting schedules for beneficiary*

#### Parameters

| Name | Type | Description |
|---|---|---|
| beneficiary | address | Vesting receiver |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | number of terminable vesting contracts |

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### releaseFixed

```solidity
function releaseFixed(address token, address beneficiary) external nonpayable
```



*Releases all vested value of all fixed (non-terminable) vestings of specific token for beneficiary*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | Address of token which will be released |
| beneficiary | address | Vesting receiver |

### releaseTerminable

```solidity
function releaseTerminable(address token, address beneficiary) external nonpayable
```



*Releases all vested value of all terminable vestings of specific token for beneficiary*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | Address of token which will be released |
| beneficiary | address | Vesting receiver |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### terminableVestingWallets

```solidity
function terminableVestingWallets(address, uint256) external view returns (contract TerminableVestingWallet)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |
| _1 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract TerminableVestingWallet | undefined |

### terminateVesting

```solidity
function terminateVesting(address beneficiaryAddress, uint256 id) external nonpayable
```



*Terminates terminable vesting*

#### Parameters

| Name | Type | Description |
|---|---|---|
| beneficiaryAddress | address | Address which will have one of vestings terminated |
| id | uint256 | Number of vesting contract for specific beneficiary that will be terminated |

### totalReleasableFromFixed

```solidity
function totalReleasableFromFixed(address token, address beneficiary) external view returns (uint256)
```



*Returns releasable value from all fixed (non-terminable) vestings of specific token for beneficiary*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | Address of token which will be released |
| beneficiary | address | Vesting receiver |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | total releasable value from fixed contracts |

### totalReleasableFromTerminable

```solidity
function totalReleasableFromTerminable(address token, address beneficiary) external view returns (uint256)
```



*Returns releasable value from all terminable vestings of specific token for beneficiary*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | Address of token which will be released |
| beneficiary | address | Vesting receiver |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | total releasable value from terminable contracts |

### totalReleasedFromFixed

```solidity
function totalReleasedFromFixed(address token, address beneficiary) external view returns (uint256)
```



*Returns released value from all fixed (non-terminable) vestings of specific token for beneficiary*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | Address of released token |
| beneficiary | address | Vesting receiver |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | total released value from fixed contracts |

### totalReleasedFromTerminable

```solidity
function totalReleasedFromTerminable(address token, address beneficiary) external view returns (uint256)
```



*Returns released value from all terminable vestings of specific token for beneficiary*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | Address of released token |
| beneficiary | address | Vesting receiver |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | total released value from terminable contracts |

### totalToBeReleasedFromFixed

```solidity
function totalToBeReleasedFromFixed(address token, address beneficiary) external view returns (uint256)
```



*Returns total value that can be released during vesting period from all fixed (non-terminable) vestings of specific token for beneficiary*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | Address of vested token |
| beneficiary | address | Vesting receiver |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | total value that can be released during vesting period from fixed vesting contracts |

### totalToBeReleasedFromTerminable

```solidity
function totalToBeReleasedFromTerminable(address token, address beneficiary) external view returns (uint256)
```



*Returns total value that can be released during vesting period from all terminable vestings of specific token for beneficiary*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | Address of vested token |
| beneficiary | address | Vesting receiver |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | total value that can be released during vesting period from terminable vesting contracts |

### totalTokenBalanceFixed

```solidity
function totalTokenBalanceFixed(address token, address beneficiary) external view returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | undefined |
| beneficiary | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### totalTokenBalanceTerminable

```solidity
function totalTokenBalanceTerminable(address token, address beneficiary) external view returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | undefined |
| beneficiary | address | undefined |

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

### withdrawAllFromTerminated

```solidity
function withdrawAllFromTerminated(address token, address beneficiary, address to) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | undefined |
| beneficiary | address | undefined |
| to | address | undefined |



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



