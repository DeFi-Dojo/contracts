import { ethers } from "hardhat";
import { DexYNFTVault } from "../typechain";
import { deployContract, waitForReceipt } from "../utils/deployment";
import configEnv from "../config";

const { ADDRESSES } = configEnv;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const yNFTVault = await deployContract<DexYNFTVault>("DexYNFTVault", [
    ADDRESSES.ROUTER_02_SUSHISWAP,
    ADDRESSES.PAIR_WETH_USDT_SUSHISWAP,
  ]);

  // frontend should calculate and pass it to the function, using "0" for convenience
  const amountOutMinFirstToken = 0;
  const amountOutMinSecondToken = 0;
  const amountMinLiqudityFirstToken = 0;
  const amountMinLiquditySecondToken = 0;
  const secondsInOneDay = 1440000;

  const deadline = Math.round(Date.now() / 1000) + secondsInOneDay;

  const tokenAmountIn = 0;

  await yNFTVault
    .createYNFT(
      ADDRESSES.DAI,
      tokenAmountIn,
      amountOutMinFirstToken,
      amountOutMinSecondToken,
      amountMinLiqudityFirstToken,
      amountMinLiquditySecondToken,
      deadline
    )
    .then(waitForReceipt);

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
  console.log("created");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
