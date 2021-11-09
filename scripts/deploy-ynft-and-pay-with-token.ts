import { ethers } from "hardhat";
import { YNFTVault } from "../typechain";
import { deployContract, waitForReceipt } from "../utils/deployment";

const NFT_TOKEN_ID = 0;

const ROUTER_DEX_KOVAN_SUSHISWAP = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";

const ADAI_KOVAN_ADDRESS = "0xdcf0af9e59c002fa3aa091a46196b37530fd48a8";

const AAVE_KOVAN_USDT_ADDRESS = "0x13512979ADE267AB5100878E2e0f485B568328a4";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const yNFTVault = await deployContract<YNFTVault>("YNFTVault", [
    ROUTER_DEX_KOVAN_SUSHISWAP,
    ADAI_KOVAN_ADDRESS,
  ]);

  const amountIn = BigInt(1 * 10 ** 6);

  const amountOutMin = BigInt(11 * 10 * 18);

  const USDT = await ethers.getContractFactory("TokenERC20");

  const usdt = await USDT.attach(AAVE_KOVAN_USDT_ADDRESS);

  await usdt.approve(yNFTVault.address, amountIn).then(waitForReceipt);

  console.log("approved");

  await yNFTVault
    .createYNFT(AAVE_KOVAN_USDT_ADDRESS, amountIn, amountOutMin)
    .then(waitForReceipt);

  console.log("created");

  await yNFTVault.withdraw(NFT_TOKEN_ID).then(waitForReceipt);

  console.log("withdrawn");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
