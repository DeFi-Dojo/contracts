import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";

import chai from "chai";
import sinonChai from "sinon-chai";
import { solidity } from "ethereum-waffle";
import { HardhatUserConfig } from "hardhat/config";
import hardhatConfig from "./hardhat.config";
import {smock} from "@defi-wonderland/smock";

chai.use(solidity);
chai.use(sinonChai);

const config: HardhatUserConfig = {
  ...hardhatConfig,
  defaultNetwork: "hardhat",
  networks: {},
};

// chai.use(smock.matchers);

export default config;
