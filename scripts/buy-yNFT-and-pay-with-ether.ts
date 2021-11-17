import { ethers } from "hardhat";
import { waitForReceipt } from "../utils/deployment";
import * as consts from "../consts";
import configEnv from "../config";

const { VAULT_ADDRESS } = configEnv;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const YNFTVaultContract = await ethers.getContractFactory("YNFTVault");

  const yNFTVault = await YNFTVaultContract.attach(VAULT_ADDRESS);

  // current price of MATIC/DAI
  const amountOutMin = BigInt(0.2 * 10 ** consts.DECIMALS.DAI);

  await yNFTVault
    .createYNFTForEther(amountOutMin, {
      value: ethers.utils.parseEther("0.2"),
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
