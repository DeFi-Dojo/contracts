import { HardhatRuntimeEnvironment } from "hardhat/types";

type Args = {
  start: number;
  end: number;
  isTerminable: boolean;
  beneficiary: string;
  vestingManagement: string;
};

type Deps = Pick<HardhatRuntimeEnvironment, "ethers">;

export const createVesting = async (
  { start, end, isTerminable, beneficiary, vestingManagement }: Args,
  { ethers }: Deps
) => {
  const duration = end - start;
  const VestingManagementFactory = await ethers.getContractFactory(
    "VestingManagement"
  );
  const tokenVesting = VestingManagementFactory.attach(vestingManagement);

  let vestingAddress: string;

  if (isTerminable) {
    console.log("Creating terminable vesting schedule");
    const tx = await tokenVesting.addNewTerminableVesting(
      beneficiary,
      start,
      duration
    );
    await tx.wait();

    const vestingsCount = await tokenVesting.getTerminableVestingsCount(
      beneficiary
    );
    vestingAddress = await tokenVesting.terminableVestingWallets(
      beneficiary,
      +vestingsCount - 1
    );
    console.log(
      `Created new terminable vesting at address ${vestingAddress}, terminable vestings count: ${vestingsCount}`
    );
  } else {
    console.log("Creating fixed vesting schedule");
    const tx = await tokenVesting.addNewFixedVesting(
      beneficiary,
      start,
      duration
    );
    await tx.wait();

    const vestingsCount = await tokenVesting.getFixedVestingsCount(beneficiary);
    vestingAddress = await tokenVesting.fixedVestingWallets(
      beneficiary,
      +vestingsCount - 1
    );
    console.log(
      `Created new fixed vesting at address ${vestingAddress}, terminable vestings count: ${vestingsCount}`
    );
  }
};
