import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";

import chai from "chai";
import { solidity } from "ethereum-waffle";
import { HardhatUserConfig } from "hardhat/config";
import hardhatConfig from "./hardhat.config";

chai.use(solidity);

const config: HardhatUserConfig = {
  ...hardhatConfig,
  defaultNetwork: "hardhat",
  networks: {},
};

export default config;
