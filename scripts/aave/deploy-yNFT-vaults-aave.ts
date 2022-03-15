import { ethers } from "hardhat";

import { AaveYNFTVault__factory } from "../../typechain";
import configEnv from "../../config";
import { AaveVaultsToDeploy } from "../../consts";
import { uploadYnftMetadata } from "../../utils/ynft-metadata/upload-metadata";
import { sequence } from "../../utils/promises";

const { ADDRESSES, HARVESTER_ADDRESS, BENEFICIARY_ADDRESS, MORALIS_IPFS_URL } =
  configEnv;

const deployAaveYnftVault = async (ynftPathUri: string) => {
  const contractName = "AaveYNFTVault";
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const contractFactory =
    await ethers.getContractFactory<AaveYNFTVault__factory>(contractName);

  const contract = await contractFactory.deploy(
    ADDRESSES.ROUTER_02_SUSHISWAP,
    ADDRESSES.A_DAI,
    ADDRESSES.INCENTIVES_CONTROLLER,
    HARVESTER_ADDRESS,
    BENEFICIARY_ADDRESS,
    "Dojo yNFT",
    MORALIS_IPFS_URL,
    ynftPathUri
  );

  await contract.deployed();

  console.log(`${contractName} deployed to: `, contract.address);
  const ynftAddress = await contract.yNFT();
  console.log(`${contractName} ynft address: `, ynftAddress);
};

async function main() {
  await sequence(
    [...AaveVaultsToDeploy].map(async (vaultName) => {
      console.log(`${vaultName}: Upload metadata start`);
      const ynftPathUri = await uploadYnftMetadata(vaultName);
      console.log(`${vaultName}: Upload metadata success`);

      console.log(`${vaultName}: Deploy vault start`);
      await deployAaveYnftVault(ynftPathUri);
      console.log(`${vaultName}: Deploy vault success`);
    })
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
