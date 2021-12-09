import { ethers } from "hardhat";

import { TestERC20 } from "../typechain";
import { deployContract } from "../utils/deployment";

async function main() {
  const [owner] = await ethers.getSigners();

  console.log(`Deploying contracts using address: ${owner.address}`);

  await deployContract<TestERC20>("TestERC20", []);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
