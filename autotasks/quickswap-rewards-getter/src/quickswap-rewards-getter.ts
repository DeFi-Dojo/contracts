import { Signer } from "ethers";

import { QuickswapYNFTVault__factory } from "../../../typechain";
import { VAULTS } from "./config";

const getQuickswapRewards =
  (signer: Signer) =>
  async ({ vaultName, vaultAddress }: typeof VAULTS[0]) => {
    const vault = QuickswapYNFTVault__factory.connect(vaultAddress, signer);
    try {
      const tx = await vault.getRewardLPMining();
      return { vaultName, vaultAddress, txHash: tx.hash };
    } catch (error) {
      return { vaultName, vaultAddress, error: `${error}` };
    }
  };

export const quickswapRewardsGetter = async (signer: Signer) =>
  Promise.all(VAULTS.map(getQuickswapRewards(signer)));
