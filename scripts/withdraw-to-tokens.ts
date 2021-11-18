import { ethers } from "hardhat";
import { waitForReceipt } from "../utils/deployment";

import configEnv from "../config";
import { YNFTVault } from "../typechain";

const { VAULT_ADDRESS } = configEnv;

const NFT_TOKEN_ID = 0;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const yNFTVault = await ethers.getContractAt<YNFTVault>(
    "YNFTVault",
    VAULT_ADDRESS
  );

  await yNFTVault.withdrawToUnderlyingToken(NFT_TOKEN_ID).then(waitForReceipt);

  console.log("withdrawn");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
