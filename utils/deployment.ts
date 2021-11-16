import { Contract, ContractTransaction } from "ethers";
import hre, { ethers } from "hardhat";
import { Libraries } from "hardhat/types";
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

  // if (useEthernal) {
  //   await hre.ethernal.push({
  //     name: contractName,
  //     address: contract.address,
  //   });
  // }

  console.log(`${contractName} deployed to: `, contract.address);
  return contract as T;
};
