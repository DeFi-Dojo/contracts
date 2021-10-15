import { ethers } from "hardhat";

import { DojoNFT, OpenSeaFactory } from "../typechain";
import { deployContract, waitForReceipt } from "../utils/deployment";

const PROXY_REGISTRY_ADDRESS_RINKEBY =
  "0xf57b2c51ded3a29e6891aba85459d600256cf317";
const { NFT_BASE_URI } = process.env;

async function main() {
  if (!NFT_BASE_URI) {
    throw new Error("NFT_BASE_URI not defined");
  }

  const [owner] = await ethers.getSigners();

  console.log(`Deploying contracts using address: ${owner.address}`);

  const dojoNFT = await deployContract<DojoNFT>("DojoNFT", [
    NFT_BASE_URI,
    PROXY_REGISTRY_ADDRESS_RINKEBY,
  ]);

  const openSeaFactory = await deployContract<OpenSeaFactory>(
    "OpenSeaFactory",
    [PROXY_REGISTRY_ADDRESS_RINKEBY, dojoNFT.address]
  );

  await dojoNFT.transferOwnership(openSeaFactory.address).then(waitForReceipt);

  console.log("ownership transfered");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
