
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestERC20 is ERC20 {

    constructor() ERC20("Test", "TEST") {}

     function mint() public returns (bool)
    {
        _mint(msg.sender, 10 * 10**18);
        return true;
    }
}
