pragma solidity 0.6.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DummyERC20 is ERC20 {
    constructor(address mintTo, string memory name, string memory symbol) public ERC20(name, symbol) {
        mint(mintTo);
    }

    function mint(address mintTo) public {
        _mint(mintTo, 1000**18);
    }
}
