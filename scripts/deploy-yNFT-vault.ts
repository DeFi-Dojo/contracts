import { ethers } from "hardhat";
import { YNFTVault } from "../typechain";
import { deployContract } from "../utils/deployment";
import configEnv from "../config";
import * as consts from "../consts";

const { ADDRESSES } = configEnv;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  await deployContract<YNFTVault>("YNFTVault", [
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
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
