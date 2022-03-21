import { DummyAaveYNFTVault__factory } from "../../typechain";
import configEnv from "../../config";
import {
  AaveVaultName,
  AaveVaultsToDeploy,
  getAaveTokenAddress,
} from "../../consts";
import { sequence } from "../promises";
import { uploadYnftMetadata } from "../ynft-metadata";
import { createDeployContract } from "./deployment";

const { ADDRESSES, HARVESTER_ADDRESS, BENEFICIARY_ADDRESS, MORALIS_IPFS_URL } =
  configEnv;

export const deployAaveDummyYnftVault = async (
  aaveTokenAddress: string,
  ynftPathUri: string
) => {
  const deploy =
    createDeployContract<DummyAaveYNFTVault__factory>("DummyAaveYNFTVault");

  const contract = await deploy(
    ADDRESSES.ROUTER_02_QUICKSWAP,
    aaveTokenAddress, // A_DAI, A_USDT, A_USDC
    ADDRESSES.INCENTIVES_CONTROLLER,
    HARVESTER_ADDRESS,
    BENEFICIARY_ADDRESS,
    "Dojo yNFT",
    MORALIS_IPFS_URL,
    ynftPathUri
  );

  const ynftAddress = await contract.yNFT();
  console.log(`Deployed vault yNFT address: `, ynftAddress);
};

export const deployAaveDummyVaultWithMetadata = async (
  vaultName: AaveVaultName
) => {
  const ynftPathUri = await uploadYnftMetadata(vaultName);
  await deployAaveDummyYnftVault(
    getAaveTokenAddress(ADDRESSES, vaultName),
    ynftPathUri
  );
};

export const deployAaveDummyVaultsWithMetadata = () =>
  sequence(AaveVaultsToDeploy.map(deployAaveDummyVaultWithMetadata));
