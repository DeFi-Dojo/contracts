import { NETWORK_ADDRESSES, SECONDS_IN_ONE_DAY } from "../../../consts";
import { getDeployedVaultsQuickswap } from "../../../consts/deployed";

export const MATIC_CHAIN_ID = 137;
export const DEADLINE_SECONDS = SECONDS_IN_ONE_DAY;
export const ADDRESSES = NETWORK_ADDRESSES.MATIC;
export const GAS_LIMIT = 1000000;
export const VAULTS = Object.entries(getDeployedVaultsQuickswap()).map(
  ([vaultName, vault]) => ({
    vaultName,
    vaultAddress: vault.vault,
    ynftAddress: vault.ynft,
  })
);
