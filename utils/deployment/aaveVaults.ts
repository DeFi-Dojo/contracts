import { ethers } from "hardhat";
import { readFile, writeFile } from "fs/promises";
import path from "path";

import {
  AaveYNFTVault,
  AaveYNFTVault__factory,
  DummyAaveYNFTVault,
  DummyAaveYNFTVault__factory,
} from "../../typechain";
import configEnv from "../../config";
import {
  AaveVaultName,
  AaveVaultsToDeploy,
  getAaveTokenAddress,
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

type Config = { isDummyVault?: boolean };

const deployAaveYnftVault =
  (config?: Config) =>
  async (vaultName: AaveVaultName, ynftPathUri: string) => {
    const aaveTokenAddress = getAaveTokenAddress(ADDRESSES, vaultName);
    const deploy = config?.isDummyVault
      ? createDeployContract<DummyAaveYNFTVault__factory>("DummyAaveYNFTVault")
      : createDeployContract<AaveYNFTVault__factory>("AaveYNFTVault");

    const contract = await deploy(
      ADDRESSES.ROUTER_02_SUSHISWAP,
      aaveTokenAddress, // A_DAI, A_USDT, A_USDC
      ADDRESSES.INCENTIVES_CONTROLLER,
      HARVESTER_ADDRESS,
      BENEFICIARY_ADDRESS,
      "Dojo yNFT",
      MORALIS_IPFS_URL,
      ynftPathUri
    ).then((v) => v as DummyAaveYNFTVault | AaveYNFTVault);

    const ynftAddress = await contract.yNFT().catch(() => "");
    console.log(`Deployed vault yNFT address: ${ynftAddress}\n`);

    const projectDir = path.join(__dirname, "../../");
    const savePath = path.join(projectDir, "consts/deployed/vaults-aave.json");
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

const deployAaveVaultWithMetadata =
  (config?: Config) => async (vaultName: AaveVaultName) => {
    const ynftPathUri = await uploadYnftMetadata(vaultName);
    await deployAaveYnftVault(config)(vaultName, ynftPathUri);
  };

export const deployAaveVaultsWithMetadata = (config?: Config) =>
  sequence(
    AaveVaultsToDeploy.map(
      resultToPromiseFn(deployAaveVaultWithMetadata(config))
    )
  );
