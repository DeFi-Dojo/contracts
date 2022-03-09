/* eslint-disable no-underscore-dangle */
import Moralis from "moralis/node";
import { readFileSync } from "fs";
import mime from "mime-types";

export const readFileInFolder = (filePath: string) => {
  try {
    const fileData = Array.from(readFileSync(filePath));
    const [name] = filePath.split(".")[0].split("/").reverse();

    const file = new Moralis.File(
      name,
      fileData,
      mime.lookup(filePath) || undefined
    );

    return file;
  } catch (e) {
    console.log("Could not read ipfs file", e);
    throw e;
  }
};

export const saveFileToIpfs = async (file: Moralis.File) => {
  const saveResult = await file.saveIPFS({ useMasterKey: true });

  return (saveResult as unknown as { _hash: string })._hash;
};

export const saveJsonToIpfs = async (
  fileName: string,
  obj: { [key: string]: any }
) => {
  const file = new Moralis.File(
    fileName,
    Array.from(Buffer.from(JSON.stringify(obj)))
  );

  return saveFileToIpfs(file);
};
