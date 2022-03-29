import { AutotaskClient } from "defender-autotask-client";
import configEnv from "../../config";

const {
  DEFENDER_TEAM_API_KEY,
  DEFENDER_TEAM_API_SECRET,
  DEFENDER_QUICKSWAP_GET_REWARD_AUTOTASK_ID,
} = configEnv;

export async function uploadAutotask(bundleFolderPath: string) {
  const client = new AutotaskClient({
    apiKey: DEFENDER_TEAM_API_KEY,
    apiSecret: DEFENDER_TEAM_API_SECRET,
  });

  await client.updateCodeFromFolder(
    DEFENDER_QUICKSWAP_GET_REWARD_AUTOTASK_ID,
    bundleFolderPath
  );
}
