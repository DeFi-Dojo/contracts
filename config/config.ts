import dotenv from "dotenv";
import * as consts from "../consts";

dotenv.config();

const {
  RINKEBY_API_URL,
  DEFAULT_NETWORK,
  POLYGON_MUMBAI_API_URL,
  WALLET_MNEMONIC,
  NFT_BASE_URI,
  NFT_FACTORY_BASE_URI,
  KOVAN_API_URL,
  POLYGON_MAINNET_API_URL,
  VAULT_ADDRESS,
  DEFENDER_TEAM_API_KEY,
  DEFENDER_TEAM_API_SECRET,
  DEFENDER_AUTOTASK_ID,
} = process.env;

if (
  RINKEBY_API_URL === undefined ||
  DEFAULT_NETWORK === undefined ||
  POLYGON_MUMBAI_API_URL === undefined ||
  WALLET_MNEMONIC === undefined ||
  NFT_BASE_URI === undefined ||
  NFT_FACTORY_BASE_URI === undefined ||
  KOVAN_API_URL === undefined ||
  POLYGON_MAINNET_API_URL === undefined ||
  VAULT_ADDRESS === undefined ||
  DEFENDER_TEAM_API_KEY === undefined ||
  DEFENDER_TEAM_API_SECRET === undefined ||
  DEFENDER_AUTOTASK_ID === undefined
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
  KOVAN_API_URL,
  POLYGON_MAINNET_API_URL,
  ADDRESSES: consts.NETWORK_ADDRESSES[DEFAULT_NETWORK.toUpperCase()],
  VAULT_ADDRESS,
  DEFENDER_TEAM_API_KEY,
  DEFENDER_TEAM_API_SECRET,
  DEFENDER_AUTOTASK_ID,
};
