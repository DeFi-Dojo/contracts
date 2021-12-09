/* eslint-disable import/prefer-default-export */
import {
  DefenderRelaySigner,
  DefenderRelayProvider,
} from "defender-relay-client/lib/ethers";
// import { ethers } from "ethers";
import { AutotaskEvent } from "defender-autotask-utils";

// const ADDRESS = "0.0.0.0";

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

  console.log("bla", signer);

  // Create contract instance from the signer and use it to send a tx
  //   const contract = new ethers.Contract(ADDRESS, ABI, signer);
  //   if (await contract.canExecute()) {
  //     const tx = await contract.execute();
  //     console.log(`Called execute in ${tx.hash}`);
  //     // return { tx: tx.hash };
  //   }
}
