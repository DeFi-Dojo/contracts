import { AutotaskClient } from "defender-autotask-client";
import configEnv from "../../../config";

const {
  DEFENDER_TEAM_API_KEY,
  DEFENDER_TEAM_API_SECRET,
  DEFENDER_AUTOTASK_ID,
} = configEnv;

async function main() {
  const client = new AutotaskClient({
    apiKey: DEFENDER_TEAM_API_KEY,
    apiSecret: DEFENDER_TEAM_API_SECRET,
  });

  await client.updateCodeFromFolder(
    DEFENDER_AUTOTASK_ID,
    "./dist/scripts/defender/aave-claimer-autotask/src"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
