import { ethers } from "hardhat";
import path from "path";
import { readFile, writeFile } from "fs/promises";

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

const {
  ADDRESSES,
  HARVESTER_ADDRESS,
  BENEFICIARY_ADDRESS,
  MORALIS_IPFS_URL,
  DEFAULT_ADMIN_ROLE_ADDRESS,
} = configEnv;

type Config = {
  isDummyVault?: boolean;
};

const deployQuickswapYnftVault =
  (config?: Config) =>
  async (
    vaultName: QuickswapVaultName,
    stakingDualRewards: string,
    ynftPathUri: string
  ) => {
    const tokenPairAddress = getQuickswapTokenPairAddress(ADDRESSES, vaultName);
    const deploy = config?.isDummyVault
      ? createDeployContract<DummyQuickswapYNFTVault__factory>(
          "DummyQuickswapYNFTVault"
        )
      : createDeployContract<QuickswapYNFTVault__factory>("QuickswapYNFTVault");

    const contract = await deploy(
      ADDRESSES.ROUTER_02_QUICKSWAP,
      tokenPairAddress,
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
    console.log(`Deployed vault yNFT address: ${ynftAddress}`);

    const projectDir = path.join(__dirname, "../../");
    const savePath = path.join(
      projectDir,
      "consts/deployed/vaults-quickswap.json"
    );
    const file = JSON.parse(await readFile(savePath, { encoding: "utf-8" }));
    file[vaultName] = {
      vault: contract.address,
      ynft: ynftAddress,
      ynftMetaDataUrl: MORALIS_IPFS_URL + ynftPathUri,
    };
    await writeFile(savePath, JSON.stringify(file, null, 2));

    await wait(100);
    await contract.grantRole(
      await contract.DEFAULT_ADMIN_ROLE(),
      DEFAULT_ADMIN_ROLE_ADDRESS
    );
    const [defaultAdmin] = await ethers.getSigners();
    await contract.renounceRole(
      await contract.DEFAULT_ADMIN_ROLE(),
      defaultAdmin.address
    );
    console.log(
      `DEFAULT_ADMIN_ROLE granted to: ${DEFAULT_ADMIN_ROLE_ADDRESS}\n`
    );
  };

const deployQuickswapVaultWithMetadata =
  (config?: Config) => async (vaultName: QuickswapVaultName) => {
    const ynftPathUri = await uploadYnftMetadata(vaultName);
    await deployQuickswapYnftVault(config)(
      vaultName,
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
