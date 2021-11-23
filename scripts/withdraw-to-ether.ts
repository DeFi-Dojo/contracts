import { ethers } from "hardhat";
import { waitForReceipt } from "../utils/deployment";
import { AaveYNFTVault } from "../typechain";

import configEnv from "../config";

const { VAULT_ADDRESS } = configEnv;

const NFT_TOKEN_ID = 0;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const yNFTVault = await ethers.getContractAt<AaveYNFTVault>(
    "AaveYNFTVault",
    VAULT_ADDRESS
  );

  await yNFTVault.withdrawToEther(NFT_TOKEN_ID).then(waitForReceipt);

  console.log("withdrawn");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
