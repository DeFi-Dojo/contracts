import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3";
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-etherscan";
import "solidity-coverage";

import { task, HardhatUserConfig } from "hardhat/config";
import configEnv from "./config";

const {
  RINKEBY_API_URL,
  DEFAULT_NETWORK,
  POLYGON_MUMBAI_API_URL,
  WALLET_MNEMONIC,
  KOVAN_API_URL,
  POLYGON_MAINNET_API_URL,
  HARDHAT_FORKING_URL,
  HARVESTER_ADDRESS,
  BENEFICIARY_ADDRESS,
  MORALIS_IPFS_URL,
  ADDRESSES,
  ETHERSCAN_API_KEY,
} = configEnv;

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  accounts.forEach((account) => console.log(account.address));
});

const accounts = {
  mnemonic: WALLET_MNEMONIC,
};

const config: HardhatUserConfig = {
  defaultNetwork: DEFAULT_NETWORK,
  networks: {
  },
  solidity: {
    compilers: [
      {
        version: "0.8.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.5.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.5.5",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
    settings: {
      outputSelection: {
        "*": {
          "*": ["storageLayout"],
        },
      },
    },
  },

  paths: {
    sources: "./contracts",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 20000,
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;
