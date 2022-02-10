// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DojoToken is ERC20 {
  string name_ = "$DOJO Token";
  string symbol_ = "DOJO";
  uint256 supply_ = 400000000;

  constructor() ERC20(name_, symbol_) {
    _mint(msg.sender, supply_);
  }
}
