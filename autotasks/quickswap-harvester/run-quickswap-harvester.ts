import { ethers } from "hardhat";
import { quickswapHarvester } from "./src/quickswap-harvester";

const runQuickswapHarvester = async () => {
  const [signer] = await ethers.getSigners();
  return quickswapHarvester(signer);
};

runQuickswapHarvester()
  .then(console.log)
  .then(() => process.exit())
  .catch((e) => console.log(e));
