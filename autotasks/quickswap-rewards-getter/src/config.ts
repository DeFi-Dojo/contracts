import { NETWORK_ADDRESSES } from "../../../consts";
import { getDeployedVaultsQuickswap } from "../../../consts/deployed";

export const MATIC_CHAIN_ID = 137;
export const ADDRESSES = NETWORK_ADDRESSES.MATIC;
export const MIN_NET_REWARD_USD = 0.01;
export const VAULTS = Object.entries(getDeployedVaultsQuickswap()).map(
  ([vaultName, vault]) => ({
    vaultName,
    vaultAddress: vault.vault,
    ynftAddress: vault.ynft,
  })
);
