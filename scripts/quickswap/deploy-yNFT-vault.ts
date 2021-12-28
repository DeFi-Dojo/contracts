import { ethers } from "hardhat";
import { QuickswapYNFTVault__factory } from "../../typechain";
import configEnv from "../../config";

const { ADDRESSES, HARVESTER_ADDRESS } = configEnv;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const contractName = "QuickswapYNFTVault";

  const contractFactory =
    await ethers.getContractFactory<QuickswapYNFTVault__factory>(contractName);

  const contract = await contractFactory.deploy(
    ADDRESSES.ROUTER_02_QUICKSWAP,
    ADDRESSES.PAIR_WMATIC_USDT_QUICKSWAP,
    ADDRESSES.STAKING_DUAL_REWARDS_QUICKSWAP,
    ADDRESSES.DRAGON_SYRUP_QUICKSWAP,
    ADDRESSES.DQUICK,
    HARVESTER_ADDRESS
  );

  await contract.deployed();

  console.log(`${contractName} deployed to: `, contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
