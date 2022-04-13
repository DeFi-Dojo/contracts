import {
  DefenderRelaySigner,
  DefenderRelayProvider,
} from "defender-relay-client/lib/ethers";
import { AutotaskEvent } from "defender-autotask-utils";

import { QuickswapYNFTVault__factory } from "../../../../typechain";

import { MATIC_CHAIN_ID, VAULTS } from "./config";

export async function handler({ credentials, relayerARN }: AutotaskEvent) {
  if (!credentials || !relayerARN) {
    throw new Error("Relayer not provided");
  }

  const provider = new DefenderRelayProvider({ credentials, relayerARN });
  const network = await provider.detectNetwork();

  if (network.chainId !== MATIC_CHAIN_ID) {
    throw new Error(`Unsupported network ${network.chainId} - ${network.name}`);
  }

  const signer = new DefenderRelaySigner(
    { credentials, relayerARN },
    provider,
    { speed: "fast" }
  );

  const txs = await Promise.all(
    VAULTS.map(async ({ vaultName, vaultAddress }) => {
      const vault = QuickswapYNFTVault__factory.connect(vaultAddress, signer);
      try {
        const tx = await vault.getRewardLPMining();
        return { vaultName, vaultAddress, txHash: tx.hash };
      } catch (error) {
        return { vaultName, vaultAddress, error };
      }
    })
  );

  return txs;
}
