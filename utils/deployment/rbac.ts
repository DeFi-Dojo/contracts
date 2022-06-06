import { ethers } from "hardhat";
import { AccessControl } from "../../typechain";

export const transferAdminRoleTo =
  (newAdminAddress: string) => async (contract: AccessControl) => {
    await contract.grantRole(
      await contract.DEFAULT_ADMIN_ROLE(),
      newAdminAddress
    );
    const [defaultAdmin] = await ethers.getSigners();
    await contract.renounceRole(
      await contract.DEFAULT_ADMIN_ROLE(),
      defaultAdmin.address
    );
    console.log(`DEFAULT_ADMIN_ROLE granted to: ${newAdminAddress}\n`);
  };
