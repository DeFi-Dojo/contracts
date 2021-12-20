import { ethers } from "hardhat";
import { IMiniChefV2, IUniswapV2Factory } from "../../typechain";
import configEnv from "../../config";

const { ADDRESSES } = configEnv;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const chef = await ethers.getContractAt<IMiniChefV2>(
    "IMiniChefV2",
    ADDRESSES.MASTER_CHEF_V2_SUSHISWAP
  );

  // const factory = await ethers.getContractAt<IUniswapV2Factory>(
  //   "IUniswapV2Factory",
  //   "0xc35DADB65012eC5796536bD9864eD8773aBc74C4"
  // );

  // console.log(await factory.getPair());

  // const len = Number((await chef.poolLength()).toString());

  // console.log(len);
  // // console.log(await chef.lpToken(0));

  // for (let i = 0; i < len; i += 1) {
  //   // eslint-disable-next-line no-await-in-loop
  //   console.log(await chef.lpToken(i));
  // }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
