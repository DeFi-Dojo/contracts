import { Signer } from "ethers";
import { formatEther, Interface } from "ethers/lib/utils";
import { getTokenPricesUsd } from "../../../utils/prices/coingecko";
import { QuickswapYNFTVault__factory } from "../../../typechain";
import { ADDRESSES, GAS_LIMIT, MIN_NET_REWARD_USD, VAULTS } from "./config";

type Prices = { wmatic: number; dquick: number };

const QuickswapYNFTVaultInterface = new Interface(
  QuickswapYNFTVault__factory.abi
);

export const quickswapHarvester = async (signer: Signer) => {
  const pricesUsd = await getRewardTokenPrices();
  return Promise.all(VAULTS.map(harvestQuickswapRewards(signer, pricesUsd)));
};

const getRewardTokenPrices = async (): Promise<Prices> => {
  const [dquickPriceUsd, wmaticPriceUsd] = await getTokenPricesUsd([
    ADDRESSES.DQUICK,
    ADDRESSES.WMATIC,
  ]);
  console.log("Prices", { dquickPriceUsd, wmaticPriceUsd });

  return {
    dquick: dquickPriceUsd,
    wmatic: wmaticPriceUsd,
  };
};

const harvestQuickswapRewards =
  (signer: Signer, prices: Prices) =>
  async ({ vaultName, vaultAddress }: typeof VAULTS[0]) => {
    const vault = QuickswapYNFTVault__factory.connect(vaultAddress, signer);
    console.log(vaultName, { vaultName, vaultAddress });

    try {
      const minNetRewardUsd = MIN_NET_REWARD_USD;
      const netRewardUsd = await calculateNetRewardUsd(
        signer,
        vaultAddress,
        prices
      );
      console.log(vaultName, { netRewardUsd, minNetRewardUsd });

      if (netRewardUsd < MIN_NET_REWARD_USD) {
        const error = "Transaction not profitable";
        return {
          vaultName,
          vaultAddress,
          error: `${error}`,
          netRewardUsd,
          minNetRewardUsd,
        };
      }

      const tx = await vault.claimRewards({ gasLimit: GAS_LIMIT });
      return {
        vaultName,
        vaultAddress,
        txHash: tx.hash,
        netRewardUsd,
        minNetRewardUsd,
      };
    } catch (error) {
      return { vaultName, vaultAddress, error: `${error}` };
    }
  };

const calculateNetRewardUsd = async (
  signer: Signer,
  vaultAddress: string,
  pricesUsd: Prices
) => {
  const vault = QuickswapYNFTVault__factory.connect(vaultAddress, signer);

  const [rewardAmountDquick, rewardAmountWmatic] =
    await vault.getRewardsToClaim();

  const rewardAmountDquickUsd =
    Number(formatEther(rewardAmountDquick)) * pricesUsd.dquick;
  const rewardAmountWmaticUsd =
    Number(formatEther(rewardAmountWmatic)) * pricesUsd.wmatic;

  const rewardsAmountUsd = rewardAmountDquickUsd + rewardAmountWmaticUsd;

  try {
    const [gasPrice, gas] = await Promise.all([
      signer.getGasPrice(),
      estimateClaimRewardsTxGas(signer, vaultAddress).catch(),
    ]);

    const gasFeeMatic = Number(formatEther(gas.mul(gasPrice)));
    const gasFeeUsd = gasFeeMatic * pricesUsd.wmatic;

    console.log({ gasFeeUsd, rewardsAmountUsd });
    return rewardsAmountUsd - gasFeeUsd;
  } catch (e) {
    console.log({ vaultAddress }, e);

    throw new Error("Could not get gasPrice and gas estimation");
  }
};

const estimateClaimRewardsTxGas = (signer: Signer, vaultAddress: string) => {
  const data = QuickswapYNFTVaultInterface.encodeFunctionData(
    "claimRewards",
    []
  );
  return signer.estimateGas({ to: vaultAddress, data });
};
