import { Signer } from "ethers";
import {
  QuickswapYNFTVault,
  QuickswapYNFTVault__factory,
} from "../../../typechain";

import { DEADLINE_SECONDS, ADDRESSES, GAS_LIMIT, VAULTS } from "./config";

const depositTokens = (vault: QuickswapYNFTVault, tokenAddress: string) => {
  const [
    amountOutMinFirstToken,
    amountOutMinSecondToken,
    amountMinLiqudityFirstToken,
    amountMinLiquditySecondToken,
  ] = [0, 0, 0, 0];

  return vault.depositTokens(
    tokenAddress,
    amountOutMinFirstToken,
    amountOutMinSecondToken,
    amountMinLiqudityFirstToken,
    amountMinLiquditySecondToken,
    Math.round(Date.now() / 1000) + DEADLINE_SECONDS,
    { gasLimit: GAS_LIMIT }
  );
};

const depositQuickswapTokenPair =
  (signer: Signer) =>
  async ({ vaultName, vaultAddress }: typeof VAULTS[0]) => {
    const vault = QuickswapYNFTVault__factory.connect(vaultAddress, signer);

    try {
      const { hash: txWmatic } = await depositTokens(vault, ADDRESSES.WMATIC);
      const { hash: txDquick } = await depositTokens(vault, ADDRESSES.DQUICK);

      return { vaultName, vaultAddress, txWmatic, txDquick };
    } catch (error) {
      return { vaultName, vaultAddress, error: `${error}` };
    }
  };

export const quickswapTokenDepositor = async (signer: Signer) =>
  Promise.all(VAULTS.map(depositQuickswapTokenPair(signer)));
