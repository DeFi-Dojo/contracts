export const PROXY_REGISTRY_ADDRESS_RINKEBY =
  "0xf57b2c51ded3a29e6891aba85459d600256cf317";

export const MAX_SUPPLY_OF_NFT = 1000;

export const NATIVE_TOKEN_PRICE_FEED_DECIMALS = 8;

export const SECONDS_IN_ONE_DAY = 1440000;

export const DECIMALS = {
  MATIC: 18,
  DAI: 18,
  USDT: 6,
};

interface Address {
  INCENTIVES_CONTROLLER: string;
  ROUTER_02_SUSHISWAP: string;
  NATIVE_TOKEN_USD_PRICE_FEED: string;
  A_DAI: string;
  A_USDT: string;
  USDT: string;
  DAI: string;
  USDC: string;
  WMATIC: string;
  PAIR_USDC_USDT_SUSHISWAP: string;
  PAIR_WETH_USDT_SUSHISWAP: string;
  MASTER_CHEF_V2_SUSHISWAP: string;
  PAIR_WMATIC_WETH_SUSHISWAP: string;
  STAKING_DUAL_REWARDS_QUICKSWAP: string;
  ROUTER_02_QUICKSWAP: string;
  PAIR_WMATIC_USDT_QUICKSWAP: string;
  DRAGON_SYRUP_QUICKSWAP: string;
  DQUICK: string;
}

type Addresses = { [k: string]: Address };

// 0x0 = TODO to be added
export const NETWORK_ADDRESSES: Addresses = {
  HARDHAT: {
    INCENTIVES_CONTROLLER: "0x357D51124f59836DeD84c8a1730D72B749d8BC23",
    ROUTER_02_SUSHISWAP: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    NATIVE_TOKEN_USD_PRICE_FEED: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
    A_DAI: "0x27F8D03b3a2196956ED754baDc28D73be8830A6e",
    A_USDT: "0x60D55F02A771d515e077c9C2403a1ef324885CeC",
    USDT: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    USDC: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    DQUICK: "0xf28164a485b0b2c90639e47b0f377b4a438a16b1",
    PAIR_USDC_USDT_SUSHISWAP: "0x4B1F1e2435A9C96f7330FAea190Ef6A7C8D70001",
    PAIR_WETH_USDT_SUSHISWAP: "0x55FF76BFFC3Cdd9D5FdbBC2ece4528ECcE45047e",
    PAIR_WMATIC_WETH_SUSHISWAP: "0xc4e595acDD7d12feC385E5dA5D43160e8A0bAC0E",
    MASTER_CHEF_V2_SUSHISWAP: "0x0769fd68dFb93167989C6f7254cd0D766Fb2841F",
    STAKING_DUAL_REWARDS_QUICKSWAP:
      "0xc0eb5d1316b835F4B584B59f922d9c87cA5053E5",
    DRAGON_SYRUP_QUICKSWAP: "0xd6Ce4f3D692C1c6684fb449993414C5c9E5D0073",
    ROUTER_02_QUICKSWAP: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
    PAIR_WMATIC_USDT_QUICKSWAP: "0x604229c960e5CACF2aaEAc8Be68Ac07BA9dF81c3",
  },
  MATIC: {
    INCENTIVES_CONTROLLER: "0x357D51124f59836DeD84c8a1730D72B749d8BC23",
    ROUTER_02_SUSHISWAP: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    NATIVE_TOKEN_USD_PRICE_FEED: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
    A_DAI: "0x27F8D03b3a2196956ED754baDc28D73be8830A6e",
    A_USDT: "0x60D55F02A771d515e077c9C2403a1ef324885CeC",
    USDT: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    USDC: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    DQUICK: "0xf28164a485b0b2c90639e47b0f377b4a438a16b1",
    PAIR_USDC_USDT_SUSHISWAP: "0x4B1F1e2435A9C96f7330FAea190Ef6A7C8D70001",
    PAIR_WETH_USDT_SUSHISWAP: "0x55FF76BFFC3Cdd9D5FdbBC2ece4528ECcE45047e",
    PAIR_WMATIC_WETH_SUSHISWAP: "0xc4e595acDD7d12feC385E5dA5D43160e8A0bAC0E",
    MASTER_CHEF_V2_SUSHISWAP: "0x0769fd68dFb93167989C6f7254cd0D766Fb2841F",
    STAKING_DUAL_REWARDS_QUICKSWAP:
      "0xc0eb5d1316b835F4B584B59f922d9c87cA5053E5",
    DRAGON_SYRUP_QUICKSWAP: "0xd6Ce4f3D692C1c6684fb449993414C5c9E5D0073",
    ROUTER_02_QUICKSWAP: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
    PAIR_WMATIC_USDT_QUICKSWAP: "0x604229c960e5CACF2aaEAc8Be68Ac07BA9dF81c3",
  },
  MUMBAI: {
    INCENTIVES_CONTROLLER: "0xd41aE58e803Edf4304334acCE4DC4Ec34a63C644",
    ROUTER_02_SUSHISWAP: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    NATIVE_TOKEN_USD_PRICE_FEED: "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada",
    A_DAI: "0x639cB7b21ee2161DF9c882483C9D55c90c20Ca3e",
    A_USDT: "0xF8744C0bD8C7adeA522d6DDE2298b17284A79D1b",
    USDT: "0xBD21A10F619BE90d6066c941b04e340841F1F989",
    DAI: "0x0",
    USDC: "0x0",
    WMATIC: "0x0",
    DQUICK: "0x0",
    PAIR_USDC_USDT_SUSHISWAP: "0x0",
    PAIR_WETH_USDT_SUSHISWAP: "0x0",
    MASTER_CHEF_V2_SUSHISWAP: "0x0",
    PAIR_WMATIC_WETH_SUSHISWAP: "0x0",
    STAKING_DUAL_REWARDS_QUICKSWAP: "0x0",
    ROUTER_02_QUICKSWAP: "0x0",
    PAIR_WMATIC_USDT_QUICKSWAP: "0x0",
    DRAGON_SYRUP_QUICKSWAP: "0x0",
  },
  KOVAN: {
    INCENTIVES_CONTROLLER: "0x0",
    ROUTER_02_SUSHISWAP: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    A_DAI: "0xdcf0af9e59c002fa3aa091a46196b37530fd48a8",
    NATIVE_TOKEN_USD_PRICE_FEED: "0x9326BFA02ADD2366b30bacB125260Af641031331",
    A_USDT: "0x0",
    DAI: "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD",
    USDT: "0x07de306FF27a2B630B1141956844eB1552B956B5",
    USDC: "0xb7a4F3E9097C08dA09517b5aB877F7a917224ede",
    WMATIC: "0x0",
    DQUICK: "0x0",
    PAIR_USDC_USDT_SUSHISWAP: "0x0",
    PAIR_WETH_USDT_SUSHISWAP: "0x0",
    MASTER_CHEF_V2_SUSHISWAP: "0x0",
    PAIR_WMATIC_WETH_SUSHISWAP: "0x0",
    STAKING_DUAL_REWARDS_QUICKSWAP: "0x0",
    ROUTER_02_QUICKSWAP: "0x0",
    PAIR_WMATIC_USDT_QUICKSWAP: "0x0",
    DRAGON_SYRUP_QUICKSWAP: "0x0",
  },
};
