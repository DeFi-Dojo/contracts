import '@nomiclabs/hardhat-waffle';
import 'hardhat-ethernal';
import { task, HardhatUserConfig } from 'hardhat/config';

task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  defaultNetwork: 'localhost',
  networks: {
    hardhat: {
      chainId: 1337,
      mining: {
        auto: false,
        interval: 5000,
      }
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
