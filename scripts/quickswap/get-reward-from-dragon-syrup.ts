import { ethers } from "hardhat";
import { QuickswapYNFTVault } from "../../typechain";
import { waitForReceipt } from "../../utils/deployment";
import configEnv from "../../config";

const { VAULT_ADDRESS } = configEnv;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const yNFTVault = await ethers.getContractAt<QuickswapYNFTVault>(
    "QuickswapYNFTVault",
    VAULT_ADDRESS
  );

  await yNFTVault.getRewardFromDragonSyrup().then(waitForReceipt);

  console.log("got reward from dragon syrup");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
