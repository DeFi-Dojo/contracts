import { ethers } from "hardhat";
import { AaveYNFTVault } from "../typechain";
import { deployContract } from "../utils/deployment";
import configEnv from "../config";

const { ADDRESSES } = configEnv;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  await deployContract<AaveYNFTVault>("AaveYNFTVault", [
    ADDRESSES.ROUTER_02_SUSHISWAP,
    ADDRESSES.A_DAI,
    ADDRESSES.INCENTIVES_CONTROLLER,
  ]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
