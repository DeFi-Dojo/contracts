import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { createDeployContract, waitForReceipt } from ".";
import {
  DojoToken,
  DojoToken__factory,
  VestingManagement__factory,
} from "../../typechain";
import configEnv from "../../config/config";

const { DJO_TOKEN_ADDRESS, TOKEN_VESTING_ADDRESS } = configEnv;

export const deployToken = async () => {
  const deploy = createDeployContract<DojoToken__factory>("DojoToken");
  const signers = await ethers.getSigners();
  await deploy(signers[0].address).then((v) => v as DojoToken);
};

export const createVestingSchedule = async (
  beneficiary: string,
  start: number,
  duration: number,
  amount: BigNumber | number
) => {
  const DojoTokenFactory = await ethers.getContractFactory<DojoToken__factory>(
    "DojoToken"
  );
  const VestingManagementFactory =
    await ethers.getContractFactory<VestingManagement__factory>(
      "VestingManagement"
    );
  const dojoToken = await DojoTokenFactory.attach(DJO_TOKEN_ADDRESS);
  const tokenVesting = await VestingManagementFactory.attach(
    TOKEN_VESTING_ADDRESS
  );
  const amountWithdrawableFromFixedVestings =
    await tokenVesting.totalReleasableFromFixed(DJO_TOKEN_ADDRESS, beneficiary);
  const amountWithdrawableFromTerminableVestings =
    await tokenVesting.totalReleasableFromTerminable(
      DJO_TOKEN_ADDRESS,
      beneficiary
    );
  console.log(
    `amount withdrawable from fixed vestings: ${amountWithdrawableFromFixedVestings}, from terminable vestings: ${amountWithdrawableFromTerminableVestings}`
  );
  console.log(`Creating terminable vesting schedule with ${amount} tokens`);
  await tokenVesting
    .addNewTerminableVesting(beneficiary, start, duration)
    .then(waitForReceipt);

  const vestingsCount = await tokenVesting.getTerminableVestingsCount(
    beneficiary
  );
  const vestingAddress = await tokenVesting.terminableVestingWallets(
    beneficiary,
    +vestingsCount - 1
  );
  console.log(
    `Created new terminable vesting at address ${vestingAddress}, terminable vestings count: ${vestingsCount}`
  );
  console.log(`Sending ${amount} tokens to last vesting at ${vestingAddress}`);
  await dojoToken.transfer(vestingAddress, amount).then(waitForReceipt);
};

export const releaseVesting = async (beneficiary: string) => {
  const DojoTokenFactory = await ethers.getContractFactory<DojoToken__factory>(
    "DojoToken"
  );
  const VestingManagementFactory =
    await ethers.getContractFactory<VestingManagement__factory>(
      "VestingManagement"
    );
  const dojoToken = await DojoTokenFactory.attach(DJO_TOKEN_ADDRESS);
  const tokenVesting = await VestingManagementFactory.attach(
    TOKEN_VESTING_ADDRESS
  );

  const releasableAmount = await tokenVesting.totalReleasableFromTerminable(
    dojoToken.address,
    beneficiary
  );
  console.log(
    `Releasing vesting for ${beneficiary}, balance before: ${await dojoToken.balanceOf(
      beneficiary
    )}, amount to claim: ${releasableAmount}`
  );
  await tokenVesting
    .releaseTerminable(dojoToken.address, beneficiary)
    .then(waitForReceipt);
  console.log(
    `Vested tokens released, balance after: ${await dojoToken.balanceOf(
      beneficiary
    )}`
  );
};
