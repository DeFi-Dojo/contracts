// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenVesting
 */
contract TokenVesting is Ownable, ReentrancyGuard{
    using SafeERC20 for IERC20;
    struct VestingSchedule{
        bool initialized;
        // beneficiary of tokens after they are released
        address  beneficiary;
        // cliff period in seconds
        uint256  cliff;
        // start time of the vesting period
        uint256  start;
        // duration of the vesting period in seconds
        uint256  duration;
        // duration of a slice period for the vesting in seconds
        uint256 slicePeriodSeconds;
        // total amount of tokens to be released at the end of the vesting
        uint256 amountTotal;
        // amount of tokens released
        uint256  released;
    }

    // address of the ERC20 token
    IERC20 immutable public token;

    uint256 public vestingSchedulesTotalAmount;
    mapping(address => VestingSchedule) public vestingSchedules;

    event Released(address beneficiary, uint256 amount);
    event Created(address beneficiary, uint256 amount);

    /**
    * @dev Reverts if no vesting schedule matches the passed address.
    */
    modifier vestingScheduleExists(address _beneficiary) {
        require(vestingSchedules[_beneficiary].initialized, "Vesting schedule does not exist");
        _;
    }

        /**
    * @dev Reverts if the given address already has a matching schedule.
    */
    modifier vestingScheduleDoesNotExist(address _beneficiary) {
        require(!vestingSchedules[_beneficiary].initialized, "Vesting schedule already exists");
        _;
    }

    /**
     * @dev Creates a vesting contract.
     * @param _token address of the ERC20 token contract
     */
    constructor(address _token, address _owner) {
        token = IERC20(_token);
        transferOwnership(_owner);
    }

    /**
    * @dev Returns vesting schedule associated with _beneficiary, if it exists.
    * @return vesting schedule
    */
    function getVestingSchedule(address _beneficiary) external view vestingScheduleExists(_beneficiary) returns(VestingSchedule memory) {
        return vestingSchedules[_beneficiary];
    }

    /**
    * @notice Returns the total amount of vesting schedules.
    * @return the total amount of vesting schedules
    */
    function getVestingSchedulesTotalAmount() external view returns(uint256) {
        return vestingSchedulesTotalAmount;
    }

    /**
    * @notice Creates a new vesting schedule for a beneficiary.
    * @param _beneficiary address of the beneficiary to whom vested tokens are transferred
    * @param _start start time of the vesting period
    * @param _cliff duration in seconds of the cliff in which tokens will begin to vest
    * @param _duration duration in seconds of the period in which the tokens will vest
    * @param _slicePeriodSeconds duration of a slice period for the vesting in seconds
    * @param _amount total amount of tokens to be released at the end of the vesting
    */
    function createVestingSchedule(address _beneficiary, uint256 _start, uint256 _cliff, uint256 _duration, uint256 _slicePeriodSeconds, uint256 _amount) public onlyOwner vestingScheduleDoesNotExist(_beneficiary) {
        require(
            getWithdrawableAmount() >= _amount,
            "TokenVesting: not enough tokens to create a vesting schedule"
        );
        require(_duration > 0, "TokenVesting: duration must be > 0");
        require(_amount > 0, "TokenVesting: amount must be > 0");
        require(_slicePeriodSeconds >= 1, "TokenVesting: slicePeriodSeconds must be >= 1");
        uint256 cliff = _start + _cliff;
        vestingSchedules[_beneficiary] = VestingSchedule(true, _beneficiary, cliff, _start, _duration, _slicePeriodSeconds, _amount, 0);
        vestingSchedulesTotalAmount += _amount;
        emit Created(_beneficiary, _amount);
    }

    /**
    * @notice Revokes the vesting schedule for given beneficiary.
    * @param _beneficiary address of beneficiary
    */
    function releaseAll(address _beneficiary) public onlyOwner vestingScheduleExists(_beneficiary) {
        VestingSchedule storage vestingSchedule = vestingSchedules[_beneficiary];
        uint256 releasableAmount = vestingSchedule.amountTotal - vestingSchedule.released;
        vestingSchedulesTotalAmount -= releasableAmount;
        delete vestingSchedules[_beneficiary];
        token.safeTransfer(_beneficiary, releasableAmount);
    }

    /**
    * @notice Withdraw the specified amount if possible.
    * @param amount the amount to withdraw
    */
    function withdraw(uint256 amount) public nonReentrant onlyOwner {
        require(getWithdrawableAmount() >= amount, "TokenVesting: not enough withdrawable funds");
        token.safeTransfer(owner(), amount);
    }

    /**
    * @notice Release vested amount of tokens.
    * @param _beneficiary address of beneficiary
    * @param _amount the amount to release
    */
    function release(address _beneficiary, uint256 _amount) public nonReentrant vestingScheduleExists(_beneficiary) {
        VestingSchedule storage vestingSchedule = vestingSchedules[_beneficiary];
        uint256 vestedAmount = _computeReleasableAmount(vestingSchedule);
        require(vestedAmount >= _amount, "TokenVesting: cannot release tokens, not enough vested tokens");
        vestingSchedule.released += _amount;
        vestingSchedulesTotalAmount -= _amount;
        if (vestingSchedule.amountTotal == vestingSchedule.released) {
            delete vestingSchedules[_beneficiary];
        }
        token.safeTransfer(_beneficiary, _amount);
    }

    /**
    * @notice Computes the vested amount of tokens for the given vesting schedule identifier.
    * @return the vested amount
    */
    function computeReleasableAmount(address _beneficiary) public vestingScheduleExists(_beneficiary) view returns(uint256) {
        VestingSchedule storage vestingSchedule = vestingSchedules[_beneficiary];
        return _computeReleasableAmount(vestingSchedule);
    }

    /**
    * @dev Returns the amount of tokens that can be withdrawn by the owner.
    * @return the amount of tokens
    */
    function getWithdrawableAmount() public view returns(uint256) {
        return token.balanceOf(address(this)) - vestingSchedulesTotalAmount;
    }

    /**
    * @dev Computes the releasable amount of tokens for a vesting schedule.
    * @return the amount of releasable tokens
    */
    function _computeReleasableAmount(VestingSchedule memory vestingSchedule) internal view returns(uint256) {
        uint256 currentTime = block.timestamp;
        if ((currentTime < vestingSchedule.cliff)) {
            return 0;
        } else if (currentTime >= vestingSchedule.start + vestingSchedule.duration) {
            return vestingSchedule.amountTotal - vestingSchedule.released;
        } else {
            uint256 timeFromStart = currentTime - vestingSchedule.start;
            uint secondsPerSlice = vestingSchedule.slicePeriodSeconds;
            uint256 vestedSlicePeriods = timeFromStart / secondsPerSlice;
            uint256 vestedSeconds = vestedSlicePeriods * secondsPerSlice;
            uint256 vestedAmount = vestingSchedule.amountTotal * vestedSeconds / vestingSchedule.duration;
            vestedAmount = vestedAmount - vestingSchedule.released;
            return vestedAmount;
        }
    }

}