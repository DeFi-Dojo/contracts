import { ethers } from "hardhat";
import { AaveLPNFT, YNFTFactory } from "../typechain";
import { deployContract, waitForReceipt } from "../utils/deployment";

import configEnv from "../config";
import { PROXY_REGISTRY_ADDRESS_RINKEBY } from "../consts";

const { NFT_BASE_URI } = configEnv;

const NFT_TOKEN_ID = 0;

// const A_WETH_ADDRESS_KOVAN = "0x87b1f4cf9BD63f7BBD3eE1aD04E8F52540349347";
const A_WETH_ADDRESS = "0xF45444171435d0aCB08a8af493837eF18e86EE27";
const ROUTER_DEX = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const yNFTFactory = await deployContract<YNFTFactory>("YNFTFactory", [
    ROUTER_DEX,
  ]);

  await yNFTFactory.createYNFT(owner.address).then(waitForReceipt);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
