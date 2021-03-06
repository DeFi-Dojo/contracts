import { ethers } from "hardhat";

import { DojoNFT__factory, OpenSeaFactory__factory } from "../../typechain";
import { createDeployContract, waitForReceipt } from "../../utils/deployment";
import { MAX_SUPPLY_OF_NFT } from "../../consts";
import configEnv from "../../config";

const {
  NFT_BASE_URI,
  NFT_FACTORY_BASE_URI,
  ADDRESSES,
  NFT_FACTORY_OWNER_ADDRESS,
} = configEnv;

async function main() {
  const deployDojoNFT = createDeployContract<DojoNFT__factory>("DojoNFT");
  const deployOpenseaFactory =
    createDeployContract<OpenSeaFactory__factory>("OpenSeaFactory");

  const [owner] = await ethers.getSigners();

  console.log(`Deploying contracts using address: ${owner.address}`);

  const dojoNFT = await deployDojoNFT(
    NFT_BASE_URI,
    ADDRESSES.PROXY_REGISTRY_OPENSEA
  );

  const openSeaFactory = await deployOpenseaFactory(
    ADDRESSES.PROXY_REGISTRY_OPENSEA,
    dojoNFT.address,
    MAX_SUPPLY_OF_NFT,
    NFT_FACTORY_BASE_URI
  );

  await dojoNFT.transferOwnership(openSeaFactory.address).then(waitForReceipt);

  console.log("dojoNFT ownership transfered");

  await openSeaFactory
    .transferOwnership(NFT_FACTORY_OWNER_ADDRESS)
    .then(waitForReceipt);

  console.log("openSeaFactory ownership transfered");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
