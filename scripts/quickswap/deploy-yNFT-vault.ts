import { ethers } from "hardhat";
import { QuickswapYNFTVault } from "../../typechain";
import { deployContract } from "../../utils/deployment";
import configEnv from "../../config";

const { ADDRESSES } = configEnv;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  await deployContract<QuickswapYNFTVault>("QuickswapYNFTVault", [
    ADDRESSES.ROUTER_02_QUICKSWAP,
    ADDRESSES.PAIR_WMATIC_USDT_QUICKSWAP,
    ADDRESSES.STAKING_DUAL_REWARDS_QUICKSWAP,
    owner.address,
  ]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
