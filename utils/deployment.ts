import { Contract, ContractTransaction } from "ethers";
import hre, { ethers } from "hardhat";
import { Libraries } from "hardhat/types";
import * as TypeChain from "../typechain";

export const wait = (res: ContractTransaction) => res.wait();

export const deployContract = async <T extends Contract>(contractName: string, constructorArgs: any[], libraries?: Libraries) => {
  const contractFactory = await ethers.getContractFactory(contractName, { libraries });
  const contract = await contractFactory.deploy(...constructorArgs);
  await contract.deployed();

  await hre.ethernal.push({
    name: contractName,
    address: contract.address,
  });
  console.log(`${contractName} deployed to: `, contract.address);
  return contract as T;
}

export const deployAaveContracts = async () => {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying AAVE using address: ${owner.address}`);

  const coreLibrary = await deployContract<TypeChain.CoreLibrary>("CoreLibrary", []);
  const [
    underlyingToken,
    lendingPool,
    lendingPoolCore,
    lendingPoolDataProvider,
    lendingPoolParametersProvider,
    lendingPoolConfigurator,
    lendingPoolAddressesProvider,
    feeProvider,
    dummyReserveInterestStrategy, 
  ] = await Promise.all([
    deployContract<TypeChain.TokenERC20>("TokenERC20", ["Token1", "TK1"]),
    deployContract<TypeChain.LendingPool>("LendingPool", []),
    deployContract<TypeChain.LendingPoolCore>("LendingPoolCore", [], { CoreLibrary: coreLibrary.address }),
    deployContract<TypeChain.LendingPoolDataProvider>("LendingPoolDataProvider", []),
    deployContract<TypeChain.LendingPoolParametersProvider>("LendingPoolParametersProvider", []),
    deployContract<TypeChain.LendingPoolConfigurator>("LendingPoolConfigurator", []),
    deployContract<TypeChain.LendingPoolAddressesProvider>("LendingPoolAddressesProvider", []),
    deployContract<TypeChain.FeeProvider>("FeeProvider", []),
    deployContract<TypeChain.DummyReserveInterestRateStrategy>("DummyReserveInterestRateStrategy", []),
  ]);
  
  await lendingPoolAddressesProvider.setLendingPoolCoreImpl(lendingPoolCore.address).then(wait);
  await lendingPoolAddressesProvider.setLendingPoolImpl(lendingPool.address).then(wait);
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
  const aTokenAddress: string = initReserveReceipt.events![0].args![1];
  
  const aToken: TypeChain.AToken = await ethers.getContractAt("AToken", aTokenAddress);
 
  return {
    aToken,
    underlyingToken,
    aaveLendingPool: lendingPool,
    aaveLendingPoolCoreAddress: await lendingPoolAddressesProvider.getLendingPoolCore() 
  }
}