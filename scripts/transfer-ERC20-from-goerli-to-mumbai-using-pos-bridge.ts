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
  const to = owner.address;

  const { matic, goerli } = hre.config.networks;


  if(Array.isArray(goerli.accounts) || typeof goerli.accounts === 'string') {
    throw new Error('Wrong config of goerli, mnemonic not found')
  }

  if(!isHtttpNetworkConfig(goerli)) {
    throw new Error('Wrong config of goerli, url not found')
  }

  if(!isHtttpNetworkConfig(matic)) {
    throw new Error('Wrong config of matic, url not found')
  }

  const { privateKey } = ethers.Wallet.fromMnemonic(goerli.accounts.mnemonic);

  const parentProvider = new HDWalletProvider(privateKey, goerli.url)

  const maticPOSClient = new MaticPOSClient({
      network: "testnet",
      version: "mumbai",
      parentProvider,
      maticProvider: matic.url,
  })

  const amountEther = '0.01';

  const amount = hre.web3.utils.toWei(amountEther, 'ether')

  console.log(`sending ${amountEther} ether`);

    /*
   https://docs.matic.network/docs/develop/network-details/mapped-tokens/ 
  change to your own root token address
  */
  const rootTokenAddressOfDummyERC20Token = '0x655F2166b0709cd575202630952D71E2bB0d61Af';

  await maticPOSClient.approveERC20ForDeposit(rootTokenAddressOfDummyERC20Token, amount, { from})

  await maticPOSClient.depositERC20ForUser(rootTokenAddressOfDummyERC20Token, to, amount, {
      from,
      gasPrice: "100000000000"
  })

  console.log('transfer completed');

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
