import { ethers } from "hardhat";
import { createDeployContract } from ".";
import {
  DojoToken,
  DojoToken__factory,
  TokenVesting,
  TokenVesting__factory,
} from "../../typechain";
import configEnv from "../../config/config";

const { DJO_TOKEN_ADDRESS, DJO_TOKEN_OWNER } = configEnv;

export const deployToken = async () => {
  const deploy = createDeployContract<DojoToken__factory>("DojoToken");
  const signers = await ethers.getSigners();
  await deploy(signers[0].address).then((v) => v as DojoToken);
};

export const deployVesting = async () => {
  const deploy = createDeployContract<TokenVesting__factory>("TokenVesting");
  await deploy(DJO_TOKEN_ADDRESS, DJO_TOKEN_OWNER).then(
    (v) => v as TokenVesting
  );
};
