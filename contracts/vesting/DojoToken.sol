// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DojoToken is ERC20 {
  string private name_ = "$DOJO Token";
  string private symbol_ = "DOJO";
  uint256 private supply_ = 400000000 ether;

  constructor(address _mintTarget) ERC20(name_, symbol_) {
    _mint(_mintTarget, supply_);
  }
}
