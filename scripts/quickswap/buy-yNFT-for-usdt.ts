import { ethers } from "hardhat";
import {
  QuickswapYNFTVault,
  IERC20,
  IUniswapV2Router02,
} from "../../typechain";
import { waitForReceipt } from "../../utils/deployment";
import configEnv from "../../config";
import * as consts from "../../consts";

const { VAULT_ADDRESS, ADDRESSES } = configEnv;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const yNFTVault = await ethers.getContractAt<QuickswapYNFTVault>(
    "QuickswapYNFTVault",
    VAULT_ADDRESS
  );

  const tokenAmountIn = BigInt(0.01 * 10 ** 18);

  const matic = await ethers.getContractAt<IERC20>("IERC20", ADDRESSES.WMATIC);

  await matic.approve(yNFTVault.address, tokenAmountIn).then(waitForReceipt);

  console.log("approved");

  // frontend should calculate and pass it to the function, using "0" for convenience
  const amountOutMinFirstToken = 0;
  const amountOutMinSecondToken = 0;
  const amountMinLiqudityFirstToken = 0;
  const amountMinLiquditySecondToken = 0;

  const deadline = Math.round(Date.now() / 1000) + consts.SECONDS_IN_ONE_DAY;

  await yNFTVault
    .createYNFT(
      ADDRESSES.WMATIC,
      tokenAmountIn,
      amountOutMinFirstToken,
      amountOutMinSecondToken,
      amountMinLiqudityFirstToken,
      amountMinLiquditySecondToken,
      deadline
    )
    .then(waitForReceipt);

  console.log("created");

  const maticAmount = await yNFTVault.amountFirstToken();

  const usdtAmount = await yNFTVault.amountSecondToken();

  console.log("matic", maticAmount.toString());
  console.log("usdt", usdtAmount.toString());

  await matic
    .approve(ADDRESSES.ROUTER_02_QUICKSWAP, maticAmount)
    .then(waitForReceipt);

  const usdt = await ethers.getContractAt<IERC20>("IERC20", ADDRESSES.USDT);

  await usdt
    .approve(ADDRESSES.ROUTER_02_QUICKSWAP, usdtAmount)
    .then(waitForReceipt);

  console.log("approved");

  const router = await ethers.getContractAt<IUniswapV2Router02>(
    "IUniswapV2Router02",
    ADDRESSES.ROUTER_02_QUICKSWAP
  );

  await router
    .addLiquidity(
      ADDRESSES.WMATIC,
      ADDRESSES.USDT,
      maticAmount,
      usdtAmount,
      amountMinLiqudityFirstToken,
      amountMinLiquditySecondToken,
      owner.address,
      deadline
    )
    .then(waitForReceipt);

  console.log("added");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
