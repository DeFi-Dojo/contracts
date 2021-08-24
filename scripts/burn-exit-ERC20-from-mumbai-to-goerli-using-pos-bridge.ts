import hre, { ethers } from "hardhat";
import { MaticPOSClient } from "@maticnetwork/maticjs";
import HDWalletProvider from "@truffle/hdwallet-provider";
import { typeCheck } from "../utils";

// mumbai - goerli bridge part 2

// change it to your transaction hash
const burnTransationHash = "";

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

  await maticPOSClient.exitERC20(burnTransationHash, { from });

  console.log("transfer completed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
