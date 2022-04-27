import {
  DefenderRelaySigner,
  DefenderRelayProvider,
} from "defender-relay-client/lib/ethers";
import { AutotaskEvent } from "defender-autotask-utils";
import { Signer } from "ethers";
import { RelayerParams } from "defender-relay-client";

export const makeHandler =
  <T>(callback: (signer: Signer) => Promise<T> | T) =>
  async (event: AutotaskEvent): Promise<T> => {
    if (!event.credentials || !event.relayerARN) {
      throw new Error("Relayer not provided");
    }

    const relayerParams = event as RelayerParams;
    const provider = new DefenderRelayProvider(relayerParams);
    const signer = new DefenderRelaySigner(relayerParams, provider, {
      speed: "fast",
    });

    return callback(signer);
  };
