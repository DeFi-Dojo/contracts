import { ethers } from "hardhat";
import Moralis from "moralis/node";

import { DummyAaveYNFTVault__factory } from "../../typechain";
import configEnv from "../../config";
import { AaveVaultName, AaveVaultsToDeploy } from "../../consts";
import { uploadYnftMetadata } from "../../utils/ynft-metadata/upload-metadata";
import { sequence } from "../../utils/promises";

const {
  ADDRESSES,
  HARVESTER_ADDRESS,
  BENEFICIARY_ADDRESS,
  MORALIS_IPFS_URL,
  MORALIS_APP_ID,
  MORALIS_SERVER_URL,
  MORALIS_MASTER_KEY,
} = configEnv;

const aaveTokenAddresses: { [k in AaveVaultName]: string } = {
  [AaveVaultName.dai]: ADDRESSES.A_DAI,
  [AaveVaultName.usdc]: ADDRESSES.A_USDC,
  [AaveVaultName.usdt]: ADDRESSES.A_USDT,
};

const deployYnftVault = async (
  aaveTokenAddress: string,
  ynftPathUri: string
) => {
  const contractName = "DummyAaveYNFTVault";
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const contractFactory =
    await ethers.getContractFactory<DummyAaveYNFTVault__factory>(contractName);

  if (!aaveTokenAddress) {
    throw new Error("Please specify env variable AAVE_TOKEN_ADDRESS");
  }

  const contract = await contractFactory.deploy(
    ADDRESSES.ROUTER_02_QUICKSWAP,
    aaveTokenAddress, // A_DAI, A_USDT, A_USDC
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

const main = async () => {
  await sequence(
    [...AaveVaultsToDeploy].map(async (vaultName) => {
      console.log(`${vaultName}: Upload metadata start`);
      const ynftPathUri = await uploadYnftMetadata(vaultName);
      console.log(`${vaultName}: Upload metadata success`);

      console.log(`${vaultName}: Deploy vault start`);
      await deployYnftVault(aaveTokenAddresses[vaultName], ynftPathUri);
      console.log(`${vaultName}: Deploy vault success`);
    })
  );
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
