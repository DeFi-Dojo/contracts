import { ethers } from "hardhat";
import { waitForReceipt } from "../utils/deployment";
import configEnv from "../config";
import * as consts from "../consts";

const { ADDRESSES, VAULT_ADDRESS } = configEnv;

const AMOUNT_IN_OF_USDT = 0.1;

const AMOUNT_OUT_OF_DAI = 0.08;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const YNFTVaultContract = await ethers.getContractFactory("YNFTVault");

  const yNFTVault = await YNFTVaultContract.attach(VAULT_ADDRESS);

  const amountIn = BigInt(AMOUNT_IN_OF_USDT * 10 ** consts.DECIMALS.USDT);

  const amountOutMin = BigInt(AMOUNT_OUT_OF_DAI * 10 ** consts.DECIMALS.DAI);

  const usdt = await ethers.getContractAt("IERC20", ADDRESSES.USDT);

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
