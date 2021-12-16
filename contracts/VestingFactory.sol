pragma solidity ^0.8.0;

import "./Vesting.sol";
import "./TeamVesting.sol";

contract VestingFactory {
    mapping(address => address) public vestingForUser;
    mapping(address => address) public vestingForTeamMember;

    constructor()
    {}

    event CreatedVestingForUser(address userAddr, address contractAddr);
    event CreatedVestingForTeamMember(address teamMemberAddr, address contractAddr);

    function createVestingForUser(address user) external returns(address)
    {
        require(vestingForUser[user] == address(0), "Vesting contract already exists");
        Vesting v = new Vesting(user);
        vestingForUser[user] = address(v);
        emit CreatedVestingForUser(user, address(v));
        return address(v);
    }

    function createVestingForTeamMember(address teamMember) external returns(address)
    {
        require(vestingForTeamMember[teamMember] == address(0), "Vesting contract already exists");
        TeamVesting v = new TeamVesting(teamMember);
        vestingForTeamMember[teamMember] = address(v);
        emit CreatedVestingForUser(teamMember, address(v));
        return address(v);
    }
}
