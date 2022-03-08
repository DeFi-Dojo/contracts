import path from "path";
import Moralis from "moralis/node";
import { writeFileSync } from "fs";

import tokensData from "./input/token-data.json";

import {
  readFileInFolder,
  saveFileToIpfs,
  saveJsonToIpfs,
} from "./moralis-ipfs";
import { buildMetadata } from "./build-metadata";
import {
  appId,
  imageBaseUri,
  imagesDirectory,
  masterKey,
  serverUrl,
} from "./input/config";

(async () => {
  await Moralis.start({ serverUrl, appId, masterKey });

  const metaIpfsHashes = Object.fromEntries(
    await Promise.all(
      tokensData.map(async (data) => {
        const name = data["Name Suggestion"];
        const fileName = [name, "png"].join(".");
        const filePath = path.join(imagesDirectory, fileName);
        const file = readFileInFolder(filePath);

        const imageIpfsHash = await saveFileToIpfs(file);

        const metadata = buildMetadata({
          name,
          description: data.Description,
          pool: data.Pool,
          platform: data.Platform,
          imageBaseUri,
          imagePathUri: imageIpfsHash,
        });
        const metaIpfsHash = await saveJsonToIpfs(
          [name, "json"].join("."),
          metadata
        );

        console.log(`Generated metadata for ${name}`, metadata, "\n");

        return [name, metaIpfsHash];
      })
    )
  ) as { [k: string]: string };

  writeFileSync(
    path.join(__dirname, "output", "ynft-metadata-per-vault-ipfs.json"),
    JSON.stringify(metaIpfsHashes, null, 2)
  );

  console.log(`Uploaded to IPFS: `, metaIpfsHashes);
})();
