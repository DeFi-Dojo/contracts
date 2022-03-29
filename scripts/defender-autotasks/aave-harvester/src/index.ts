import {
  DefenderRelaySigner,
  DefenderRelayProvider,
} from "defender-relay-client/lib/ethers";
import { AutotaskEvent } from "defender-autotask-utils";
import { AaveYNFTVault__factory } from "../../../../typechain";

import { AggregatorV3Interface__factory } from "./factories";
import {
  ADDRESSES,
  ALL_PERCANTAGE,
  DEADLINE_SECONDS,
  MIN_CLAIM_AMOUNT,
  PRICE_FEED_DECIMALS,
  SLIPPAGE_PERCANTAGE,
  VAULT_ADDRESS,
} from "./config";

export async function handler(event: AutotaskEvent) {
  if (event.credentials === undefined || event.relayerARN === undefined) {
    throw new Error("Relayer not provided");
  }

  const provider = new DefenderRelayProvider({
    credentials: event.credentials,
    relayerARN: event.relayerARN,
  });

  const network = await provider.detectNetwork();

  const addresses = ADDRESSES[network.chainId];

  if (addresses === undefined) {
    throw new Error(
      `Network ${network.name}, with chainId: ${network.chainId} not supported`
    );
  }

  // Initialize defender relayer provider and signer
  const signer = new DefenderRelaySigner(
    {
      credentials: event.credentials,
      relayerARN: event.relayerARN,
    },
    provider,
    { speed: "fast" }
  );

  const vault = AaveYNFTVault__factory.connect(VAULT_ADDRESS, signer);

  const amountToClaim = await vault.getAmountToClaim();

  if (amountToClaim.eq(0)) {
    throw new Error("Nothing to claim");
  }

  if (amountToClaim.lt(MIN_CLAIM_AMOUNT)) {
    throw new Error("Not enough to claim");
  }

  const oracle = AggregatorV3Interface__factory.connect(
    addresses.NATIVE_TOKEN_USD,
    signer
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [roundID, price] = await oracle.latestRoundData();

  const deadline = Math.round(Date.now() / 1000) + DEADLINE_SECONDS;

  const amountOutMin = price
    .mul(amountToClaim)
    .div(10 ** PRICE_FEED_DECIMALS)
    .mul(ALL_PERCANTAGE - SLIPPAGE_PERCANTAGE)
    .div(ALL_PERCANTAGE);

  const tx = await vault.claimRewards(amountOutMin, deadline);

  return { tx: tx.hash };
}
