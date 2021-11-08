import { ethers } from "hardhat";
import { YNFTVault } from "../typechain";
import { deployContract, waitForReceipt } from "../utils/deployment";

// const A_WETH_ADDRESS_KOVAN = "0x87b1f4cf9BD63f7BBD3eE1aD04E8F52540349347";
// const A_WETH_ADDRESS = "0xF45444171435d0aCB08a8af493837eF18e86EE27";

const ROUTER_DEX_KOVAN_SUSHISWAP = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";

// const FACTORY_ADDRESS = "0x79B97109961C8247055ef8A9B2F7549966F66C57";

// const DAI_KOVAN_ADDRESS = "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa";

const USDT_AAVE_KOVAN = "0x13512979ADE267AB5100878E2e0f485B568328a4";

const ADAI_KOVAN_ADDRESS = "0xdcf0af9e59c002fa3aa091a46196b37530fd48a8";

// 0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe
async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const yNFTVault = await deployContract<YNFTVault>("YNFTVault", [
    ROUTER_DEX_KOVAN_SUSHISWAP,
    ADAI_KOVAN_ADDRESS,
  ]);

  // const token = await yNFTVault.token();

  // console.log(token);
  const amountOutMin = BigInt(13 * 10 ** 18);

  await yNFTVault
    .createYNFTForEther(owner.address, amountOutMin, {
      value: ethers.utils.parseEther("0.001"),
    })
    .then(waitForReceipt);

  // const YNFTVaultContract = await ethers.getContractFactory("YNFTVault");

  // const YNFTVault = await YNFTVaultContract.attach(FACTORY_ADDRESS);

  console.log("CREATED");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
