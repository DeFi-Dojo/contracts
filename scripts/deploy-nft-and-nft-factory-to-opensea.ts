import { ethers } from "hardhat";

import { DojoNFT, OpenSeaFactory } from "../typechain";
import { deployContract, waitForReceipt } from "../utils/deployment";
import { PROXY_REGISTRY_ADDRESS_RINKEBY, MAX_SUPPLY_OF_NFT } from "../consts";

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
    [PROXY_REGISTRY_ADDRESS_RINKEBY, dojoNFT.address, MAX_SUPPLY_OF_NFT]
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
