import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-ethers';
import { HardhatUserConfig } from 'hardhat/config';
import hardhatConfig from './hardhat.config';

const config: HardhatUserConfig = {
  ...hardhatConfig,
  defaultNetwork: 'hardhat',
  networks: {},
};

export default config;
