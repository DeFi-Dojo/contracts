import { ethers } from "hardhat";
import { AaveYNFTVault__factory } from "../../typechain";
import configEnv from "../../config";

const { ADDRESSES, HARVESTER_ADDRESS, BENEFICIARY_ADDRESS } = configEnv;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const contractName = "AaveYNFTVault";

  const contractFactory =
    await ethers.getContractFactory<AaveYNFTVault__factory>(contractName);

  const contract = await contractFactory.deploy(
    ADDRESSES.ROUTER_02_SUSHISWAP,
    ADDRESSES.A_DAI,
    ADDRESSES.INCENTIVES_CONTROLLER,
    HARVESTER_ADDRESS,
    BENEFICIARY_ADDRESS,
    "Dojo yNFT",
    "", // TODO: Set base uri
    "", // TODO: Set path uri
  );

  await contract.deployed();

  console.log(`${contractName} deployed to: `, contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
