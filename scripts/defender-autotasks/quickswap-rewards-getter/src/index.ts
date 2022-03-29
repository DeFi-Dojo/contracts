import {
  DefenderRelaySigner,
  DefenderRelayProvider,
} from "defender-relay-client/lib/ethers";
import { AutotaskEvent } from "defender-autotask-utils";
import { QuickswapYNFTVault__factory } from "./types";
import { MATIC_CHAIN_ID, VAULT_ADDRESS } from "./config";

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

  const vault = QuickswapYNFTVault__factory.connect(VAULT_ADDRESS, signer);

  const tx = await vault.getRewardLPMining();

  return { tx: tx.hash };
}
