import path from "path";

import configEnv from "../../../../config";

export const serverUrl = configEnv.MORALIS_SERVER_URL;
export const appId = configEnv.MORALIS_APP_ID;
export const masterKey = configEnv.MORALIS_MASTER_KEY;
export const imageBaseUri = "https://ipfs.moralis.io:2053/ipfs/";
export const imagesDirectory = path.join(__dirname, "images");
