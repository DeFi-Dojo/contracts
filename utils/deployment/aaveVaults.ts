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

const { ADDRESSES, HARVESTER_ADDRESS, BENEFICIARY_ADDRESS, MORALIS_IPFS_URL } =
  configEnv;

type Config = { isDummyVault?: boolean };

const deployAaveYnftVault =
  (config?: Config) =>
  async (aaveTokenAddress: string, ynftPathUri: string) => {
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
    await wait(100);
  };

const deployAaveVaultWithMetadata =
  (config?: Config) => async (vaultName: AaveVaultName) => {
    const ynftPathUri = await uploadYnftMetadata(vaultName);
    await deployAaveYnftVault(config)(
      getAaveTokenAddress(ADDRESSES, vaultName),
      ynftPathUri
    );
  };

export const deployAaveVaultsWithMetadata = (config?: Config) =>
  sequence(
    AaveVaultsToDeploy.map(
      resultToPromiseFn(deployAaveVaultWithMetadata(config))
    )
  );
