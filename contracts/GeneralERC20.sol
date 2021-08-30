pragma solidity =0.5.16;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GeneralERC20 is ERC20, ERC20Detailed {
    constructor(address mintTo, string memory name, string memory shortName) public ERC20Detailed(name, shortName, 18) {
        mint(mintTo);
    }

    function mint(address mintTo) public {
        _mint(mintTo, 1000**18);
    }
}
