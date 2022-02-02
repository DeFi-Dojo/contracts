import { ethers } from "hardhat";
import { waitForReceipt } from "../../utils/deployment";
import { AaveYNFTVault } from "../../typechain";
import * as consts from "../../consts";

import configEnv from "../../config";

const { VAULT_ADDRESS } = configEnv;

const NFT_TOKEN_ID = 1;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const yNFTVault = await ethers.getContractAt(
    "AaveYNFTVault",
    VAULT_ADDRESS
  );
  const deadline = Math.round(Date.now() / 1000) + consts.SECONDS_IN_ONE_DAY;

  // frontend should calculate and pass it to the function, using "0" for convenience
  const amountOutMin = 0;

  await yNFTVault
    .withdrawToEther(NFT_TOKEN_ID, amountOutMin, deadline)
    .then(waitForReceipt);

  console.log("withdrawn");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
