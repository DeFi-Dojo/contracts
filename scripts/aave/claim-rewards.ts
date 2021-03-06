import { ethers } from "hardhat";
import { waitForReceipt } from "../../utils/deployment";
import { AaveYNFTVault } from "../../typechain";
import configEnv from "../../config";
import * as consts from "../../consts";

const { VAULT_ADDRESS } = configEnv;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const yNFTVault = await ethers.getContractAt<AaveYNFTVault>(
    "AaveYNFTVault",
    VAULT_ADDRESS
  );

  const balanceBefore = await yNFTVault.getAmountToClaim();

  console.log("balanceBefore", balanceBefore.toString());

  const amountToClaim = await yNFTVault.getAmountToClaim();
  console.log("amountToClaim", amountToClaim.toString());

  const deadline = Math.round(Date.now() / 1000) + consts.SECONDS_IN_ONE_DAY;

  // frontend should calculate and pass it to the function, using "0" for convenience
  const amountOutMin = 0;

  await yNFTVault.claimRewards(amountOutMin, deadline).then(waitForReceipt);

  console.log("claimed");

  const balanceAfter = await yNFTVault.getAmountToClaim();

  console.log("balanceAfter", balanceAfter.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
