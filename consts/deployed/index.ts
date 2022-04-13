import { AaveVaultName, QuickswapVaultName } from "../consts";
import deployedVaultsQuickswap from "./vaults-quickswap.json";
import deployedVaultsAave from "./vaults-aave.json";

type DeployedVaultQuickswap = { vault: string; ynft: string };

type DeployedVaultsQuickswap = {
  [k in QuickswapVaultName]: DeployedVaultQuickswap;
};

export const getDeployedVaultsQuickswap = (): DeployedVaultsQuickswap =>
  deployedVaultsQuickswap;

export const getDeployedVaultQuickswap = (
  vault: QuickswapVaultName
): DeployedVaultQuickswap => deployedVaultsQuickswap[vault];

type DeployedVaultAave = { vault: string; ynft: string };

type DeployedVaultsAave = {
  [k in AaveVaultName]: DeployedVaultAave;
};

export const getDeployedVaultsAave = (): DeployedVaultsAave =>
  deployedVaultsAave;

export const getDeployedVaultAave = (
  vault: QuickswapVaultName
): DeployedVaultQuickswap => deployedVaultsQuickswap[vault];
