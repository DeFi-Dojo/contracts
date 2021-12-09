/* eslint-disable import/prefer-default-export */
import {
  DefenderRelaySigner,
  DefenderRelayProvider,
} from "defender-relay-client/lib/ethers";
import { AutotaskEvent } from "defender-autotask-utils";
// import {} from "@chainlink/contracts";
import { TestERC20__factory } from "./typechain";

const VAULT_ADDRESS = "0x57c27D6E71d53D02D70219Dbf73dF0ff7116ab56";

export async function handler(event: AutotaskEvent) {
  if (event.credentials === undefined || event.relayerARN === undefined) {
    throw new Error("Relayer not provided");
  }

  const provider = new DefenderRelayProvider({
    credentials: event.credentials,
    relayerARN: event.relayerARN,
  });
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
  const contract = TestERC20__factory.connect(VAULT_ADDRESS, signer);

  const res = await contract.mint();

  res.wait();

  const name = await contract.name();

  console.log(`Called execute in ${name}`);
  return { name };
}
