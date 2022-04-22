import { AutotaskClient } from "defender-autotask-client";
import { readFileSync } from "fs";
import configEnv from "../config";

const { DEFENDER_TEAM_API_KEY, DEFENDER_TEAM_API_SECRET } = configEnv;

export const uploadAutotaskFromFolder =
  (taskId: string) => async (bundleFolderPath: string) => {
    const client = new AutotaskClient({
      apiKey: DEFENDER_TEAM_API_KEY,
      apiSecret: DEFENDER_TEAM_API_SECRET,
    });

    await client.updateCodeFromFolder(taskId, bundleFolderPath);
  };

export const uploadAutotaskFromFile =
  (taskId: string) => async (bundleFilePath: string) => {
    const client = new AutotaskClient({
      apiKey: DEFENDER_TEAM_API_KEY,
      apiSecret: DEFENDER_TEAM_API_SECRET,
    });

    const bundleFile = readFileSync(bundleFilePath, { encoding: "utf-8" });

    await client.updateCodeFromSources(taskId, { "index.js": bundleFile });
  };
