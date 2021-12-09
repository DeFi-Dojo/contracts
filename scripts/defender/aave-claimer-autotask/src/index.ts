/* eslint-disable import/prefer-default-export */
import {
  DefenderRelaySigner,
  DefenderRelayProvider,
} from "defender-relay-client/lib/ethers";
import { AutotaskEvent } from "defender-autotask-utils";
import {
  TestERC20__factory,
  FeedRegistryInterface__factory,
} from "./typechain";

const VAULT_ADDRESS = "0x57c27D6E71d53D02D70219Dbf73dF0ff7116ab56";
// const ORACLE_ETH_USD = "0x9326BFA02ADD2366b30bacB125260Af641031331";
const ORACLE = "0xAa7F6f7f507457a1EE157fE97F6c7DB2BEec5cD0";

const LINK = "0xa36085F69e2889c224210F603D836748e7dC0088";
const USD = "0x0000000000000000000000000000000000000348";

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

  console.log(contract);

  const oracle = FeedRegistryInterface__factory.connect(ORACLE, signer);

  const res = await oracle.latestRound(LINK, USD);

  //   console.log(`Called execute in ${name}`);
  return { res };
}
