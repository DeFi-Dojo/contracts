import { ethers } from "hardhat";
import { waitForReceipt } from "../utils/deployment";
import { YNFTVault } from "../typechain";
import configEnv from "../config";

const { VAULT_ADDRESS } = configEnv;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const yNFTVault = await ethers.getContractAt<YNFTVault>(
    "YNFTVault",
    VAULT_ADDRESS
  );

  const balanceBefore = await yNFTVault.getAmountToClaim();

  console.log("balanceBefore", balanceBefore.toString());

  await yNFTVault.claimRewards().then(waitForReceipt);

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
