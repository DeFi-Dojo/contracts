import { FactoryOptions } from "@nomiclabs/hardhat-ethers/types";
import { Contract, ContractFactory, ContractTransaction, Signer } from "ethers";
import { ethers } from "hardhat";
import { Libraries } from "hardhat/types";

export const waitForReceipt = (res: ContractTransaction) => res.wait();

export const deployContract = async <T extends Contract>(
  contractName: string,
  constructorArgs: any[],
  libraries?: Libraries
) => {
  const contractFactory = await ethers.getContractFactory(contractName, {
    libraries,
  });
  const contract = await contractFactory.deploy(...constructorArgs);
  await contract.deployed();

  // console.log(`${contractName} deployed to: `, contract.address);
  return contract as T;
};

export const getContractFactory = async <T extends ContractFactory>(
  contractName: string,
  signerOptions?: string | Signer | FactoryOptions
) => {
  const [owner] = await ethers.getSigners();
  console.log(`Using address: ${owner.address}`);

  const contractFactory = await ethers.getContractFactory<T>(
    contractName,
    signerOptions
  );

  return contractFactory as T;
};

export const createDeployContract =
  <T extends ContractFactory>(
    contractName: string,
    signerOptions?: string | Signer | FactoryOptions
  ) =>
  async (...constructorArgs: Parameters<T["deploy"]>) => {
    console.log(`Deploying ${contractName}`);

    const contractFactory = await getContractFactory<T>(
      contractName,
      signerOptions
    );
    const contract = await contractFactory.deploy(...constructorArgs);
    await contract.deployed();

    console.log(`${contractName} deployed to: `, contract.address);

    return contract;
  };
