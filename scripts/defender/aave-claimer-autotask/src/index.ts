/* eslint-disable import/prefer-default-export */
import {
  DefenderRelaySigner,
  DefenderRelayProvider,
} from "defender-relay-client/lib/ethers";
// import { ethers } from "ethers";
import { AutotaskEvent } from "defender-autotask-utils";
import { TestERC20__factory } from "./typechain/factories/TestERC20__factory";

const VAULT_ADDRESS = "0xD1669d59CA26223e26BbDaFf118f38A9EFDfa70D";

export async function handler(event: AutotaskEvent) {
  if (event.credentials === undefined || event.relayerARN === undefined) {
    throw new Error("");
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

  //   if (await contract.canExecute()) {
  const name = await contract.name();
  console.log(`Called execute in ${name}`);
  return { name };
  //   }
}
