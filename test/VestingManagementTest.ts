import { ethers } from "hardhat";
import chai, { expect } from "chai";
import { FakeContract } from "@defi-wonderland/smock/dist/src/types";
import { smock } from "@defi-wonderland/smock";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expectRevert } from "@openzeppelin/test-helpers";

import { VestingManagement } from "../typechain";
import { deployContract } from "../utils";
import IERC20 from "../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json";
import { increaseTime, latestTime } from "./utils";

chai.use(smock.matchers);

describe("VestingManagement", () => {
  let vestingManagement: VestingManagement;
  let BENEFICIARY: string;
  let START_TIME: number;
  let DURATION: number;
  let vestedToken: FakeContract;
  let signers: SignerWithAddress[];

  const addTerminableVesting = () =>
    vestingManagement.addNewTerminableVesting(
      BENEFICIARY,
      START_TIME,
      DURATION
    );

  const addFixedVesting = () =>
    vestingManagement.addNewFixedVesting(BENEFICIARY, START_TIME, DURATION);

  beforeEach(async () => {
    signers = await ethers.getSigners();
    vestedToken = await smock.fake(IERC20.abi);
    BENEFICIARY = signers[9].address;
    const FIRST_MINED_TIMESTAMP = await latestTime();
    START_TIME = FIRST_MINED_TIMESTAMP + 100;
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
    // should not revert
    await vestingManagement.fixedVestingWallets(BENEFICIARY, 0);
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
    // should not revert
    await vestingManagement.terminableVestingWallets(BENEFICIARY, 0);
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

  it("Should revert terminateVesting if called not by owner", async () => {
    await vestingManagement.addNewTerminableVesting(
      BENEFICIARY,
      START_TIME,
      DURATION
    );
    expectRevert(
      vestingManagement.connect(signers[1]).terminateVesting(BENEFICIARY, 0),
      "Ownable: caller is not the owner"
    );
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
    const nextBlockTimestamp = (await latestTime()) + 120;
    await increaseTime(nextBlockTimestamp);
    vestedToken.balanceOf.returns(TOKEN_BALANCE);
    const tokensVested = await vestingManagement.totalReleasableFromFixed(
      vestedToken.address,
      BENEFICIARY
    );
    const actualNextBlockTimestamp = await latestTime();
    const expectedTokensVested = Math.floor(
      (TOKEN_BALANCE * (actualNextBlockTimestamp - START_TIME)) / 240
    );
    expect(tokensVested).to.equal(expectedTokensVested);
  });

  it("Should count releasable amount in totalReleasableFromTerminable", async () => {
    const TOKEN_BALANCE = 100000;
    await vestingManagement.addNewTerminableVesting(
      BENEFICIARY,
      START_TIME,
      DURATION
    );
    const nextBlockTimestamp = (await latestTime()) + 120;
    await increaseTime(nextBlockTimestamp);
    vestedToken.balanceOf.returns(TOKEN_BALANCE);
    const tokensVested = await vestingManagement.totalReleasableFromTerminable(
      vestedToken.address,
      BENEFICIARY
    );
    const actualNextBlockTimestamp = await latestTime();
    const expectedTokensVested = Math.floor(
      (TOKEN_BALANCE * (actualNextBlockTimestamp - START_TIME)) / 240
    );
    expect(tokensVested).to.equal(expectedTokensVested);
  });

  it("Should not change totalReleasableFromTerminable if fixed vesting added and vested", async () => {
    const TOKEN_BALANCE = 100000;
    await vestingManagement.addNewFixedVesting(
      BENEFICIARY,
      START_TIME,
      DURATION
    );
    const nextBlockTimestamp = (await latestTime()) + 120;
    const expectedTokensVested = 0;
    await increaseTime(nextBlockTimestamp);
    vestedToken.balanceOf.returns(TOKEN_BALANCE);
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
    const nextBlockTimestamp = (await latestTime()) + 120;
    const expectedTokensVested = 0;
    await increaseTime(nextBlockTimestamp);
    vestedToken.balanceOf.returns(TOKEN_BALANCE);
    expect(
      await vestingManagement.totalReleasableFromFixed(
        vestedToken.address,
        BENEFICIARY
      )
    ).to.equal(expectedTokensVested);
  });

  it("Should return total released from terminable", async () => {
    const totalReleased = () =>
      vestingManagement.totalReleasedFromTerminable(
        vestedToken.address,
        BENEFICIARY
      );

    const TOKEN_BALANCE = 100000;
    const expectedTokensVested = 9583;
    vestedToken.balanceOf.returns(TOKEN_BALANCE);
    vestedToken.transfer.returns(true);

    await vestingManagement.addNewTerminableVesting(
      BENEFICIARY,
      START_TIME,
      DURATION
    );
    await latestTime().then((t) => increaseTime(t + 120));

    expect(await totalReleased()).to.equal(0);

    await vestingManagement.releaseTerminable(vestedToken.address, BENEFICIARY);

    expect(await totalReleased()).to.equal(expectedTokensVested);
  });

  it("Should return total released from fixed vestings", async () => {
    const totalReleased = () =>
      vestingManagement.totalReleasedFromFixed(
        vestedToken.address,
        BENEFICIARY
      );

    const TOKEN_BALANCE = 100000;
    const expectedTokensVested = 9583;
    vestedToken.balanceOf.returns(TOKEN_BALANCE);
    vestedToken.transfer.returns(true);

    await vestingManagement.addNewFixedVesting(
      BENEFICIARY,
      START_TIME,
      DURATION
    );
    await latestTime().then((t) => increaseTime(t + 120));

    expect(await totalReleased()).to.equal(0);

    await vestingManagement.releaseFixed(vestedToken.address, BENEFICIARY);

    expect(await totalReleased()).to.equal(expectedTokensVested);
  });

  it("Should return total token balance from terminable vestings", async () => {
    const totalBalance = () =>
      vestingManagement.totalTokenBalanceTerminable(
        vestedToken.address,
        BENEFICIARY
      );

    const TOKEN_BALANCE = 100000;
    vestedToken.balanceOf.returns(TOKEN_BALANCE);
    vestedToken.transfer.returns(true);

    await addTerminableVesting();
    await addTerminableVesting();
    await addTerminableVesting();

    expect(await totalBalance()).to.equal(TOKEN_BALANCE * 3);
  });

  it("Should return total token balance from fixed vestings", async () => {
    const totalBalance = () =>
      vestingManagement.totalTokenBalanceFixed(
        vestedToken.address,
        BENEFICIARY
      );

    const TOKEN_BALANCE = 100000;
    vestedToken.balanceOf.returns(TOKEN_BALANCE);
    vestedToken.transfer.returns(true);

    await addFixedVesting();
    await addFixedVesting();
    await addFixedVesting();

    expect(await totalBalance()).to.equal(TOKEN_BALANCE * 3);
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
    const nextBlockTimestamp = (await latestTime()) + 200;
    await increaseTime(nextBlockTimestamp);
    vestedToken.balanceOf.returns(TOKEN_BALANCE);
    vestedToken.transfer.returns(true);
    await vestingManagement.releaseFixed(vestedToken.address, BENEFICIARY);
    const actualNextBlockTimestamp = await latestTime();
    const expectedTokenTransfer1 = Math.floor(
      (2 * TOKEN_BALANCE * (actualNextBlockTimestamp - START_TIME)) / 400
    );
    const expectedTokenTransfer2 = Math.floor(
      (TOKEN_BALANCE * (actualNextBlockTimestamp - START_TIME)) / 400
    );
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
    const nextBlockTimestamp = (await latestTime()) + 200;
    await increaseTime(nextBlockTimestamp);
    vestedToken.balanceOf.returns(TOKEN_BALANCE);
    vestedToken.transfer.returns(true);
    await vestingManagement.releaseTerminable(vestedToken.address, BENEFICIARY);
    const actualNextBlockTimestamp = await latestTime();
    const expectedTokenTransfer1 = Math.floor(
      (2 * TOKEN_BALANCE * (actualNextBlockTimestamp - START_TIME)) / 400
    );
    const expectedTokenTransfer2 = Math.floor(
      (TOKEN_BALANCE * (actualNextBlockTimestamp - START_TIME)) / 400
    );
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
    const nextBlockTimestamp = (await latestTime()) + 200;
    await increaseTime(nextBlockTimestamp);
    vestedToken.balanceOf.returns(TOKEN_BALANCE);
    vestedToken.transfer.returns(true);
    await vestingManagement.releaseTerminable(vestedToken.address, BENEFICIARY);
    let actualNextBlockTimestamp = await latestTime();
    const expectedTokenTransfer1 = Math.floor(
      (2 * TOKEN_BALANCE * (actualNextBlockTimestamp - START_TIME)) / 400
    );
    expect(vestedToken.transfer).to.have.been.calledWith(
      BENEFICIARY,
      expectedTokenTransfer1
    );
    expect(vestedToken.transfer).to.have.callCount(1);
    await increaseTime(nextBlockTimestamp + 10);
    await vestingManagement.releaseFixed(vestedToken.address, BENEFICIARY);
    actualNextBlockTimestamp = await latestTime();
    const expectedTokenTransfer2 = Math.floor(
      (TOKEN_BALANCE * (actualNextBlockTimestamp - START_TIME)) / 400
    );
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
    const nextBlockTimestamp = (await latestTime()) + 200;
    await increaseTime(nextBlockTimestamp);
    vestedToken.balanceOf.returns(TOKEN_BALANCE);
    vestedToken.transfer.returns(true);
    await vestingManagement.releaseFixed(vestedToken.address, BENEFICIARY);
    let actualNextBlockTimestamp = await latestTime();
    const expectedTokenTransfer1 = Math.floor(
      (TOKEN_BALANCE * (actualNextBlockTimestamp - START_TIME)) / 400
    );
    expect(vestedToken.transfer).to.have.been.calledWith(
      BENEFICIARY,
      expectedTokenTransfer1
    );
    expect(vestedToken.transfer).to.have.callCount(1);
    await increaseTime(nextBlockTimestamp + 10);
    await vestingManagement.releaseTerminable(vestedToken.address, BENEFICIARY);
    actualNextBlockTimestamp = await latestTime();
    const expectedTokenTransfer2 = Math.floor(
      (2 * TOKEN_BALANCE * (actualNextBlockTimestamp - START_TIME)) / 400
    );
    expect(vestedToken.transfer).to.have.been.calledWith(
      BENEFICIARY,
      expectedTokenTransfer2
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

    const nextBlockTimestamp = (await latestTime()) + 200;
    await increaseTime(nextBlockTimestamp);
    await vestingManagement.terminateVesting(BENEFICIARY, 0);
    const terminateVestingTimestamp = await latestTime();
    await increaseTime(nextBlockTimestamp + 100);
    vestedToken.balanceOf.returns(TOKEN_BALANCE);
    vestedToken.transfer.returns(true);
    await vestingManagement.releaseTerminable(vestedToken.address, BENEFICIARY);
    const expectedTokenTransfer1 = TOKEN_BALANCE;
    const expectedTokenTransfer2 = Math.floor(
      (TOKEN_BALANCE * (terminateVestingTimestamp - START_TIME)) / 400
    );
    expect(vestedToken.transfer).to.have.been.calledWith(
      BENEFICIARY,
      expectedTokenTransfer1
    );
    expect(vestedToken.transfer).to.have.been.calledWith(
      BENEFICIARY,
      expectedTokenTransfer2
    );
  });

  describe("withdrawAllFromTerminated", () => {
    let TO: string;
    const withdrawFromTerminated = (signer = signers[0]) =>
      vestingManagement
        .connect(signer)
        .withdrawAllFromTerminated(vestedToken.address, BENEFICIARY, TO);

    beforeEach(async () => {
      TO = signers[6].address;

      await addTerminableVesting();
      await addTerminableVesting();

      await vestingManagement.terminateVesting(BENEFICIARY, 0);

      vestedToken.transfer.returns(true);
    });

    it("Withdraws for each terminated vesting", async () => {
      const TOKEN_BALANCE = 12000;
      vestedToken.balanceOf.returns(TOKEN_BALANCE);

      await withdrawFromTerminated();

      expect(vestedToken.transfer).to.be.calledWith(TO, TOKEN_BALANCE);
    });

    it("Throws when called by non-owner", () => {
      expectRevert(
        withdrawFromTerminated(signers[6]),
        "Ownable: caller is not the owner"
      );
    });
  });
});
