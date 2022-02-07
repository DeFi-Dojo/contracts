import { ethers } from "hardhat";
import { waitForReceipt } from "../../utils/deployment";

import configEnv from "../../config";
import { AaveYNFTVault } from "../../typechain";

const { VAULT_ADDRESS } = configEnv;

const NFT_TOKEN_ID = 1;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const yNFTVault = await ethers.getContractAt<AaveYNFTVault>(
    "AaveYNFTVault",
    VAULT_ADDRESS
  );

  await yNFTVault.withdrawToUnderlyingTokens(NFT_TOKEN_ID).then(waitForReceipt);

  console.log("withdrawn");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
