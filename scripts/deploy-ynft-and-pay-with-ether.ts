import { ethers } from "hardhat";
import { YNFTVault } from "../typechain";
import { deployContract, waitForReceipt } from "../utils/deployment";
import configEnv from "../config";
import * as consts from "../consts";

const { ADDRESSES } = configEnv;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const yNFTVault = await deployContract<YNFTVault>("YNFTVault", [
    ADDRESSES.ROUTER_02_SUSHISWAP,
    ADDRESSES.A_DAI,
    ADDRESSES.INCENTIVES_CONTROLLER,
    ADDRESSES.NATIVE_TOKEN_USD_PRICE_FEED,
    consts.DECIMALS.MATIC,
    consts.NATIVE_TOKEN_PRICE_FEED_DECIMALS,
    consts.DECIMALS.DAI,
    ADDRESSES.NATIVE_TOKEN_USD_PRICE_FEED,
    consts.NATIVE_TOKEN_PRICE_FEED_DECIMALS,
  ]);

  // current price of MATIC/DAI
  const amountOutMin = BigInt(1.7 * 10 ** consts.DECIMALS.DAI);

  await yNFTVault
    .createYNFTForEther(amountOutMin, {
      value: ethers.utils.parseEther("1"),
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
