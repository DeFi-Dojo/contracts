pragma solidity =0.5.16;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token1 is ERC20, ERC20Detailed {
    constructor(address mintTo) public ERC20Detailed("Token 1", "TK1", 18) {
        mint(mintTo);
        console.log("minTo", mintTo);
    }

    function mint(address mintTo) public {
        _mint(mintTo, 1000**18);
    }
}
