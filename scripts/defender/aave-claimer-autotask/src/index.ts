/* eslint-disable import/prefer-default-export */
import {
  DefenderRelaySigner,
  DefenderRelayProvider,
} from "defender-relay-client/lib/ethers";
import { AutotaskEvent } from "defender-autotask-utils";
import {
  //   TestERC20__factory,
  AggregatorV3Interface__factory,
} from "./factories";

// const VAULT_ADDRESS = "0x57c27D6E71d53D02D70219Dbf73dF0ff7116ab56";

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

export async function handler(event: AutotaskEvent) {
  console.log(event);
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

  const oracle = AggregatorV3Interface__factory.connect(
    addresses.NATIVE_TOKEN_USD,
    signer
  );

  const res = await oracle.latestRoundData();

  return { res };
}
