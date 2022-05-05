import { NETWORK_ADDRESSES, QuickswapVaultName } from "../../../consts";
import { getDeployedVaultsQuickswap } from "../../../consts/deployed";

export const GAS_LIMIT = 1000000;
export const MATIC_CHAIN_ID = 137;
export const ADDRESSES = NETWORK_ADDRESSES.MATIC;

const minNetRewardUsdPerVault: { [k in QuickswapVaultName]: number } = {
  [QuickswapVaultName.maticEth]: 0.1,
  [QuickswapVaultName.maticQuick]: 0.1,
  [QuickswapVaultName.maticUsdc]: 0.1,
  [QuickswapVaultName.maticUsdt]: 0.1,
};

export const VAULTS = Object.entries(getDeployedVaultsQuickswap()).map(
  ([vaultName, vault]) => ({
    vaultName,
    vaultAddress: vault.vault,
    ynftAddress: vault.ynft,
    minNetRewardUsd: minNetRewardUsdPerVault[vaultName as QuickswapVaultName],
  })
);
