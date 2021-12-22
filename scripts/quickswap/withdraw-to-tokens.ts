import { ethers } from "hardhat";
import { QuickswapYNFTVault } from "../../typechain";
import { waitForReceipt } from "../../utils/deployment";
import configEnv from "../../config";
import * as consts from "../../consts";

const { VAULT_ADDRESS } = configEnv;

const NFT_TOKEN_ID = 0;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const yNFTVault = await ethers.getContractAt<QuickswapYNFTVault>(
    "QuickswapYNFTVault",
    VAULT_ADDRESS
  );

  // frontend should calculate and pass it to the function, using "0" for convenience
  const amountOutMinFirstToken = 0;
  const amountOutMinSecondToken = 0;
  const deadline = Math.round(Date.now() / 1000) + consts.SECONDS_IN_ONE_DAY;

  await yNFTVault
    .withdrawToUnderlyingTokens(
      NFT_TOKEN_ID,
      amountOutMinFirstToken,
      amountOutMinSecondToken,
      deadline
    )
    .then(waitForReceipt);

  console.log("withdrawn");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
