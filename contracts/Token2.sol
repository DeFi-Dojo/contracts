pragma solidity =0.5.16;

import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token2 is ERC20, ERC20Detailed {
    constructor(address mintTo) public ERC20Detailed("Token 2", "TK2", 18) {
        mint(mintTo);
    }

    function mint(address mintTo) public {
        _mint(mintTo, 1000**18);
    }
}
