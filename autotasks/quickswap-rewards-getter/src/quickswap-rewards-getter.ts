import { Signer } from "ethers";
import { formatEther, Interface } from "ethers/lib/utils";
import { getTokenPricesUSD } from "../../../utils/prices/coingecko";
import { QuickswapYNFTVault__factory } from "../../../typechain";
import { ADDRESSES, MIN_NET_REWARD_USD, VAULTS } from "./config";

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

const calculateNetRewardUSD = async (signer: Signer, vaultAddress: string) => {
  const vault = QuickswapYNFTVault__factory.connect(vaultAddress, signer);

  const [rewardAmountDquick, rewardAmountWmatic] =
    await vault.getRewardsToClaim();

  const [dquickPriceUSD, wmaticPriceUSD] = await getTokenPricesUSD([
    ADDRESSES.DQUICK,
    ADDRESSES.WMATIC,
  ]);

  const rewardAmountDquickUSD =
    Number(formatEther(rewardAmountDquick)) * dquickPriceUSD!;
  const rewardAmountWmaticUSD =
    Number(formatEther(rewardAmountWmatic)) * wmaticPriceUSD!;

  const rewardsAmountUSD = rewardAmountDquickUSD + rewardAmountWmaticUSD;

  const [gas, gasPrice] = await Promise.all([
    estimateClaimRewardsTxGas(signer, vaultAddress),
    signer.getGasPrice(),
  ]);
  const gasPriceUSD = Number(formatEther(gas.mul(gasPrice)));
  const gasFeeUSD = gasPriceUSD * wmaticPriceUSD!;

  return rewardsAmountUSD - gasFeeUSD;
};

const getQuickswapRewards =
  (signer: Signer) =>
  async ({ vaultName, vaultAddress }: typeof VAULTS[0]) => {
    const vault = QuickswapYNFTVault__factory.connect(vaultAddress, signer);
    const minAcceptableNetRewardUSD = MIN_NET_REWARD_USD;

    const netRewardUSD = await calculateNetRewardUSD(signer, vaultAddress);

    if (netRewardUSD >= minAcceptableNetRewardUSD) {
      const error = "Transaction not profitable";
      return { vaultName, vaultAddress, error: `${error}` };
    }

    try {
      const tx = await (vault as any).claimRewards();
      return { vaultName, vaultAddress, txHash: tx.hash };
    } catch (error) {
      return { vaultName, vaultAddress, error: `${error}` };
    }
  };

export const quickswapRewardsGetter = async (signer: Signer) =>
  Promise.all(VAULTS.map(getQuickswapRewards(signer)));
