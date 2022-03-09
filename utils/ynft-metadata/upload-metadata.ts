import { saveFileToIpfs, saveJsonToIpfs } from "../moralis-ipfs";
import { buildMetadata } from "./build-metadata";
import { VaultName } from "../../consts";
import configEnv from "../../config";
import { getTokenDataByVault, readImageFileByVault } from "./input";

export const imageBaseUri = configEnv.MORALIS_IPFS_URL;

export const uploadYnftMetadata = async (name: VaultName) => {
  const data = getTokenDataByVault(name);

  const imageFile = readImageFileByVault(name);
  const imageIpfsHash = await saveFileToIpfs(imageFile);

  const metadata = buildMetadata({
    name,
    description: data.Description,
    pool: data.Pool,
    platform: data.Platform,
    imageBaseUri,
    imagePathUri: imageIpfsHash,
  });
  const metaIpfsHash = await saveJsonToIpfs([name, "json"].join("."), metadata);

  console.log(`Generated metadata for ${name}`, metadata, "\n");

  return metaIpfsHash;
};
