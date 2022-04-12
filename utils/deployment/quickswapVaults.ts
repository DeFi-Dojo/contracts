import {
  DummyQuickswapYNFTVault,
  DummyQuickswapYNFTVault__factory,
  QuickswapYNFTVault,
  QuickswapYNFTVault__factory,
} from "../../typechain";
import configEnv from "../../config";
import {
  getQuickswapStakingDualRewardsAddress,
  getQuickswapTokenPairAddress,
  QuickswapVaultName,
  QuickswapVaultsToDeploy,
} from "../../consts";
import { resultToPromiseFn, sequence, wait } from "../promises";
import { uploadYnftMetadata } from "../ynft-metadata";
import { createDeployContract } from "./deployment";

const { ADDRESSES, HARVESTER_ADDRESS, BENEFICIARY_ADDRESS, MORALIS_IPFS_URL } =
  configEnv;

type Config = {
  isDummyVault?: boolean;
};

const deployQuickswapYnftVault =
  (config?: Config) =>
  async (
    quickswapTokenPairAddress: string,
    stakingDualRewards: string,
    ynftPathUri: string
  ) => {
    const deploy = config?.isDummyVault
      ? createDeployContract<DummyQuickswapYNFTVault__factory>(
          "DummyQuickswapYNFTVault"
        )
      : createDeployContract<QuickswapYNFTVault__factory>("QuickswapYNFTVault");

    const contract = await deploy(
      ADDRESSES.ROUTER_02_QUICKSWAP,
      quickswapTokenPairAddress,
      stakingDualRewards,
      ADDRESSES.DQUICK,
      ADDRESSES.WMATIC,
      HARVESTER_ADDRESS,
      BENEFICIARY_ADDRESS,
      "Dojo yNFT",
      MORALIS_IPFS_URL,
      ynftPathUri
    ).then((v) => v as DummyQuickswapYNFTVault | QuickswapYNFTVault);

    const ynftAddress = await contract.yNFT();
    console.log(`Deployed vault yNFT address: ${ynftAddress}\n`);
    await wait(100);
  };

const deployQuickswapVaultWithMetadata =
  (config?: Config) => async (vaultName: QuickswapVaultName) => {
    const ynftPathUri = await uploadYnftMetadata(vaultName);
    await deployQuickswapYnftVault(config)(
      getQuickswapTokenPairAddress(ADDRESSES, vaultName),
      getQuickswapStakingDualRewardsAddress(ADDRESSES, vaultName),
      ynftPathUri
    );
  };

export const deployQuickswapVaultsWithMetadata = (config?: Config) =>
  sequence(
    QuickswapVaultsToDeploy.map(
      resultToPromiseFn(deployQuickswapVaultWithMetadata(config))
    )
  );
