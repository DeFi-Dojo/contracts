import { ethers } from "hardhat";
import { waitForReceipt } from "../../utils/deployment";
import * as consts from "../../consts";
import { AaveYNFTVault } from "../../typechain";
import configEnv from "../../config";

const { VAULT_ADDRESS } = configEnv;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const yNFTVault = await ethers.getContractAt(
    "AaveYNFTVault",
    VAULT_ADDRESS
  );

  // frontend should calculate and pass it to the function, using "0" for convenience
  const amountOutMin = 0;

  const deadline = Math.round(Date.now() / 1000) + consts.SECONDS_IN_ONE_DAY;

  await yNFTVault
    .createYNFTForEther(amountOutMin, deadline, {
      value: ethers.utils.parseEther("0.1"),
    })
    .then(waitForReceipt);
  console.log("created");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
