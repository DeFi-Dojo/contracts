import { ethers } from "hardhat";
import { QuickswapYNFTVault } from "../../typechain";
import { deployContract } from "../../utils/deployment";
import configEnv from "../../config";

const { ADDRESSES, CLAIMER_ADDRESS } = configEnv;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const poolPid = 0;
  await deployContract<QuickswapYNFTVault>("QuickswapYNFTVault", [
    ADDRESSES.ROUTER_02_SUSHISWAP,
    ADDRESSES.PAIR_WETH_USDT_SUSHISWAP,
    ADDRESSES.MASTER_CHEF_V2_SUSHISWAP,
    poolPid,
    CLAIMER_ADDRESS,
  ]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
