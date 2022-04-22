import { getDeployedVaultsQuickswap } from "../../../consts/deployed";

export const MATIC_CHAIN_ID = 137;
export const VAULTS = Object.entries(getDeployedVaultsQuickswap()).map(
  ([vaultName, vault]) => ({
    vaultName,
    vaultAddress: vault.vault,
    ynftAddress: vault.ynft,
  })
);
