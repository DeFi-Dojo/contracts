import {
  DefenderRelaySigner,
  DefenderRelayProvider,
} from "defender-relay-client/lib/ethers";
import { AutotaskEvent } from "defender-autotask-utils";

import { QuickswapYNFTVault__factory } from "../../../../typechain";

import {
  MATIC_CHAIN_ID,
  VAULT_ADDRESS,
  DEADLINE_SECONDS,
  ADDRESSES,
  GAS_LIMIT,
} from "./config";

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

  const amountOutMinFirstToken = 0;
  const amountOutMinSecondToken = 0;
  const amountMinLiqudityFirstToken = 0;
  const amountMinLiquditySecondToken = 0;

  const deadline = Math.round(Date.now() / 1000) + DEADLINE_SECONDS;

  const { hash: txWmatic } = await vault.depositTokens(
    ADDRESSES.WMATIC,
    amountOutMinFirstToken,
    amountOutMinSecondToken,
    amountMinLiqudityFirstToken,
    amountMinLiquditySecondToken,
    deadline,
    { gasLimit: GAS_LIMIT }
  );

  const { hash: txDquick } = await vault.depositTokens(
    ADDRESSES.DQUICK,
    amountOutMinFirstToken,
    amountOutMinSecondToken,
    amountMinLiqudityFirstToken,
    amountMinLiquditySecondToken,
    deadline,
    { gasLimit: GAS_LIMIT }
  );

  return { tx: [txWmatic, txDquick] };
}
