/* eslint-disable import/prefer-default-export */
import {
  DefenderRelaySigner,
  DefenderRelayProvider,
} from "defender-relay-client/lib/ethers";
import { AutotaskEvent } from "defender-autotask-utils";
import {
  AaveYNFTVault__factory,
  AggregatorV3Interface__factory,
} from "./factories";

enum ChainIds {
  KOVAN = 42,
  MATIC = 137,
}

interface Addresses {
  NATIVE_TOKEN_USD: string;
}

type NetworksAddresses = { [k: number]: Addresses };

const ADDRESSES: NetworksAddresses = {
  [ChainIds.KOVAN]: {
    NATIVE_TOKEN_USD: "0x9326BFA02ADD2366b30bacB125260Af641031331",
  },
  [ChainIds.MATIC]: {
    NATIVE_TOKEN_USD: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
  },
};

// TODO: how to handle vault address for diffrent vaults
const VAULT_ADDRESS = "0x0bf97F8f2dF1cEEC3EF21827E00F11011aE2d118";

const PRICE_FEED_DECIMALS = 8;

const SLIPPAGE_PERCANTAGE = 3;

const ALL_PERCANTAGE = 100;

const DEADLINE_SECONDS = 60;

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
