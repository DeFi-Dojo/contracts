import { ethers } from "hardhat";

import { AaveYNFTVault } from "../../typechain";

async function main() {
    const { NFT_TOKEN_ID, VAULT_ADDRESS } = process.env;

    if (!NFT_TOKEN_ID || !VAULT_ADDRESS) {
        throw new Error("Required NFT_TOKEN_ID or VAULT_ADDRESS env variable is not defined");
    }

    const contractName = "DummyAaveYNFTVault";
    const yNFTVault = await ethers.getContractAt<AaveYNFTVault>(
        "DummyAaveYNFTVault",
        VAULT_ADDRESS
      );

    const balance = await yNFTVault.balanceOf(NFT_TOKEN_ID);
    const balanceUnderlying = await yNFTVault.balanceOfUnderlying(NFT_TOKEN_ID);
    console.log(`${contractName} balance: ${ethers.utils.formatUnits(balance, "ether")}`);
    console.log(`${contractName} balanceUnderlying: ${ethers.utils.formatUnits(balanceUnderlying, "ether")}`);

    const totalSupply = await yNFTVault.totalSupply();
    console.log(`${contractName} totalSupply: ${ethers.utils.formatUnits(totalSupply, "ether")}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
