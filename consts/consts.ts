export const MAX_SUPPLY_OF_NFT = 2500;
export const NATIVE_TOKEN_PRICE_FEED_DECIMALS = 8;
export const SECONDS_IN_ONE_DAY = 1440000;
export const DECIMALS = {
  MATIC: 18,
  DAI: 18,
  USDT: 6,
  USDC: 6,
};

export type VaultName = AaveVaultName | QuickswapVaultName;

export enum AaveVaultName {
  usdc = "Ao",
  usdt = "Midori",
  dai = "Kiiro",
}

export enum QuickswapVaultName {
  maticUsdc = "Aosaki",
  maticQuick = "Hayai",
  maticUsdt = "Ahegao",
  maticEth = "Murasaki",
}

export const AaveVaultsToDeploy = [
  AaveVaultName.usdc,
  AaveVaultName.usdt,
  AaveVaultName.dai,
];

export const QuickswapVaultsToDeploy = [
  QuickswapVaultName.maticUsdc,
  QuickswapVaultName.maticQuick,
  QuickswapVaultName.maticUsdt,
  QuickswapVaultName.maticEth,
];
