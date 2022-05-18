import { ethers } from "hardhat";
import chai, { expect } from "chai";
import { FakeContract } from "@defi-wonderland/smock/dist/src/types";
import { smock } from "@defi-wonderland/smock";
import { VestingManagement } from "../typechain";
import { deployContract } from "../utils";
import IERC20 from "../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json";

const { time } = require("@openzeppelin/test-helpers");

chai.use(smock.matchers);

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
    expect(await vestingManagement.getFixedVestingsCount(BENEFICIARY)).to.equal(
      1
    );
    await vestingManagement.fixedVestingWallets(BENEFICIARY, 0); // should not revert
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
    const addrOfVestingToTerminate =
      await vestingManagement.terminableVestingWallets(BENEFICIARY, 0);
    const contractFactory = await ethers.getContractFactory(
      "TerminableVestingWallet"
    );
    const vestingToTerminate = contractFactory.attach(addrOfVestingToTerminate);
    await vestingManagement.terminateVesting(BENEFICIARY, 0);

    expect(await vestingToTerminate.isTerminated()).to.equal(true);
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
    const addrOfVestingToTerminate1 =
      await vestingManagement.terminableVestingWallets(BENEFICIARY, 0);
    const addrOfVestingToTerminate2 =
      await vestingManagement.terminableVestingWallets(BENEFICIARY, 1);
    const contractFactory = await ethers.getContractFactory(
      "TerminableVestingWallet"
    );
    const vestingToTerminate1 = contractFactory.attach(
      addrOfVestingToTerminate1
    );
    const vestingToTerminate2 = contractFactory.attach(
      addrOfVestingToTerminate2
    );
    await vestingManagement.terminateVesting(BENEFICIARY, 0);
    expect(await vestingToTerminate1.isTerminated()).to.equal(true);
    expect(await vestingToTerminate2.isTerminated()).to.equal(false);
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

  it("Should release tokens from two fixed contracts on releaseFixed", async () => {
    const TOKEN_BALANCE = 100000;
    const DURATION1 = 200;
    const DURATION2 = 400;
    await vestingManagement.addNewFixedVesting(
      BENEFICIARY,
      START_TIME,
      DURATION1
    );
    await vestingManagement.addNewFixedVesting(
      BENEFICIARY,
      START_TIME,
      DURATION2
    );
    const nextBlockTimestamp = +(await time.latest()) + +200;
    const expectedTokenTransfer1 = 2 * TOKEN_BALANCE * (104 / 400);
    const expectedTokenTransfer2 = TOKEN_BALANCE * (104 / 400);
    await time.increaseTo(nextBlockTimestamp);
    await vestedToken.balanceOf.returns(TOKEN_BALANCE);
    await vestedToken.transfer.returns(true);
    await vestingManagement.releaseFixed(vestedToken.address, BENEFICIARY);
    expect(vestedToken.transfer).to.have.been.calledWith(
      BENEFICIARY,
      expectedTokenTransfer1
    );
    expect(vestedToken.transfer).to.have.been.calledWith(
      BENEFICIARY,
      expectedTokenTransfer2
    );
  });

  it("Should release tokens from two fixed contracts on releaseTerminable", async () => {
    const TOKEN_BALANCE = 100000;
    const DURATION1 = 200;
    const DURATION2 = 400;
    await vestingManagement.addNewTerminableVesting(
      BENEFICIARY,
      START_TIME,
      DURATION1
    );
    await vestingManagement.addNewTerminableVesting(
      BENEFICIARY,
      START_TIME,
      DURATION2
    );
    const nextBlockTimestamp = +(await time.latest()) + +200;
    const expectedTokenTransfer1 = 2 * TOKEN_BALANCE * (104 / 400);
    const expectedTokenTransfer2 = TOKEN_BALANCE * (104 / 400);
    await time.increaseTo(nextBlockTimestamp);
    await vestedToken.balanceOf.returns(TOKEN_BALANCE);
    await vestedToken.transfer.returns(true);
    await vestingManagement.releaseTerminable(vestedToken.address, BENEFICIARY);
    expect(vestedToken.transfer).to.have.been.calledWith(
      BENEFICIARY,
      expectedTokenTransfer1
    );
    expect(vestedToken.transfer).to.have.been.calledWith(
      BENEFICIARY,
      expectedTokenTransfer2
    );
  });

  it("Should not release fixed vesting before releaseFixed if releaseTerminable called", async () => {
    const TOKEN_BALANCE = 100000;
    const DURATION1 = 200;
    const DURATION2 = 400;
    await vestingManagement.addNewTerminableVesting(
      BENEFICIARY,
      START_TIME,
      DURATION1
    );
    await vestingManagement.addNewFixedVesting(
      BENEFICIARY,
      START_TIME,
      DURATION2
    );
    const nextBlockTimestamp = +(await time.latest()) + +200;
    const expectedTokenTransfer1 = Math.ceil(2 * TOKEN_BALANCE * (104 / 400));
    const expectedTokenTransfer2 = Math.ceil(TOKEN_BALANCE * (114 / 400));
    await time.increaseTo(nextBlockTimestamp);
    await vestedToken.balanceOf.returns(TOKEN_BALANCE);
    await vestedToken.transfer.returns(true);
    await vestingManagement.releaseTerminable(vestedToken.address, BENEFICIARY);
    await time.increaseTo(nextBlockTimestamp + 10);
    expect(vestedToken.transfer).to.have.been.calledWith(
      BENEFICIARY,
      expectedTokenTransfer1
    );
    expect(vestedToken.transfer).to.have.callCount(1);
    await vestingManagement.releaseFixed(vestedToken.address, BENEFICIARY);
    expect(vestedToken.transfer).to.have.been.calledWith(
      BENEFICIARY,
      expectedTokenTransfer2
    );
    expect(vestedToken.transfer).to.have.callCount(2);
  });

  it("Should not release terminable vesting before releaseTerminable if releaseFixed called", async () => {
    const TOKEN_BALANCE = 100000;
    const DURATION1 = 200;
    const DURATION2 = 400;
    await vestingManagement.addNewTerminableVesting(
      BENEFICIARY,
      START_TIME,
      DURATION1
    );
    await vestingManagement.addNewFixedVesting(
      BENEFICIARY,
      START_TIME,
      DURATION2
    );
    const nextBlockTimestamp = +(await time.latest()) + +200;
    const expectedTokenTransfer1 = Math.ceil(2 * TOKEN_BALANCE * (114 / 400));
    const expectedTokenTransfer2 = Math.ceil(TOKEN_BALANCE * (104 / 400));
    await time.increaseTo(nextBlockTimestamp);
    await vestedToken.balanceOf.returns(TOKEN_BALANCE);
    await vestedToken.transfer.returns(true);
    await vestingManagement.releaseFixed(vestedToken.address, BENEFICIARY);
    expect(vestedToken.transfer).to.have.been.calledWith(
      BENEFICIARY,
      expectedTokenTransfer2
    );
    expect(vestedToken.transfer).to.have.callCount(1);
    await time.increaseTo(nextBlockTimestamp + 10);
    await vestingManagement.releaseTerminable(vestedToken.address, BENEFICIARY);
    expect(vestedToken.transfer).to.have.been.calledWith(
      BENEFICIARY,
      expectedTokenTransfer1
    );
    expect(vestedToken.transfer).to.have.callCount(2);
  });

  it("Should not count terminated vesting", async () => {
    const TOKEN_BALANCE = 100000;
    const DURATION1 = 400;
    const DURATION2 = 200;
    await vestingManagement.addNewTerminableVesting(
      BENEFICIARY,
      START_TIME,
      DURATION1
    );
    await vestingManagement.addNewTerminableVesting(
      BENEFICIARY,
      START_TIME,
      DURATION2
    );

    const nextBlockTimestamp = +(await time.latest()) + +200;
    const expectedTokenTransfer1 = TOKEN_BALANCE * (104 / 400);
    const expectedTokenTransfer2 = TOKEN_BALANCE;
    await time.increaseTo(nextBlockTimestamp);
    await vestingManagement.terminateVesting(BENEFICIARY, 0);
    await time.increaseTo(nextBlockTimestamp + +100);
    await vestedToken.balanceOf.returns(TOKEN_BALANCE);
    await vestedToken.transfer.returns(true);
    await vestingManagement.releaseTerminable(vestedToken.address, BENEFICIARY);
    expect(vestedToken.transfer).to.have.been.calledWith(
      BENEFICIARY,
      expectedTokenTransfer2
    );
    expect(vestedToken.transfer).to.have.been.calledWith(
      BENEFICIARY,
      expectedTokenTransfer1
    );
  });
});
