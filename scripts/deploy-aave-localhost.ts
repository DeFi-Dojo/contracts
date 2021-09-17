import { Contract, ContractTransaction } from "ethers";
import hre, { ethers } from "hardhat";
import { Libraries } from "hardhat/types";
import { AToken, DojoNFT, DummyReserveInterestRateStrategy, FeeProvider, LendingPool, LendingPoolAddressesProvider, LendingPoolConfigurator, LendingPoolCore, LendingPoolDataProvider, LendingPoolParametersProvider, LPNFT, TokenERC20 } from "../typechain";


const wait = (res: ContractTransaction) => res.wait();

const deployContract = async <T extends Contract>(contractName: string, constructorArgs: any[], libraries?: Libraries) => {
  const contractFactory = await ethers.getContractFactory(contractName, { libraries });
  const contract = await contractFactory.deploy(...constructorArgs);
  await contract.deployed();

  // await hre.ethernal.push({
  //   name: contractName,
  //   address: contract.address,
  // });
  console.log(`${contractName} deployed to: `, contract.address);
  return contract as T;
}

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying AAVE using address: ${owner.address}`);

  const lendingPoolAddressesProvider = await deployContract<LendingPoolAddressesProvider>("LendingPoolAddressesProvider", []);

  const coreLibrary = await deployContract("CoreLibrary", []);

  const [
    underlyingToken,
    lendingPool,
    lendingPoolCore,
    lendingPoolDataProvider,
    lendingPoolParametersProvider,
    lendingPoolConfigurator,
    feeProvider,
    dummyReserveInterestStrategy, 
  ] = await Promise.all([
    deployContract<TokenERC20>("TokenERC20", ["Token1", "TK1"]),
    deployContract<LendingPool>("LendingPool", []),
    deployContract<LendingPoolCore>("LendingPoolCore", [], { CoreLibrary: coreLibrary.address }),
    deployContract<LendingPoolDataProvider>("LendingPoolDataProvider", []),
    deployContract<LendingPoolParametersProvider>("LendingPoolParametersProvider", []),
    deployContract<LendingPoolConfigurator>("LendingPoolConfigurator", []),
    deployContract<FeeProvider>("FeeProvider", []),
    deployContract<DummyReserveInterestRateStrategy>("DummyReserveInterestRateStrategy", []),
  ]);
  
  await lendingPoolAddressesProvider.setLendingPoolImpl(lendingPool.address).then(wait);
  await lendingPoolAddressesProvider.setLendingPoolCoreImpl(lendingPoolCore.address).then(wait).then(res => console.log(`Core event: ${res.events![0].args}`));
  await lendingPoolAddressesProvider.setLendingPoolDataProviderImpl(lendingPoolDataProvider.address).then(wait);
  await lendingPoolAddressesProvider.setLendingPoolParametersProviderImpl(lendingPoolParametersProvider.address).then(wait);
  await lendingPoolAddressesProvider.setLendingPoolConfiguratorImpl(lendingPoolConfigurator.address).then(wait);
  await lendingPoolAddressesProvider.setFeeProviderImpl(feeProvider.address).then(wait);
  await lendingPoolAddressesProvider.setLendingPoolManager(owner.address).then(wait);

  await lendingPoolCore.initialize(lendingPoolAddressesProvider.address).then(wait);
  await lendingPoolDataProvider.initialize(lendingPoolAddressesProvider.address).then(wait);
  await lendingPoolParametersProvider.initialize(lendingPoolAddressesProvider.address).then(wait);
  await lendingPoolConfigurator.initialize(lendingPoolAddressesProvider.address).then(wait);
  await feeProvider.initialize(lendingPoolAddressesProvider.address).then(wait);
  await lendingPool.initialize(lendingPoolAddressesProvider.address).then(wait);

  const initReserveReceipt = await lendingPoolConfigurator.initReserve(underlyingToken.address, 18, dummyReserveInterestStrategy.address).then(wait);
  const aTokenAddress = initReserveReceipt.events![0].args![1];
  console.log(`AToken address: ${aTokenAddress}`);
  
  await underlyingToken.approve('0xb7a5bd0345ef1cc5e66bf61bdec17d2461fbd968', 1000000).then(wait);
  
  const balanceBeforeDeposit = await underlyingToken.balanceOf(owner.address);

  await lendingPool.deposit(underlyingToken.address, 1000000, 0).then(wait);
  
  const balanceAfterDeposit = await underlyingToken.balanceOf(owner.address);

  const aToken: AToken = await ethers.getContractAt("AToken", aTokenAddress);

  await aToken.redeem(500000).then(wait);

  const balanceAfterRedeem = await underlyingToken.balanceOf(owner.address);

  const nft = await deployContract<DojoNFT>("DojoNFT", []);
  await nft.mint().then(wait);
  
  const nlp = await deployContract<LPNFT>("LPNFT", [aTokenAddress, nft.address]);
  
  await aToken.approve(nlp.address, 500000).then(wait);
  await nlp.addLPtoNFT(0, 500000).then(wait);
  await nlp.redeemLPTokens(0, 500000).then(wait);
  
  const balanceAfterNLPRedeem = await underlyingToken.balanceOf(owner.address);
  console.log(`Balances: ${balanceBeforeDeposit}, ${balanceAfterDeposit}, ${balanceAfterRedeem}, ${balanceAfterNLPRedeem}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
