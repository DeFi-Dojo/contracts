import { Signer } from "ethers";
import { AaveYNFTVault__factory } from "../../../typechain";

import { AggregatorV3Interface__factory } from "./factories";
import {
  ADDRESSES,
  ALL_PERCANTAGE,
  DEADLINE_SECONDS,
  MIN_CLAIM_AMOUNT,
  PRICE_FEED_DECIMALS,
  SLIPPAGE_PERCANTAGE,
  VAULTS,
} from "./config";

const aaveHarvest =
  (signer: Signer) =>
  async ({ vaultName, vaultAddress }: typeof VAULTS[0]) => {
    const vault = AaveYNFTVault__factory.connect(vaultAddress, signer);
    try {
      const amountToClaim = await vault.getAmountToClaim();

      if (amountToClaim.eq(0)) {
        throw new Error("Nothing to claim");
      }

      if (amountToClaim.lt(MIN_CLAIM_AMOUNT)) {
        throw new Error("Not enough to claim");
      }

      const oracle = AggregatorV3Interface__factory.connect(
        ADDRESSES.NATIVE_TOKEN_USD,
        signer
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [, price] = await oracle.latestRoundData();

      const deadline = Math.round(Date.now() / 1000) + DEADLINE_SECONDS;

      const amountOutMin = price
        .mul(amountToClaim)
        .div(10 ** PRICE_FEED_DECIMALS)
        .mul(ALL_PERCANTAGE - SLIPPAGE_PERCANTAGE)
        .div(ALL_PERCANTAGE);

      const tx = await vault.claimRewards(amountOutMin, deadline);

      return { vaultName, vaultAddress, txHash: tx.hash };
    } catch (error) {
      console.log(error);
      return { vaultName, vaultAddress, error: `${error}` };
    }
  };

export const aaveHarvester = async (signer: Signer) =>
  Promise.all(VAULTS.map(aaveHarvest(signer)));
