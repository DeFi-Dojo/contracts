import dotenv from "dotenv";

dotenv.config();

const {
  RINKEBY_API_URL,
  DEFAULT_NETWORK,
  POLYGON_MUMBAI_API_URL,
  WALLET_MNEMONIC,
  NFT_BASE_URI,
  NFT_FACTORY_BASE_URI,
  USE_ETHERNAL,
} = process.env;

if (
  RINKEBY_API_URL === undefined ||
  DEFAULT_NETWORK === undefined ||
  POLYGON_MUMBAI_API_URL === undefined ||
  WALLET_MNEMONIC === undefined ||
  NFT_BASE_URI === undefined ||
  NFT_FACTORY_BASE_URI === undefined ||
  USE_ETHERNAL === undefined
) {
  throw new Error("ENV not valid");
}

export default {
  RINKEBY_API_URL,
  DEFAULT_NETWORK,
  POLYGON_MUMBAI_API_URL,
  WALLET_MNEMONIC,
  NFT_BASE_URI,
  NFT_FACTORY_BASE_URI,
  USE_ETHERNAL: JSON.parse(USE_ETHERNAL),
};
