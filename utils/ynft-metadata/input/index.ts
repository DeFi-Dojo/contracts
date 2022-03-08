import path from "path";
import { VaultName } from "../../../../consts";
import { readFileInFolder } from "../moralis-ipfs";
import tokensData from "./token-data.json";

const imagesDirectory = path.join(__dirname, "images");

export const readImageFileByVault = (name: VaultName) => {
  const fileName = [name, "png"].join(".");
  const filePath = path.join(imagesDirectory, fileName);
  return readFileInFolder(filePath);
};

export const getTokenDataByVault = (name: VaultName) => {
  const tokenData = tokensData.find((d) => d["Name Suggestion"] === name);

  if (!tokenData) {
    throw new Error("Could not find token input data for metadata ipfs upload");
  }

  return tokenData;
};
