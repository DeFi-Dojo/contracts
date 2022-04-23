import {
  DefenderRelaySigner,
  DefenderRelayProvider,
} from "defender-relay-client/lib/ethers";
import { AutotaskEvent } from "defender-autotask-utils";
import { Signer } from "ethers";

export const makeHandler =
  <T>(callback: (signer: Signer) => Promise<T> | T) =>
  async (event: AutotaskEvent): Promise<T> => {
    if (event.credentials === undefined || event.relayerARN === undefined) {
      throw new Error("Relayer not provided");
    }

    const provider = new DefenderRelayProvider({
      credentials: event.credentials,
      relayerARN: event.relayerARN,
    });

    const signer = new DefenderRelaySigner(
      {
        credentials: event.credentials,
        relayerARN: event.relayerARN,
      },
      provider,
      { speed: "fast" }
    );

    return callback(signer);
  };
