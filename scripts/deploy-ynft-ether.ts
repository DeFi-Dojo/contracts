import { ethers } from "hardhat";
import { AaveLPNFT, YNFTFactory } from "../typechain";
import { deployContract, waitForReceipt } from "../utils/deployment";

import configEnv from "../config";
import { PROXY_REGISTRY_ADDRESS_RINKEBY } from "../consts";

const { NFT_BASE_URI } = configEnv;

const NFT_TOKEN_ID = 0;

// const A_WETH_ADDRESS_KOVAN = "0x87b1f4cf9BD63f7BBD3eE1aD04E8F52540349347";
const A_WETH_ADDRESS = "0xF45444171435d0aCB08a8af493837eF18e86EE27";

const ROUTER_DEX_KOVAN_SUSHISWAP = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";

const ROUTER_DEX = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";

const FACTORY_ADDRESS = "0x79B97109961C8247055ef8A9B2F7549966F66C57";

const DAI_KOVAN_ADDRESS = "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const yNFTFactory = await deployContract<YNFTFactory>("YNFTFactory", [
    ROUTER_DEX_KOVAN_SUSHISWAP,
  ]);

  const amountOutMin = BigInt(23 * 10 ** 18);

  await yNFTFactory
    .createYNFTForEther(owner.address, amountOutMin, {
      value: ethers.utils.parseEther("0.01"),
    })
    .then(waitForReceipt);

  // const YNFTFactoryContract = await ethers.getContractFactory("YNFTFactory");

  // const yNFTFactory = await YNFTFactoryContract.attach(FACTORY_ADDRESS);

  console.log("CREATED");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
