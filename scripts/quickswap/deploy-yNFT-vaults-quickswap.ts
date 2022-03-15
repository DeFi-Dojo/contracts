import { ethers } from "hardhat";

import { QuickswapYNFTVault__factory } from "../../typechain";
import configEnv from "../../config";
import { QuickswapVaultName, QuickswapVaultsToDeploy } from "../../consts";
import { uploadYnftMetadata } from "../../utils/ynft-metadata/upload-metadata";
import { sequence } from "../../utils/promises";

const { ADDRESSES, HARVESTER_ADDRESS, BENEFICIARY_ADDRESS, MORALIS_IPFS_URL } =
  configEnv;

const quickswapTokenPairAddresses: { [k in QuickswapVaultName]: string } = {
  [QuickswapVaultName.maticEth]: ADDRESSES.PAIR_WMATIC_WETH_QUICKSWAP,
  [QuickswapVaultName.maticQuick]: ADDRESSES.PAIR_WMATIC_QUICK_QUICKSWAP,
  [QuickswapVaultName.maticUsdc]: ADDRESSES.PAIR_WMATIC_USDC_QUICKSWAP,
  [QuickswapVaultName.maticUsdt]: ADDRESSES.PAIR_WMATIC_USDT_QUICKSWAP,
};

const deployQuickswapYnftVault = async (
  quickswapTokenPairAddress: string,
  ynftPathUri: string
) => {
  const contractName = "QuickswapYNFTVault";
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const contractFactory =
    await ethers.getContractFactory<QuickswapYNFTVault__factory>(contractName);

  const contract = await contractFactory.deploy(
    ADDRESSES.ROUTER_02_QUICKSWAP,
    quickswapTokenPairAddress,
    ADDRESSES.STAKING_DUAL_REWARDS_QUICKSWAP,
    ADDRESSES.DQUICK,
    HARVESTER_ADDRESS,
    BENEFICIARY_ADDRESS,
    "Dojo yNFT",
    MORALIS_IPFS_URL,
    ynftPathUri
  );

  await contract.deployed();

  console.log(`${contractName} deployed to: `, contract.address);
  const ynftAddress = await contract.yNFT();
  console.log(`${contractName} ynft address: `, ynftAddress);
};

async function main() {
  await sequence(
    [...QuickswapVaultsToDeploy].map(async (vaultName) => {
      console.log(`${vaultName}: Upload metadata start`);
      const ynftPathUri = await uploadYnftMetadata(vaultName);
      console.log(`${vaultName}: Upload metadata success`);

      console.log(`${vaultName}: Deploy vault start`);
      await deployQuickswapYnftVault(
        quickswapTokenPairAddresses[vaultName],
        ynftPathUri
      );
      console.log(`${vaultName}: Deploy vault success`);
    })
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
