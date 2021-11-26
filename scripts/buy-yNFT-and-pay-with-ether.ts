import { ethers } from "hardhat";
import { waitForReceipt } from "../utils/deployment";
import * as consts from "../consts";
import { AaveYNFTVault } from "../typechain";
import configEnv from "../config";

const { VAULT_ADDRESS } = configEnv;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const yNFTVault = await ethers.getContractAt<AaveYNFTVault>(
    "AaveYNFTVault",
    VAULT_ADDRESS
  );

  // current price of MATIC/DAI
  const amountOutMin = BigInt(0.1 * 10 ** consts.DECIMALS.DAI);

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
