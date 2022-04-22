import { getDeployedVaultsAave } from "../../../consts/deployed";

export enum ChainIds {
  KOVAN = 42,
  MATIC = 137,
}

interface Addresses {
  NATIVE_TOKEN_USD: string;
}

type NetworksAddresses = { [k: number]: Addresses };

export const ADDRESSES: NetworksAddresses = {
  [ChainIds.KOVAN]: {
    NATIVE_TOKEN_USD: "0x9326BFA02ADD2366b30bacB125260Af641031331",
  },
  [ChainIds.MATIC]: {
    NATIVE_TOKEN_USD: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
  },
};

export const PRICE_FEED_DECIMALS = 8;
export const SLIPPAGE_PERCANTAGE = 3;
export const ALL_PERCANTAGE = 100;
export const DEADLINE_SECONDS = 60;
export const MIN_CLAIM_AMOUNT = 500000000000000000; // 0.5 MATIC
export const VAULTS = Object.entries(getDeployedVaultsAave()).map(
  ([vaultName, vault]) => ({
    vaultName,
    vaultAddress: vault.vault,
    ynftAddress: vault.ynft,
  })
);
