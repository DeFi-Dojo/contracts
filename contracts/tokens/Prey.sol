
pragma solidity 0.6.6;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IMintableERC20} from "@maticnetwork/pos-portal/contracts/root/RootToken/IMintableERC20.sol";
import {NativeMetaTransaction} from "@maticnetwork/pos-portal/contracts/common/NativeMetaTransaction.sol";
import {ContextMixin} from "@maticnetwork/pos-portal/contracts/common/ContextMixin.sol";
import {AccessControlMixin} from "@maticnetwork/pos-portal/contracts/common/AccessControlMixin.sol";

contract Prey is
    ERC20,
    AccessControlMixin,
    NativeMetaTransaction,
    ContextMixin,
    IMintableERC20
{
    bytes32 public constant PREDICATE_ROLE = keccak256("PREDICATE_ROLE");

    constructor(string memory name_, string memory symbol_)
        public
        ERC20(name_, symbol_)
    {
        _setupContractId("Prey");
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(PREDICATE_ROLE, _msgSender());

        _mint(_msgSender(), 10**10 * (10**18));
        _initializeEIP712(name_);
    }

    /**
     * @dev See {IMintableERC20-mint}.
     */
    function mint(address user, uint256 amount) external override only(PREDICATE_ROLE) {
        _mint(user, amount);
    }

    function _msgSender()
        internal
        override
        view
        returns (address payable sender)
    {
        return ContextMixin.msgSender();
    }
}
