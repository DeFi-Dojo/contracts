import dotenv from "dotenv";
import { Network, NETWORK_ADDRESSES } from "../consts";

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
  DEFENDER_AAVE_AUTOTASK_ID,
  DEFENDER_QUICKSWAP_AUTOTASK_ID,
  HARVESTER_ADDRESS,
  BENEFICIARY_ADDRESS,
  HARDHAT_FORKING_URL,
  NFT_FACTORY_OWNER_ADDRESS,
  MORALIS_SERVER_URL,
  MORALIS_APP_ID,
  MORALIS_MASTER_KEY,
  MORALIS_IPFS_URL,
  ETHERSCAN_API_KEY,
  DEFAULT_ADMIN_ROLE_ADDRESS,
  DJO_TOKEN_ADDRESS,
  DJO_TOKEN_OWNER,
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
  DEFENDER_AAVE_AUTOTASK_ID === undefined ||
  DEFENDER_QUICKSWAP_AUTOTASK_ID === undefined ||
  HARVESTER_ADDRESS === undefined ||
  BENEFICIARY_ADDRESS === undefined ||
  HARDHAT_FORKING_URL === undefined ||
  NFT_FACTORY_OWNER_ADDRESS === undefined ||
  MORALIS_SERVER_URL === undefined ||
  MORALIS_APP_ID === undefined ||
  MORALIS_MASTER_KEY === undefined ||
  MORALIS_IPFS_URL === undefined ||
  DEFAULT_ADMIN_ROLE_ADDRESS === undefined ||
  DJO_TOKEN_ADDRESS === undefined ||
  DJO_TOKEN_OWNER === undefined
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
  ADDRESSES: NETWORK_ADDRESSES[DEFAULT_NETWORK.toUpperCase() as Network],
  VAULT_ADDRESS,
  DEFENDER_TEAM_API_KEY,
  DEFENDER_TEAM_API_SECRET,
  DEFENDER_AAVE_AUTOTASK_ID,
  DEFENDER_QUICKSWAP_AUTOTASK_ID,
  HARVESTER_ADDRESS,
  BENEFICIARY_ADDRESS,
  HARDHAT_FORKING_URL,
  NFT_FACTORY_OWNER_ADDRESS,
  MORALIS_SERVER_URL,
  MORALIS_APP_ID,
  MORALIS_MASTER_KEY,
  MORALIS_IPFS_URL,
  ETHERSCAN_API_KEY,
  DEFAULT_ADMIN_ROLE_ADDRESS,
  DJO_TOKEN_ADDRESS,
  DJO_TOKEN_OWNER,
};
