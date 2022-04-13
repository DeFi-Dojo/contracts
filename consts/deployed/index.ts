import { QuickswapVaultName } from "../consts";
import deployedVaultsQuickswap from "./vaults-quickswap.json";

type DeployedVaultQuickswap = { vault: string; ynft: string };

type DeployedVaultsQuickswap = {
  [k in QuickswapVaultName]: DeployedVaultQuickswap;
};

export const getDeployedVaultsQuickswap = (): DeployedVaultsQuickswap =>
  deployedVaultsQuickswap;

export const getDeployedVaultQuickswap = (
  vault: QuickswapVaultName
): DeployedVaultQuickswap => deployedVaultsQuickswap[vault];
