import { DummyQuickswapYNFTVault__factory } from "../../typechain";
import configEnv from "../../config";
import {
  getQuickswapTokenPairAddress,
  QuickswapVaultName,
  QuickswapVaultsToDeploy,
} from "../../consts";
import { resultToPromiseFn, sequence, wait } from "../promises";
import { uploadYnftMetadata } from "../ynft-metadata";
import { createDeployContract } from "./deployment";

const { ADDRESSES, HARVESTER_ADDRESS, BENEFICIARY_ADDRESS, MORALIS_IPFS_URL } =
  configEnv;

export const deployQuickswapDummyYnftVault = async (
  quickswapTokenPairAddress: string,
  ynftPathUri: string
) => {
  const deploy = createDeployContract<DummyQuickswapYNFTVault__factory>(
    "DummyQuickswapYNFTVault"
  );

  const contract = await deploy(
    ADDRESSES.ROUTER_02_QUICKSWAP,
    quickswapTokenPairAddress,
    ADDRESSES.STAKING_DUAL_REWARDS_QUICKSWAP,
    ADDRESSES.DQUICK,
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

export const deployQuickswapDummyVaultWithMetadata = async (
  vaultName: QuickswapVaultName
) => {
  const ynftPathUri = await uploadYnftMetadata(vaultName);
  await deployQuickswapDummyYnftVault(
    getQuickswapTokenPairAddress(ADDRESSES, vaultName),
    ynftPathUri
  );
};

export const deployQuickswapDummyVaultsWithMetadata = () =>
  sequence(
    QuickswapVaultsToDeploy.map(
      resultToPromiseFn(deployQuickswapDummyVaultWithMetadata)
    )
  );
