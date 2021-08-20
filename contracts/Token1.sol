pragma solidity 0.6.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token1 is ERC20 {

      constructor(address mintTo) public ERC20("Token 1", "TK1") {
        mint(mintTo);
    }

    function mint(address mintTo) public {
        _mint(mintTo, 1000**18);
    }
}