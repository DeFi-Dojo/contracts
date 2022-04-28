import { Signer } from "ethers";
import { formatEther, Interface } from "ethers/lib/utils";

import { AaveYNFTVault__factory } from "../../../typechain";
import { getTokenPriceUsd } from "../../../utils/prices/coingecko";

import { AggregatorV3Interface__factory } from "./factories";
import {
  ADDRESSES,
  ALL_PERCANTAGE,
  DEADLINE_SECONDS,
  PRICE_FEED_DECIMALS,
  SLIPPAGE_PERCANTAGE,
  VAULTS,
} from "./config";

type Prices = { wmatic: number };

type VaultConfig = typeof VAULTS[0];

type SuccessResult = {
  vault: VaultConfig;
  txHash: string;
};

type FailureResult = {
  vault: VaultConfig;
  error: string;
};

type Result = SuccessResult | FailureResult;

export const aaveHarvester = async (signer: Signer) => {
  const prices = await getRewardTokenPrices();

  return Promise.all(VAULTS.map(harvestAaveRewards(signer, prices)));
};

const getRewardTokenPrices = async (): Promise<Prices> => {
  const wmaticPriceUsd = await getTokenPriceUsd(ADDRESSES.WMATIC);
  console.log("Prices", { wmaticPriceUsd });

  return { wmatic: wmaticPriceUsd };
};

const harvestAaveRewards =
  (signer: Signer, prices: Prices) =>
  async (vaultConfig: VaultConfig): Promise<Result> => {
    const { vaultName, vaultAddress, minNetRewardUsd } = vaultConfig;
    const vault = AaveYNFTVault__factory.connect(vaultAddress, signer);
    console.log(vaultName, { vaultName, vaultAddress });

    try {
      const grossRewardUsd = await vault.getAmountToClaim();
      const gasFeeUsd = await getGasFeeUsd(signer, vaultConfig, prices);
      const netRewardUsd = +grossRewardUsd - gasFeeUsd;

      if (grossRewardUsd.eq(0)) {
        throw new Error("Nothing to claim");
      }

      if (netRewardUsd < minNetRewardUsd) {
        throw new Error("Not enough to claim");
      }

      const oracle = AggregatorV3Interface__factory.connect(
        ADDRESSES.NATIVE_TOKEN_USD,
        signer
      );

      const [, price] = await oracle.latestRoundData();

      const deadline = Math.round(Date.now() / 1000) + DEADLINE_SECONDS;

      const amountOutMin = price
        .mul(grossRewardUsd)
        .div(10 ** PRICE_FEED_DECIMALS)
        .mul(ALL_PERCANTAGE - SLIPPAGE_PERCANTAGE)
        .div(ALL_PERCANTAGE);

      const tx = await vault.claimRewards(amountOutMin, deadline);

      return { vault: vaultConfig, txHash: tx.hash };
    } catch (error) {
      console.log(error);
      return { vault: vaultConfig, error: `${error}` };
    }
  };

const getGasFeeUsd = async (
  signer: Signer,
  { vaultAddress }: VaultConfig,
  pricesUsd: Prices
) => {
  const [gasPrice, gas] = await Promise.all([
    signer.getGasPrice(),
    estimateClaimRewardsTxGas(signer, vaultAddress).catch(),
  ]);

  const gasFeeMatic = Number(formatEther(gas.mul(gasPrice)));
  return gasFeeMatic * pricesUsd.wmatic;
};

const estimateClaimRewardsTxGas = (signer: Signer, vaultAddress: string) => {
  const data = new Interface(AaveYNFTVault__factory.abi).encodeFunctionData(
    "claimRewards",
    []
  );
  return signer.estimateGas({ to: vaultAddress, data });
};
