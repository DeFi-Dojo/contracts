import Moralis from "moralis/node";
import { saveFileToIpfs, saveJsonToIpfs } from "../moralis-ipfs";
import { buildMetadata } from "./build-metadata";
import { VaultName } from "../../consts";
import configEnv from "../../config";
import { getTokenDataByVault, readImageFileByVault } from "./input";

const {
  MORALIS_APP_ID,
  MORALIS_SERVER_URL,
  MORALIS_MASTER_KEY,
  MORALIS_IPFS_URL,
} = configEnv;

const moralisStartP = Moralis.start({
  serverUrl: MORALIS_SERVER_URL,
  appId: MORALIS_APP_ID,
  masterKey: MORALIS_MASTER_KEY,
});

export const uploadYnftMetadata = async (name: VaultName) => {
  await moralisStartP;

  console.log(`Uploading metadata for "${name}"`);

  const data = getTokenDataByVault(name);

  const imageFile = readImageFileByVault(name);
  const imageIpfsHash = await saveFileToIpfs(imageFile);

  const metadata = buildMetadata({
    name,
    description: data.Description,
    pool: data.Pool,
    platform: data.Platform,
    imageBaseUri: MORALIS_IPFS_URL,
    imagePathUri: imageIpfsHash,
  });

  const metaIpfsHash = await saveJsonToIpfs([name, "json"].join("."), metadata);

  console.log(
    `Uploaded metadata for "${name}":\n${MORALIS_IPFS_URL}${metaIpfsHash}\n`
  );

  return metaIpfsHash;
};
