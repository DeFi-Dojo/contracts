import { Signer } from "ethers";
import { formatEther, Interface } from "ethers/lib/utils";
import { getTokenPricesUsd } from "../../../utils/prices/coingecko";
import { QuickswapYNFTVault__factory } from "../../../typechain";
import { ADDRESSES, MIN_NET_REWARD_USD, VAULTS } from "./config";

type Prices = { wmatic: number; dquick: number };

const QuickswapYNFTVaultInterface = new Interface(
  QuickswapYNFTVault__factory.abi
);

const estimateClaimRewardsTxGas = (signer: Signer, vaultAddress: string) => {
  const data = QuickswapYNFTVaultInterface.encodeFunctionData(
    "claimRewards",
    []
  );
  return signer.estimateGas({ to: vaultAddress, data });
};

const calculateNetRewardUsd = async (
  signer: Signer,
  vaultAddress: string,
  pricesUsd: Prices
) => {
  const vault = QuickswapYNFTVault__factory.connect(vaultAddress, signer);

  const [rewardAmountDquick, rewardAmountWmatic] =
    await vault.getRewardsToClaim();
  console.log({ rewardAmountDquick, rewardAmountWmatic });

  const rewardAmountDquickUsd =
    Number(formatEther(rewardAmountDquick)) * pricesUsd.dquick;
  const rewardAmountWmaticUsd =
    Number(formatEther(rewardAmountWmatic)) * pricesUsd.wmatic;

  const rewardsAmountUsd = rewardAmountDquickUsd + rewardAmountWmaticUsd;

  const [gasPrice, gas] = await Promise.all([
    signer.getGasPrice(),
    estimateClaimRewardsTxGas(signer, vaultAddress),
  ]);
  console.log({ gas, gasPrice });

  const gasFeeMatic = Number(formatEther(gas.mul(gasPrice)));
  const gasFeeUsd = gasFeeMatic * pricesUsd.wmatic;

  console.log({ gasFeeUsd });

  return rewardsAmountUsd - gasFeeUsd;
};

const harvestQuickswapRewards =
  (signer: Signer, prices: Prices) =>
  async ({ vaultName, vaultAddress }: typeof VAULTS[0]) => {
    const vault = QuickswapYNFTVault__factory.connect(vaultAddress, signer);
    console.log({ vaultName, vaultAddress });

    try {
      const netRewardUsd = await calculateNetRewardUsd(
        signer,
        vaultAddress,
        prices
      );
      console.log({ netRewardUsd });

      if (netRewardUsd < MIN_NET_REWARD_USD) {
        const error = "Transaction not profitable";
        return {
          vaultName,
          vaultAddress,
          error: `${error}`,
          netRewardUsd,
          minNetRewardUsd: MIN_NET_REWARD_USD,
        };
      }

      const tx = await vault.claimRewards();
      return { vaultName, vaultAddress, txHash: tx.hash };
    } catch (error) {
      return { vaultName, vaultAddress, error: `${error}` };
    }
  };

const getRewardTokenPrices = async (): Promise<Prices> => {
  const [dquickPriceUsd, wmaticPriceUsd] = await getTokenPricesUsd([
    ADDRESSES.DQUICK,
    ADDRESSES.WMATIC,
  ]);
  console.log({ dquickPriceUsd, wmaticPriceUsd });

  return {
    dquick: dquickPriceUsd,
    wmatic: wmaticPriceUsd,
  };
};

export const quickswapHarvester = async (signer: Signer) => {
  const pricesUsd = await getRewardTokenPrices();
  return Promise.all(VAULTS.map(harvestQuickswapRewards(signer, pricesUsd)));
};
