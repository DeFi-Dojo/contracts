import { AutotaskClient } from "defender-autotask-client";
import configEnv from "../config";

const {
  DEFENDER_TEAM_API_KEY,
  DEFENDER_TEAM_API_SECRET,
  DEFENDER_QUICKSWAP_GET_REWARD_AUTOTASK_ID,
} = configEnv;

const PATH_TO_COMPILED_SRC_CODE =
  "./dist/scripts/defender/aave-harvester-autotask/src";

async function main() {
  const client = new AutotaskClient({
    apiKey: DEFENDER_TEAM_API_KEY,
    apiSecret: DEFENDER_TEAM_API_SECRET,
  });

  await client.updateCodeFromFolder(
    DEFENDER_QUICKSWAP_GET_REWARD_AUTOTASK_ID,
    PATH_TO_COMPILED_SRC_CODE
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
