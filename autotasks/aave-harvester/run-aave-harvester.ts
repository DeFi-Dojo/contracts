import { ethers } from "hardhat";
import { aaveHarvester } from "./aave-harvester";

const runAaveHarvester = async () => {
  const [signer] = await ethers.getSigners();
  return aaveHarvester(signer);
};

runAaveHarvester()
  .then(console.log)
  .then(() => process.exit())
  .catch((e) => console.log(e));
