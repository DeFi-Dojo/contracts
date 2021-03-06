import { Signer } from "ethers";
import { formatEther, Interface } from "ethers/lib/utils";
import { getTokenPricesUsd } from "../../../utils/prices/coingecko";
import { QuickswapYNFTVault__factory } from "../../../typechain";
import { ADDRESSES, GAS_LIMIT, VAULTS } from "./config";

export const quickswapHarvester = async (
  signer: Signer
): Promise<Array<SuccessResult | FailureResult>> => {
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

const roundToCents = (value: number) =>
  Number(parseFloat(`${value}`).toFixed(2));

const harvestQuickswapRewards =
  (signer: Signer, prices: Prices) =>
  async (vaultConfig: VaultConfig): Promise<Result> => {
    const { vaultName, vaultAddress, minNetRewardUsd } = vaultConfig;
    const vault = QuickswapYNFTVault__factory.connect(vaultAddress, signer);
    console.log(vaultName, { vaultName, vaultAddress, minNetRewardUsd });

    try {
      const grossRewardUsd = await getGrossRewardUsd(
        signer,
        vaultConfig,
        prices
      );
      console.log(vaultName, { grossRewardUsd });
      if (roundToCents(grossRewardUsd) === 0) {
        throw new Error("Nothing to claim");
      }

      const gasFeeUsd = await getGasFeeUsd(signer, vaultConfig, prices);

      const netRewardUsd = grossRewardUsd - gasFeeUsd;
      console.log(vaultName, { gasFeeUsd, netRewardUsd });
      if (netRewardUsd < minNetRewardUsd) {
        throw new Error("Not enough to claim");
      }

      const tx = await vault.claimRewards({ gasLimit: GAS_LIMIT });

      return { vault: vaultConfig, txHash: tx.hash };
    } catch (error) {
      return { vault: vaultConfig, error: `${error}` };
    }
  };

const getGrossRewardUsd = async (
  signer: Signer,
  vaultConfig: VaultConfig,
  pricesUsd: Prices
) => {
  const vault = QuickswapYNFTVault__factory.connect(
    vaultConfig.vaultAddress,
    signer
  );

  const [rewardAmountDquick, rewardAmountWmatic] =
    await vault.getRewardsToClaim();

  const rewardAmountDquickUsd =
    Number(formatEther(rewardAmountDquick)) * pricesUsd.dquick;
  const rewardAmountWmaticUsd =
    Number(formatEther(rewardAmountWmatic)) * pricesUsd.wmatic;

  return rewardAmountDquickUsd + rewardAmountWmaticUsd;
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
  const data = new Interface(
    QuickswapYNFTVault__factory.abi
  ).encodeFunctionData("claimRewards", []);
  return signer.estimateGas({ to: vaultAddress, data });
};

type Result = SuccessResult | FailureResult;
type SuccessResult = {
  vault: VaultConfig;
  txHash: string;
};
type FailureResult = {
  vault: VaultConfig;
  error: string;
};
type VaultConfig = typeof VAULTS[0];
type Prices = { wmatic: number; dquick: number };
