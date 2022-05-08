import { ethers } from "hardhat";
import { createDeployContract, waitForReceipt } from ".";
import {
  DojoToken,
  DojoToken__factory,
  TokenVesting,
  TokenVesting__factory,
} from "../../typechain";
import configEnv from "../../config/config";

const { DJO_TOKEN_ADDRESS, DJO_TOKEN_OWNER, TOKEN_VESTING_ADDRESS } = configEnv;

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

export const createVestingSchedule = async (
  beneficiary: string,
  start: number,
  cliff: number,
  duration: number,
  slicePeriodSeconds: number,
  amount: number
) => {
  const DojoTokenFactory = await ethers.getContractFactory<DojoToken__factory>(
    "DojoToken"
  );
  const TokenVestingFactory =
    await ethers.getContractFactory<TokenVesting__factory>("TokenVesting");
  const dojoToken = await DojoTokenFactory.attach(DJO_TOKEN_ADDRESS);
  const tokenVesting = await TokenVestingFactory.attach(TOKEN_VESTING_ADDRESS);
  console.log(`Sending ${amount} tokens to ${tokenVesting.address}`);
  await dojoToken.transfer(tokenVesting.address, amount).then(waitForReceipt);
  const withdrawableAmount = await tokenVesting.getWithdrawableAmount();
  console.log(
    `withdrawableAmount: ${withdrawableAmount}, creating vesting schedule with ${amount} tokens`
  );
  await tokenVesting
    .createVestingSchedule(
      beneficiary,
      start,
      cliff,
      duration,
      slicePeriodSeconds,
      amount
    )
    .then(waitForReceipt);
};

export const releaseVesting = async (beneficiary: string) => {
  const DojoTokenFactory = await ethers.getContractFactory<DojoToken__factory>(
    "DojoToken"
  );
  const TokenVestingFactory =
    await ethers.getContractFactory<TokenVesting__factory>("TokenVesting");
  const dojoToken = await DojoTokenFactory.attach(DJO_TOKEN_ADDRESS);
  const tokenVesting = await TokenVestingFactory.attach(TOKEN_VESTING_ADDRESS);
  const releasableAmount = await tokenVesting.computeReleasableAmount(
    beneficiary
  );
  console.log(
    `Releasing vesting for ${beneficiary}, balance before: ${await dojoToken.balanceOf(
      beneficiary
    )}, amount to claim: ${releasableAmount}`
  );
  await tokenVesting
    .release(beneficiary, releasableAmount)
    .then(waitForReceipt);
  console.log(
    `Vested tokens released, balance after: ${await dojoToken.balanceOf(
      beneficiary
    )}`
  );
};
