/* eslint-disable import/prefer-default-export */
import {
  DefenderRelaySigner,
  DefenderRelayProvider,
} from "defender-relay-client/lib/ethers";
import { AutotaskEvent } from "defender-autotask-utils";
import {
  //   TestERC20__factory,
  FeedRegistryInterface__factory,
} from "./factories";

// const VAULT_ADDRESS = "0x57c27D6E71d53D02D70219Dbf73dF0ff7116ab56";

enum ChainIds {
  KOVAN = 42,
  MATIC = 137,
}

interface Addresses {
  FEED_REGISTRY: string;
  NATIVE_TOKEN: string;
  USD: string;
}

type NetworksAddresses = { [k: number]: Addresses };

const ADDRESSES: NetworksAddresses = {
  [ChainIds.KOVAN]: {
    FEED_REGISTRY: "0xAa7F6f7f507457a1EE157fE97F6c7DB2BEec5cD0",
    NATIVE_TOKEN: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    USD: "0x0000000000000000000000000000000000000348",
  },
  [ChainIds.MATIC]: {
    FEED_REGISTRY: "0xAa7F6f7f507457a1EE157fE97F6c7DB2BEec5cD0",
    NATIVE_TOKEN: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    USD: "0x0000000000000000000000000000000000000348",
  },
};

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

  // Create contract instance from the signer and use it to send a tx
  //   const contract = TestERC20__factory.connect(VAULT_ADDRESS, signer);

  const oracle = FeedRegistryInterface__factory.connect(
    addresses.FEED_REGISTRY,
    signer
  );

  const res = await oracle.latestRound(addresses.LINK, addresses.USD);

  return { res };
}
