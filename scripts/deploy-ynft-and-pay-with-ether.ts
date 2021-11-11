import { ethers } from "hardhat";
import { YNFTVault } from "../typechain";
import { deployContract, waitForReceipt } from "../utils/deployment";
import configEnv from "../config";
import * as consts from "../consts";

const { ADDRESSES } = configEnv;

const NFT_TOKEN_ID = 0;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const yNFTVault = await deployContract<YNFTVault>("YNFTVault", [
    ADDRESSES.ROUTER_02_SUSHISWAP,
    ADDRESSES.A_DAI,
    ADDRESSES.INCENTIVES_CONTROLLER,
    ADDRESSES.MATIC_USD_PRICE_FEED,
    consts.MATIC_DECIMALS,
    consts.MATIC_PRICE_FEED_DECIMALS,
  ]);

  // current price of MATIC/DAI
  const amountOutMin = BigInt(1.79 * 10 ** 18);

  await yNFTVault
    .createYNFTForEther(amountOutMin, {
      value: ethers.utils.parseEther("1"),
    })
    .then(waitForReceipt);
  console.log("created");

  await yNFTVault.withdraw(NFT_TOKEN_ID).then(waitForReceipt);

  console.log("withdrawn");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
