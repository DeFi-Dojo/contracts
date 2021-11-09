import { ethers } from "hardhat";
import { YNFTVault } from "../typechain";
import { deployContract, waitForReceipt } from "../utils/deployment";

const ROUTER_DEX_KOVAN_SUSHISWAP = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";

const ADAI_KOVAN_ADDRESS = "0xdcf0af9e59c002fa3aa091a46196b37530fd48a8";

const NFT_TOKEN_ID = 0;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const yNFTVault = await deployContract<YNFTVault>("YNFTVault", [
    ROUTER_DEX_KOVAN_SUSHISWAP,
    ADAI_KOVAN_ADDRESS,
  ]);

  const amountOutMin = BigInt(12 * 10 ** 18);

  await yNFTVault
    .createYNFTForEther(amountOutMin, {
      value: ethers.utils.parseEther("0.001"),
    })
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
