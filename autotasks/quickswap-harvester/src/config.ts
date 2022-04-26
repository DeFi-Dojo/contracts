import { NETWORK_ADDRESSES, QuickswapVaultName } from "../../../consts";
import { getDeployedVaultsQuickswap } from "../../../consts/deployed";

export const GAS_LIMIT = 1000000;
export const MATIC_CHAIN_ID = 137;
export const ADDRESSES = NETWORK_ADDRESSES.MATIC;
export const MIN_NET_REWARD_USD = 0.01;

const minNetRewardUsdPerVault: { [k in QuickswapVaultName]: number } = {
  [QuickswapVaultName.maticEth]: 0.01,
  [QuickswapVaultName.maticQuick]: 0.01,
  [QuickswapVaultName.maticUsdc]: 0.01,
  [QuickswapVaultName.maticUsdt]: 0.01,
};

export const VAULTS = Object.entries(getDeployedVaultsQuickswap()).map(
  ([vaultName, vault]) => ({
    vaultName,
    vaultAddress: vault.vault,
    ynftAddress: vault.ynft,
    minNetRewardUsd: minNetRewardUsdPerVault[vaultName as QuickswapVaultName],
  })
);
