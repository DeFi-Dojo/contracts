import { QuickswapVaultName } from "../consts";
import deployedVaultsQuickswap from "./vaults-quickswap.json";

type DeployedVaultsQuickswap = {
  [k in QuickswapVaultName]: { vault: string; ynft: string };
};

export const getDeployedVaultsQuickswap = (): DeployedVaultsQuickswap =>
  deployedVaultsQuickswap;
