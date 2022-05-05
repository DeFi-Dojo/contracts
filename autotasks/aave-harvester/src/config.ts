import { AaveVaultName, NETWORK_ADDRESSES } from "../../../consts";
import { getDeployedVaultsAave } from "../../../consts/deployed";

export enum ChainIds {
  KOVAN = 42,
  MATIC = 137,
}

export const ADDRESSES = {
  ...NETWORK_ADDRESSES.MATIC,
  NATIVE_TOKEN_USD: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
};

const minNetRewardUsdPerVault: { [k in AaveVaultName]: number } = {
  [AaveVaultName.dai]: 0.1,
  [AaveVaultName.usdc]: 0.1,
  [AaveVaultName.usdt]: 0.1,
};

export const PRICE_FEED_DECIMALS = 8;
export const SLIPPAGE_PERCANTAGE = 3;
export const ALL_PERCANTAGE = 100;
export const DEADLINE_SECONDS = 60;
export const VAULTS = Object.entries(getDeployedVaultsAave()).map(
  ([vaultName, vault]) => ({
    vaultName,
    vaultAddress: vault.vault,
    ynftAddress: vault.ynft,
    minNetRewardUsd: minNetRewardUsdPerVault[vaultName as AaveVaultName],
  })
);
