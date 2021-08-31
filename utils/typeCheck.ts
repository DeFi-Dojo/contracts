import { HardhatNetworkConfig, HttpNetworkConfig } from "hardhat/types";

export function isHtttpNetworkConfig(
  config: HttpNetworkConfig | HardhatNetworkConfig
): config is HttpNetworkConfig {
  return (config as HttpNetworkConfig).url !== undefined;
}
