import { ethers } from "hardhat";
import { expect } from "chai";
import { FakeContract } from "@defi-wonderland/smock/dist/src/types";
import { smock } from "@defi-wonderland/smock";
import { VestingManagement } from "../typechain";
import { deployContract } from "../utils";
import IERC20 from "../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json";

const { time } = require("@openzeppelin/test-helpers");

describe("VestingManagement", () => {
  let vestingManagement: VestingManagement;
  let BENEFICIARY: string;
  let START_TIME: number;
  let DURATION: number;
  let vestedToken: FakeContract;

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    vestedToken = await smock.fake(IERC20.abi);
    BENEFICIARY = signers[9].address;
    const LAST_MINED_TIMESTAMP: number = await time.latest();
    START_TIME = +LAST_MINED_TIMESTAMP + 100;
    DURATION = 240;
    vestingManagement = await deployContract<VestingManagement>(
      "VestingManagement",
      [],
      undefined
    );
  });

  it("Should add new fixed vesting on addNewFixedVesting", async () => {
    await vestingManagement.addNewFixedVesting(
      BENEFICIARY,
      START_TIME,
      DURATION
    );
    expect(await vestingManagement.getVestingsCount(BENEFICIARY)).to.equal(1);
    await vestingManagement.vestingWallets(BENEFICIARY, 0); // should not revert
  });

  it("Should add new terminable vesting on addNewTerminableVesting", async () => {
    await vestingManagement.addNewTerminableVesting(
      BENEFICIARY,
      START_TIME,
      DURATION
    );
    expect(
      await vestingManagement.getTerminableVestingsCount(BENEFICIARY)
    ).to.equal(1);
    await vestingManagement.terminableVestingWallets(BENEFICIARY, 0); // should not revert
  });

  it("Should terminate vesting after terminateVesting called", async () => {
    await vestingManagement.addNewTerminableVesting(
      BENEFICIARY,
      START_TIME,
      DURATION
    );
    await vestingManagement.terminateVesting(BENEFICIARY, 0);
    expect(
      await vestingManagement.terminableVestingWallets(BENEFICIARY, 0)
    ).to.equal("0x0000000000000000000000000000000000000000");
  });

  it("Should terminate vesting without latter after terminateVesting called", async () => {
    await vestingManagement.addNewTerminableVesting(
      BENEFICIARY,
      START_TIME,
      DURATION
    );
    await vestingManagement.addNewTerminableVesting(
      BENEFICIARY,
      START_TIME,
      DURATION
    );
    const addrOfVestingToTerminate =
      await vestingManagement.terminableVestingWallets(BENEFICIARY, 0);
    const contractFactory = await ethers.getContractFactory(
      "TerminableVestingWallet"
    );
    const vestingToTerminate = contractFactory.attach(addrOfVestingToTerminate);
    await vestingManagement.terminateVesting(BENEFICIARY, 0);
    expect(
      await vestingManagement.terminableVestingWallets(BENEFICIARY, 0)
    ).to.equal("0x0000000000000000000000000000000000000000");
    expect(await vestingToTerminate.isTerminated()).to.equal(true);
    expect(
      await vestingManagement.terminableVestingWallets(BENEFICIARY, 1)
    ).to.not.equal("0x0000000000000000000000000000000000000000");
    const addrOfVestingNotTerminated =
      await vestingManagement.terminableVestingWallets(BENEFICIARY, 1);
    const vestingNotTerminated = contractFactory.attach(
      addrOfVestingNotTerminated
    );
    expect(await vestingNotTerminated.isTerminated()).to.equal(false);
  });

  it("Should count releasable amount in totalReleasableFromFixed", async () => {
    const TOKEN_BALANCE = 100000;
    await vestingManagement.addNewFixedVesting(
      BENEFICIARY,
      START_TIME,
      DURATION
    );
    const nextBlockTimestamp = +(await time.latest()) + +120;
    const expectedTokensVested = Math.floor((22 * TOKEN_BALANCE) / 240);
    await time.increaseTo(nextBlockTimestamp);
    await vestedToken.balanceOf.returns(TOKEN_BALANCE);
    expect(
      await vestingManagement.totalReleasableFromFixed(
        vestedToken.address,
        BENEFICIARY
      )
    ).to.equal(expectedTokensVested);
  });

  it("Should count releasable amount in totalReleasableFromTerminable", async () => {
    const TOKEN_BALANCE = 100000;
    await vestingManagement.addNewTerminableVesting(
      BENEFICIARY,
      START_TIME,
      DURATION
    );
    const nextBlockTimestamp = +(await time.latest()) + +120;
    const expectedTokensVested = Math.floor((22 * TOKEN_BALANCE) / 240);
    await time.increaseTo(nextBlockTimestamp);
    await vestedToken.balanceOf.returns(TOKEN_BALANCE);
    expect(
      await vestingManagement.totalReleasableFromTerminable(
        vestedToken.address,
        BENEFICIARY
      )
    ).to.equal(expectedTokensVested);
  });

  it("Should not change totalReleasableFromTerminable if fixed vesting added and vested", async () => {
    const TOKEN_BALANCE = 100000;
    await vestingManagement.addNewFixedVesting(
      BENEFICIARY,
      START_TIME,
      DURATION
    );
    const nextBlockTimestamp = +(await time.latest()) + +120;
    const expectedTokensVested = 0;
    await time.increaseTo(nextBlockTimestamp);
    await vestedToken.balanceOf.returns(TOKEN_BALANCE);
    expect(
      await vestingManagement.totalReleasableFromTerminable(
        vestedToken.address,
        BENEFICIARY
      )
    ).to.equal(expectedTokensVested);
  });

  it("Should not change totalReleasableFromFixed if terminable vesting added and vested", async () => {
    const TOKEN_BALANCE = 100000;
    await vestingManagement.addNewTerminableVesting(
      BENEFICIARY,
      START_TIME,
      DURATION
    );
    const nextBlockTimestamp = +(await time.latest()) + +120;
    const expectedTokensVested = 0;
    await time.increaseTo(nextBlockTimestamp);
    await vestedToken.balanceOf.returns(TOKEN_BALANCE);
    expect(
      await vestingManagement.totalReleasableFromFixed(
        vestedToken.address,
        BENEFICIARY
      )
    ).to.equal(expectedTokensVested);
  });
});
