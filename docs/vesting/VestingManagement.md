# VestingManagement

## Methods

### addNewFixedVesting

```solidity
function addNewFixedVesting(address beneficiaryAddress, uint64 startTimestamp, uint64 durationSeconds) external nonpayable
```

_Adds new vesting schedule for beneficiary. Vesting may not be terminated._

#### Parameters

| Name               | Type    | Description                                                                   |
| ------------------ | ------- | ----------------------------------------------------------------------------- |
| beneficiaryAddress | address | Address to which payout may be done                                           |
| startTimestamp     | uint64  | Timestamp at which accruing value begins                                      |
| durationSeconds    | uint64  | Duration of linear vesting after which all value will be claimable or claimed |

### addNewTerminableVesting

```solidity
function addNewTerminableVesting(address beneficiaryAddress, uint64 startTimestamp, uint64 durationSeconds) external nonpayable
```

_Adds new vesting schedule for beneficiary. Vesting may be terminated by admin._

#### Parameters

| Name               | Type    | Description                                                                   |
| ------------------ | ------- | ----------------------------------------------------------------------------- |
| beneficiaryAddress | address | Address to which payout may be done                                           |
| startTimestamp     | uint64  | Timestamp at which accruing value begins                                      |
| durationSeconds    | uint64  | Duration of linear vesting after which all value will be claimable or claimed |

### fixedVestingWallets

```solidity
function fixedVestingWallets(address, uint256) external view returns (contract VestingWallet)
```

#### Parameters

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |
| \_1  | uint256 | undefined   |

#### Returns

| Name | Type                   | Description |
| ---- | ---------------------- | ----------- |
| \_0  | contract VestingWallet | undefined   |

### getFixedVestingsCount

```solidity
function getFixedVestingsCount(address beneficiary) external view returns (uint256)
```

_Returns number of different fixed (non-terminable) vesting schedules for beneficiary_

#### Parameters

| Name        | Type    | Description      |
| ----------- | ------- | ---------------- |
| beneficiary | address | Vesting receiver |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### getTerminableVestingsCount

```solidity
function getTerminableVestingsCount(address beneficiary) external view returns (uint256)
```

_Returns number of different terminable vesting schedules for beneficiary_

#### Parameters

| Name        | Type    | Description      |
| ----------- | ------- | ---------------- |
| beneficiary | address | Vesting receiver |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### releaseFixed

```solidity
function releaseFixed(address token, address beneficiary) external nonpayable
```

_Releases all vested value of all fixed (non-terminable) vestings of specific token for beneficiary_

#### Parameters

| Name        | Type    | Description                             |
| ----------- | ------- | --------------------------------------- |
| token       | address | Address of token which will be released |
| beneficiary | address | Vesting receiver                        |

### releaseTerminable

```solidity
function releaseTerminable(address token, address beneficiary) external nonpayable
```

_Releases all vested value of all terminable vestings of specific token for beneficiary_

#### Parameters

| Name        | Type    | Description                             |
| ----------- | ------- | --------------------------------------- |
| token       | address | Address of token which will be released |
| beneficiary | address | Vesting receiver                        |

### terminableVestingWallets

```solidity
function terminableVestingWallets(address, uint256) external view returns (contract TerminableVestingWallet)
```

#### Parameters

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |
| \_1  | uint256 | undefined   |

#### Returns

| Name | Type                             | Description |
| ---- | -------------------------------- | ----------- |
| \_0  | contract TerminableVestingWallet | undefined   |

### terminateVesting

```solidity
function terminateVesting(address beneficiaryAddress, uint256 id) external nonpayable
```

_Terminates terminable vesting_

#### Parameters

| Name               | Type    | Description                                                                 |
| ------------------ | ------- | --------------------------------------------------------------------------- |
| beneficiaryAddress | address | Address which will have one of vestings terminated                          |
| id                 | uint256 | Number of vesting contract for specific beneficiary that will be terminated |

### totalReleasableFromFixed

```solidity
function totalReleasableFromFixed(address token, address beneficiary) external view returns (uint256)
```

_Returns releasable value from all fixed (non-terminable) vestings of specific token for beneficiary_

#### Parameters

| Name        | Type    | Description                             |
| ----------- | ------- | --------------------------------------- |
| token       | address | Address of token which will be released |
| beneficiary | address | Vesting receiver                        |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### totalReleasableFromTerminable

```solidity
function totalReleasableFromTerminable(address token, address beneficiary) external view returns (uint256)
```

_Returns releasable value from all terminable vestings of specific token for beneficiary_

#### Parameters

| Name        | Type    | Description                             |
| ----------- | ------- | --------------------------------------- |
| token       | address | Address of token which will be released |
| beneficiary | address | Vesting receiver                        |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |
