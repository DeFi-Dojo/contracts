import hre, { ethers } from "hardhat";
import { MaticPOSClient } from "@maticnetwork/maticjs";
import HDWalletProvider from "@truffle/hdwallet-provider";
import { typeCheck } from "../utils";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Making transfer using address: ${owner.address}`);

  const from = owner.address;
  const to = owner.address;

  const { matic, goerli } = hre.config.networks;

  if (Array.isArray(goerli.accounts) || typeof goerli.accounts === "string") {
    throw new Error("Wrong config of goerli, mnemonic not found");
  }

  if (!typeCheck.isHtttpNetworkConfig(goerli)) {
    throw new Error("Wrong config of goerli, url not found");
  }

  if (!typeCheck.isHtttpNetworkConfig(matic)) {
    throw new Error("Wrong config of matic, url not found");
  }

  const parentProvider = new HDWalletProvider(
    goerli.accounts.mnemonic,
    goerli.url
  );

  const maticPOSClient = new MaticPOSClient({
    network: "testnet",
    version: "mumbai",
    parentProvider,
    maticProvider: matic.url,
  });

  const amountToken = "0.01";

  const amount = hre.web3.utils.toWei(amountToken, "ether");

  console.log(`sending ${amountToken} token`);

  /*
   https://docs.matic.network/docs/develop/network-details/mapped-tokens/ 
  this address is the address of DummyERC20Token, change to your own root token address
  */
  const rootTokenAddress = "0x655F2166b0709cd575202630952D71E2bB0d61Af";

  await maticPOSClient.approveERC20ForDeposit(rootTokenAddress, amount, {
    from,
  });

  await maticPOSClient.depositERC20ForUser(rootTokenAddress, to, amount, {
    from,
    gasPrice: "100000000000",
  });

  console.log("transfer completed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
