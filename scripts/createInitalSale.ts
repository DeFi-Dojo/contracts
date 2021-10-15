import { ethers } from "hardhat";
import { OpenSeaPort, Network } from "opensea-js";
import { MnemonicWalletSubprovider } from "@0x/subproviders";
// @ts-ignore
import RPCSubprovider from "web3-provider-engine/subproviders/rpc";
import Web3ProviderEngine from "web3-provider-engine";

import { DojoNFT, OpenSeaFactory } from "../typechain";
import { deployContract, waitForReceipt } from "../utils/deployment";

const PROXY_REGISTRY_ADDRESS_RINKEBY =
  "0xf57b2c51ded3a29e6891aba85459d600256cf317";

const { RINKEBY_API_URL, WALLET_MNEMONIC, NFT_BASE_URI } = process.env;

const NUM_FIXED_PRICE_AUCTIONS = 5;
const FIXED_PRICE = 0.05;
const BASE_DERIVATION_PATH = "44'/60'/0'/0";

async function main() {
  const [owner] = await ethers.getSigners();

  if (!WALLET_MNEMONIC || !RINKEBY_API_URL || !NFT_BASE_URI) {
    return;
  }

  const mnemonicWalletSubprovider = new MnemonicWalletSubprovider({
    mnemonic: WALLET_MNEMONIC,
    baseDerivationPath: BASE_DERIVATION_PATH,
  });

  const infuraRpcSubprovider = new RPCSubprovider({
    rpcUrl: RINKEBY_API_URL,
  });

  const providerEngine = new Web3ProviderEngine();
  providerEngine.addProvider(mnemonicWalletSubprovider);
  providerEngine.addProvider(infuraRpcSubprovider);
  providerEngine.start();

  const seaport = new OpenSeaPort(
    providerEngine,

    {
      networkName: Network.Rinkeby,
    },
    (arg) => console.log(arg)
  );

  console.log(`Deploying contracts using address: ${owner.address}`);

  const openSeaNFT = await deployContract<DojoNFT>("DojoNFT", [
    NFT_BASE_URI,
    PROXY_REGISTRY_ADDRESS_RINKEBY,
  ]);

  const openSeaFactory = await deployContract<OpenSeaFactory>(
    "OpenSeaFactory",
    [PROXY_REGISTRY_ADDRESS_RINKEBY, openSeaNFT.address]
  );

  await openSeaNFT
    .transferOwnership(openSeaFactory.address)
    .then(waitForReceipt);

  console.log("ownership transfered");

  const FACTORY_CONTRACT_ADDRESS = openSeaFactory.address;

  console.log("Creating sell orders");

  const fixedSellOrders = await seaport.createFactorySellOrders({
    assets: [
      {
        tokenId: "0",
        tokenAddress: FACTORY_CONTRACT_ADDRESS,
      },
    ],
    accountAddress: owner.address,
    startAmount: FIXED_PRICE,
    numberOfOrders: NUM_FIXED_PRICE_AUCTIONS,
  });

  console.log(
    `Successfully made ${fixedSellOrders} fixed-price sell orders for multiple assets at once!`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
