import { ethers } from "hardhat";
import {
  DexYNFTVault,
  UniswapV2Factory,
  UniswapV2Router02,
  UniswapV2Pair,
} from "../typechain";
import { deployContract, waitForReceipt } from "../utils/deployment";
import configEnv from "../config";

const { ADDRESSES } = configEnv;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  // const router = await ethers.getContractAt<UniswapV2Router02>(
  //   "UniswapV2Router02",
  //   ADDRESSES.ROUTER_02_SUSHISWAP
  // );

  // console.log(await router.factory());
  // console.log(await router.WETH());

  // const factory = await ethers.getContractAt<UniswapV2Factory>(
  //   "UniswapV2Factory",
  //   "0xc35DADB65012eC5796536bD9864eD8773aBc74C4"
  // );

  // const WETH = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";

  // console.log(
  //   await factory.getPair(
  //     WETH,
  //     ADDRESSES.USDT
  //     // "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
  //   )
  // );

  const pair = await ethers.getContractAt<UniswapV2Pair>(
    "UniswapV2Pair",
    "0x55FF76BFFC3Cdd9D5FdbBC2ece4528ECcE45047e"
  );

  console.log(await pair.token0());
  console.log(await pair.token1());

  // const yNFTVault = await deployContract<DexYNFTVault>("DexYNFTVault", [
  //   ADDRESSES.ROUTER_02_SUSHISWAP,
  //   ADDRESSES.USDT,
  //   ADDRESSES.USDC,
  // ]);

  // // frontend should calculate and pass it to the function, using "0" for convenience
  // const amountOutMinFirstToken = 0;
  // const amountOutMinSecondToken = 0;
  // const amountMinLiqudityFirstToken = 0;
  // const amountMinLiquditySecondToken = 0;
  // const secondsInOneDay = 1440000;

  // const deadline = Math.round(Date.now() / 1000) + secondsInOneDay;

  // await yNFTVault
  //   .createYNFTForEther(
  //     amountOutMinFirstToken,
  //     amountOutMinSecondToken,
  //     amountMinLiqudityFirstToken,
  //     amountMinLiquditySecondToken,
  //     deadline,
  //     {
  //       value: ethers.utils.parseEther("0.01"),
  //     }
  //   )
  //   .then(waitForReceipt);
  // console.log("created");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
