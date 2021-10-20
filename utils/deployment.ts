import { Contract, ContractTransaction } from "ethers";
import hre, { ethers } from "hardhat";
import { Libraries } from "hardhat/types";
import * as TypeChain from "../typechain";
import configEnv from "../config";

const { USE_ETHERNAL } = configEnv;

export const waitForReceipt = (res: ContractTransaction) => res.wait();

export const deployContract = async <T extends Contract>(
  contractName: string,
  constructorArgs: any[],
  libraries?: Libraries,
  useEthernal = USE_ETHERNAL
) => {
  const contractFactory = await ethers.getContractFactory(contractName, {
    libraries,
  });
  const contract = await contractFactory.deploy(...constructorArgs);
  await contract.deployed();

  if (useEthernal) {
    await hre.ethernal.push({
      name: contractName,
      address: contract.address,
    });
  }

  console.log(`${contractName} deployed to: `, contract.address);
  return contract as T;
};

export const deployAaveContracts = async () => {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying AAVE using address: ${owner.address}`);

  const coreLibrary = await deployContract<TypeChain.CoreLibrary>(
    "CoreLibrary",
    []
  );
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
    deployContract<TypeChain.LendingPoolCore>("LendingPoolCore", [], {
      CoreLibrary: coreLibrary.address,
    }),
    deployContract<TypeChain.LendingPoolDataProvider>(
      "LendingPoolDataProvider",
      []
    ),
    deployContract<TypeChain.LendingPoolParametersProvider>(
      "LendingPoolParametersProvider",
      []
    ),
    deployContract<TypeChain.LendingPoolConfigurator>(
      "LendingPoolConfigurator",
      []
    ),
    deployContract<TypeChain.LendingPoolAddressesProvider>(
      "LendingPoolAddressesProvider",
      []
    ),
    deployContract<TypeChain.FeeProvider>("FeeProvider", []),
    deployContract<TypeChain.DummyReserveInterestRateStrategy>(
      "DummyReserveInterestRateStrategy",
      []
    ),
  ]);

  await lendingPoolAddressesProvider
    .setLendingPoolCoreImpl(lendingPoolCore.address)
    .then(waitForReceipt);
  await lendingPoolAddressesProvider
    .setLendingPoolImpl(lendingPool.address)
    .then(waitForReceipt);
  await lendingPoolAddressesProvider
    .setLendingPoolDataProviderImpl(lendingPoolDataProvider.address)
    .then(waitForReceipt);
  await lendingPoolAddressesProvider
    .setLendingPoolParametersProviderImpl(lendingPoolParametersProvider.address)
    .then(waitForReceipt);
  await lendingPoolAddressesProvider
    .setLendingPoolConfiguratorImpl(lendingPoolConfigurator.address)
    .then(waitForReceipt);
  await lendingPoolAddressesProvider
    .setFeeProviderImpl(feeProvider.address)
    .then(waitForReceipt);
  await lendingPoolAddressesProvider
    .setLendingPoolManager(owner.address)
    .then(waitForReceipt);

  await lendingPoolCore
    .initialize(lendingPoolAddressesProvider.address)
    .then(waitForReceipt);
  await lendingPoolDataProvider
    .initialize(lendingPoolAddressesProvider.address)
    .then(waitForReceipt);
  await lendingPoolParametersProvider
    .initialize(lendingPoolAddressesProvider.address)
    .then(waitForReceipt);
  await lendingPoolConfigurator
    .initialize(lendingPoolAddressesProvider.address)
    .then(waitForReceipt);
  await feeProvider
    .initialize(lendingPoolAddressesProvider.address)
    .then(waitForReceipt);
  await lendingPool
    .initialize(lendingPoolAddressesProvider.address)
    .then(waitForReceipt);

  const initReserveReceipt = await lendingPoolConfigurator
    .initReserve(
      underlyingToken.address,
      18,
      dummyReserveInterestStrategy.address
    )
    .then(waitForReceipt);
  const aTokenAddress: string = initReserveReceipt.events![0].args![1];

  const aToken: TypeChain.AToken = await ethers.getContractAt(
    "AToken",
    aTokenAddress
  );

  return {
    aToken,
    underlyingToken,
    aaveLendingPool: lendingPool,
    aaveLendingPoolCoreAddress:
      await lendingPoolAddressesProvider.getLendingPoolCore(),
  };
};
