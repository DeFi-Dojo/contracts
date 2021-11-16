import { ethers } from "hardhat";
import { YNFTVault } from "../typechain";
import { deployContract, waitForReceipt } from "../utils/deployment";
import configEnv from "../config";
import * as consts from "../consts";

const { ADDRESSES } = configEnv;

const AMOUNT_IN_OF_USDT = 1;

const AMOUNT_OUT_OF_DAI = 0.9;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const yNFTVault = await deployContract<YNFTVault>("YNFTVault", [
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

  const amountIn = BigInt(AMOUNT_IN_OF_USDT * 10 ** consts.DECIMALS.USDT);

  const amountOutMin = BigInt(AMOUNT_OUT_OF_DAI * 10 ** consts.DECIMALS.DAI);

  const USDT = await ethers.getContractFactory("TokenERC20");

  const usdt = await USDT.attach(ADDRESSES.USDT);

  await usdt.approve(yNFTVault.address, amountIn).then(waitForReceipt);

  console.log("approved");

  await yNFTVault
    .createYNFT(ADDRESSES.USDT, amountIn, amountOutMin)
    .then(waitForReceipt);

  console.log("created");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
