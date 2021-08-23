import hre, { ethers } from 'hardhat'
import { HardhatNetworkConfig, HttpNetworkConfig } from 'hardhat/types'
import { MaticPOSClient } from '@maticnetwork/maticjs';
import HDWalletProvider from '@truffle/hdwallet-provider';

function isHtttpNetworkConfig(pet: HttpNetworkConfig | HardhatNetworkConfig): pet is HttpNetworkConfig {
  return (pet as HttpNetworkConfig).url !== undefined;
}

async function main() {

  const [owner] = await ethers.getSigners()
  console.log(`Making transfer using address: ${owner.address}`);

  const from = owner.address;

  const { matic, goerli } = hre.config.networks;


  if(Array.isArray(matic.accounts) || typeof matic.accounts === 'string') {
    throw new Error('Wrong config of matic, mnemonic not found')
  }

  if(Array.isArray(goerli.accounts) || typeof goerli.accounts === 'string') {
    throw new Error('Wrong config of goerli, mnemonic not found')
  }

  if(!isHtttpNetworkConfig(goerli)) {
    throw new Error('Wrong config of goerli, url not found')
  }

  if(!isHtttpNetworkConfig(matic)) {
    throw new Error('Wrong config of matic, url not found')
  }

  const maticProvider = new HDWalletProvider(matic.accounts.mnemonic, matic.url)

  const parentProvider = new HDWalletProvider(goerli.accounts.mnemonic, goerli.url)

  const maticPOSClient = new MaticPOSClient({
      network: "testnet",
      version: "mumbai",
      parentProvider,
      maticProvider,
  })

  const amountMatic = '0.01';

  const amount = hre.web3.utils.toWei(amountMatic, 'ether')

  console.log(`sending ${amountMatic} matic`);

  /*
   https://docs.matic.network/docs/develop/network-details/mapped-tokens/ 
  change to your own child token address
  */
  const childTokenAddressOfDummyERC20Token = '0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1';

  const burn = await maticPOSClient.burnERC20(childTokenAddressOfDummyERC20Token, amount, { from });

  const { transactionHash: burnTransationHash } = burn;

  console.log(`Burned successfully, transaction hash: ${burnTransationHash}`);

  await maticPOSClient.exitERC20(burnTransationHash, { from });

  console.log('transfer completed');

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
