import '@nomiclabs/hardhat-waffle';
import 'hardhat-ethernal';
import '@nomiclabs/hardhat-web3';
import { task, HardhatUserConfig } from 'hardhat/config';
import dotenv from 'dotenv';

dotenv.config();

const {
  RINKEBY_API_URL,
  ROPSTEN_API_URL,
  DEFAULT_NETWORK,
  POLYGON_MUMBAI_API_URL,
  WALLET_MNEMONIC,
  GOERLI_API_URL,
} = process.env;

task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  accounts.forEach((account) => console.log(account.address));
});

const accounts = {
  mnemonic: WALLET_MNEMONIC,
};

const config: HardhatUserConfig = {
  defaultNetwork: DEFAULT_NETWORK,
  networks: {
    hardhat: {
      chainId: 1337,
      mining: {
        auto: false,
        interval: 5000,
      },
      accounts,
    },
    ropsten: {
      url: ROPSTEN_API_URL,
      accounts,
    },
    rinkeby: {
      url: RINKEBY_API_URL,
      accounts,
    },
    matic: {
      url: POLYGON_MUMBAI_API_URL,
      accounts,
    },
    goerli: {
      url: GOERLI_API_URL,
      accounts,
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.5.16',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.6.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
    // if it is in compilers it catches the @uniswap/library contracts
    overrides: {
      'contracts/gelato/UniswapV2Router02Handler.sol': {
        version: '0.8.4',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  paths: {
    sources: './contracts',
    cache: './cache',
    artifacts: './artifacts',
  },
  mocha: {
    timeout: 20000,
  },
};

export default config;
