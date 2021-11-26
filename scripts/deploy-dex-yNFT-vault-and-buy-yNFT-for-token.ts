import { ethers } from "hardhat";
import { DexYNFTVault, IERC20 } from "../typechain";
import { deployContract, waitForReceipt } from "../utils/deployment";
import configEnv from "../config";
import * as consts from "../consts";

const { ADDRESSES } = configEnv;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const yNFTVault = await deployContract<DexYNFTVault>("DexYNFTVault", [
    ADDRESSES.ROUTER_02_SUSHISWAP,
    ADDRESSES.PAIR_WETH_USDT_SUSHISWAP,
  ]);

  const tokenAmountIn = BigInt(1 * 10 ** consts.DECIMALS.USDT);

  const usdt = await ethers.getContractAt<IERC20>("IERC20", ADDRESSES.USDT);

  await usdt.approve(yNFTVault.address, tokenAmountIn).then(waitForReceipt);

  console.log("approved");

  // frontend should calculate and pass it to the function, using "0" for convenience
  const amountOutMinFirstToken = 0;
  const amountOutMinSecondToken = 0;
  const amountMinLiqudityFirstToken = 0;
  const amountMinLiquditySecondToken = 0;

  const deadline = Math.round(Date.now() / 1000) + consts.SECONDS_IN_ONE_DAY;

  await yNFTVault
    .createYNFT(
      ADDRESSES.USDT,
      tokenAmountIn,
      amountOutMinFirstToken,
      amountOutMinSecondToken,
      amountMinLiqudityFirstToken,
      amountMinLiquditySecondToken,
      deadline
    )
    .then(waitForReceipt);

  console.log("created");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
