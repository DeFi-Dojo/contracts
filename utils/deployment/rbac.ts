import { ethers } from "hardhat";
import { AccessControl } from "../../typechain";

export const transferAdminRoleTo =
  (newAdminAddress: string) => async (contract: AccessControl) => {
    console.log(`Granting admin role to: ${newAdminAddress}`);
    const tx = await contract.grantRole(
      await contract.DEFAULT_ADMIN_ROLE(),
      newAdminAddress
    );
    await tx.wait();
    const [defaultAdmin] = await ethers.getSigners();
    console.log(`Renouncing admin role from: ${defaultAdmin.address}`);
    await contract.renounceRole(
      await contract.DEFAULT_ADMIN_ROLE(),
      defaultAdmin.address
    );
    console.log(`DEFAULT_ADMIN_ROLE granted to: ${newAdminAddress}\n`);
  };
