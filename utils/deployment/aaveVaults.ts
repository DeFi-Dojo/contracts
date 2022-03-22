import { AaveYNFTVault__factory } from "../../typechain";
import configEnv from "../../config";
import {
  AaveVaultName,
  AaveVaultsToDeploy,
  getAaveTokenAddress,
} from "../../consts";
import { resultToPromiseFn, sequence, wait } from "../promises";
import { uploadYnftMetadata } from "../ynft-metadata";
import { createDeployContract } from "./deployment";

const { ADDRESSES, HARVESTER_ADDRESS, BENEFICIARY_ADDRESS, MORALIS_IPFS_URL } =
  configEnv;

export const deployAaveYnftVault = async (
  aaveTokenAddress: string,
  ynftPathUri: string
) => {
  const deploy = createDeployContract<AaveYNFTVault__factory>("AaveYNFTVault");

  const contract = await deploy(
    ADDRESSES.ROUTER_02_SUSHISWAP,
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
  await wait(100);
};

export const deployAaveVaultWithMetadata = async (vaultName: AaveVaultName) => {
  const ynftPathUri = await uploadYnftMetadata(vaultName);
  await deployAaveYnftVault(
    getAaveTokenAddress(ADDRESSES, vaultName),
    ynftPathUri
  );
};

export const deployAaveVaultsWithMetadata = () =>
  sequence(
    AaveVaultsToDeploy.map(resultToPromiseFn(deployAaveVaultWithMetadata))
  );
