import hre, { ethers } from 'hardhat'
import { MaticPOSClient } from '@maticnetwork/maticjs';
import HDWalletProvider from '@truffle/hdwallet-provider';
import { typeCheck } from '../utils'

// const wait = () => new Promise<void>((resolve) => {
//   setTimeout(() => {
//     resolve()
//   }, 10000)
// });

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

  if(!typeCheck.isHtttpNetworkConfig(goerli)) {
    throw new Error('Wrong config of goerli, url not found')
  }

  if(!typeCheck.isHtttpNetworkConfig(matic)) {
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

  console.log(`sending ${amountMatic} token`);

  /*
   https://docs.matic.network/docs/develop/network-details/mapped-tokens/ 
  this address is the address of DummyERC20Token, change to your own child token address
  */
  const childTokenAddress = '0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1';

  const burn = await maticPOSClient.burnERC20(childTokenAddress, amount, { from });

  const { transactionHash: burnTransationHash } = burn;

  console.log(`Burned successfully, transaction hash: ${burnTransationHash}`);


  // Ethereum provider
  const provider = new hre.Web3.providers.WebsocketProvider(
    goerli.url.replace('https', 'wss')
  );

  // txHash - transaction hash on Matic
  // rootChainAddress - root chain proxy address on Ethereum
    async function checkInclusion(txHash: string, rootChainAddress: string) {

      const web3 = new hre.Web3(provider);

      if(!typeCheck.isHtttpNetworkConfig(matic)) {
        throw new Error('Wrong config of matic, url not found')
      }

      // const child_provider = new hre.Web3.providers.HttpProvider(
      //   matic.url
      // );

      const child_web3 = new hre.Web3(maticProvider);


      let txDetails = await child_web3.eth.getTransactionReceipt(txHash);

      const block = txDetails.blockNumber;
      return new Promise(async (resolve, reject) => {
      web3.eth.subscribe(
          "logs",
          {
            address: rootChainAddress,
          },
          async (error, result) => {
            if (error) {
              reject(error);
            }

            if (result.data) {
              let transaction = web3.eth.abi.decodeParameters(
                ["uint256", "uint256", "bytes32"],
                result.data
              );
              if (block <= transaction["1"]) {
                resolve(result);
              }
            }
          }
        );
      });
    }

  // RootChainProxy Address on root chain (0x86E4Dc95c7FBdBf52e33D563BbDB00823894C287 for mainnet)
    const rootChainProxyAddress = '0x2890ba17efe978480615e330ecb65333b880928e';
    const res = await checkInclusion(
      burnTransationHash,
      rootChainProxyAddress,
    )
    console.log('RESPONSE')
    console.log(res);
    console.log('exit');


    await maticPOSClient.exitERC20(burnTransationHash, { from });

    console.log('transfer completed');

    // @ts-ignore
    provider.disconnect();
}



main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
