// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./Vesting.sol";
import "./TeamVesting.sol";

contract VestingFactory {
    mapping(address => address) public vestingForUser;
    mapping(address => address) public vestingForTeamMember;

    constructor()
    {}

    event CreatedVestingForUser(address _userAddr, address _contractAddr);
    event CreatedVestingForTeamMember(address _teamMemberAddr, address _contractAddr);

    function createVestingForUser(address _user) external returns(address)
    {
        require(vestingForUser[_user] == address(0), "Vesting contract already exists");
        Vesting v = new Vesting(_user);
        vestingForUser[_user] = address(v);
        emit CreatedVestingForUser(_user, address(v));
        return address(v);
    }

    function createVestingForTeamMember(address _teamMember) external returns(address)
    {
        require(vestingForTeamMember[_teamMember] == address(0), "Vesting contract already exists");
        TeamVesting v = new TeamVesting(_teamMember);
        vestingForTeamMember[_teamMember] = address(v);
        emit CreatedVestingForTeamMember(_teamMember, address(v));
        return address(v);
    }
}
