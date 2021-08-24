import hre, { ethers } from "hardhat";
import { MaticPOSClient } from "@maticnetwork/maticjs";
import HDWalletProvider from "@truffle/hdwallet-provider";
import { typeCheck, eventTracking } from "../utils";

// mumbai - goerli bridge part 1

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Making transfer using address: ${owner.address}`);

  const from = owner.address;

  const { matic, goerli } = hre.config.networks;

  if (Array.isArray(matic.accounts) || typeof matic.accounts === "string") {
    throw new Error("Wrong config of matic, mnemonic not found");
  }

  if (Array.isArray(goerli.accounts) || typeof goerli.accounts === "string") {
    throw new Error("Wrong config of goerli, mnemonic not found");
  }

  if (!typeCheck.isHtttpNetworkConfig(goerli)) {
    throw new Error("Wrong config of goerli, url not found");
  }

  if (!typeCheck.isHtttpNetworkConfig(matic)) {
    throw new Error("Wrong config of matic, url not found");
  }

  const maticProvider = new HDWalletProvider(
    matic.accounts.mnemonic,
    matic.url
  );

  const parentProvider = new HDWalletProvider(
    goerli.accounts.mnemonic,
    goerli.url
  );

  const maticPOSClient = new MaticPOSClient({
    network: "testnet",
    version: "mumbai",
    parentProvider,
    maticProvider,
  });

  const amountToken = "0.01";

  const amount = hre.web3.utils.toWei(amountToken, "ether");

  console.log(`sending ${amountToken} token`);

  /*
   https://docs.matic.network/docs/develop/network-details/mapped-tokens/ 
  this address is the address of DummyERC20Token, change to your own child token address
  */
  const childTokenAddress = "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1";

  const burn = await maticPOSClient.burnERC20(childTokenAddress, amount, {
    from,
  });

  const { transactionHash: burnTransationHash } = burn;

  console.log(`Burned successfully, transaction hash: ${burnTransationHash}`);

  const parentWebsocketProvider = new hre.Web3.providers.WebsocketProvider(
    goerli.url.replace("https", "wss")
  );

  const parentWebsocketWeb3 = new hre.Web3(parentWebsocketProvider);

  if (!typeCheck.isHtttpNetworkConfig(matic)) {
    throw new Error("Wrong config of matic, url not found");
  }

  const childProvider = new hre.Web3.providers.HttpProvider(matic.url);

  const childWeb3 = new hre.Web3(childProvider);

  // RootChainProxy Address on root chain (0x86E4Dc95c7FBdBf52e33D563BbDB00823894C287 for mainnet)
  const rootChainProxyAddress = "0x2890ba17efe978480615e330ecb65333b880928e";

  // All transactions that occur on Matic chain are check-pointed to the Ethereum chain in frequent intervals of time by the validators. This time is ~10 mins on Mumbai and ~30 mins on Matic mainnet.
  console.log(
    "Waiting for the burn transaction check-point on the Ethereum chain. It can take up to 10 minutes, please don`t shut down the console."
  );
  const log = await eventTracking.checkInclusion({
    txHash: burnTransationHash,
    rootChainAddress: rootChainProxyAddress,
    childWeb3,
    parentWebsocketWeb3,
  });

  console.log(`burned transaction confirmed on the etherum chain`);
  console.log(log);
  console.log(
    `change the burnTransationHash in the scripts/burn-exit-ERC20-from-mumbai-to-goerli-using-pos-bridge.ts to the: ${burnTransationHash}`
  );
  console.log("Than run the command:");
  console.log(
    "npx hardhat run scripts/burn-exit-ERC20-from-mumbai-to-goerli-using-pos-bridge"
  );

  console.log(
    'TODO: This is wrong way, merge it one script. Unfortunately if we try to do everything in one script there is error: { code: -32000, message: "nonce too low" }'
  );

  // @ts-ignore
  parentWebsocketProvider.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
