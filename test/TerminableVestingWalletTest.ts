import { ethers } from "hardhat";
import chai, { expect } from "chai";
import { FakeContract } from "@defi-wonderland/smock/dist/src/types";
import { smock } from "@defi-wonderland/smock";
import { deployContract } from "../utils";
import { TerminableVestingWallet } from "../typechain";
import IERC20 from "../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json";

const { time } = require("@openzeppelin/test-helpers");

chai.use(smock.matchers);

describe("TerminableVestingWallet", () => {
  let terminableVestingWallet: TerminableVestingWallet;
  let vestedToken: FakeContract;

  beforeEach(async () => {
    vestedToken = await smock.fake(IERC20.abi);
  });

  it("Should vest in linear order", async () => {
    const TOKEN_BALANCE = 12000;
    vestedToken.balanceOf.returns(TOKEN_BALANCE);
    const signers = await ethers.getSigners();
    const LAST_MINED_TIMESTAMP: number = await time.latest();
    const BENEFICIARY = signers[9].address;
    const START_TIME: number = +LAST_MINED_TIMESTAMP + 100;
    const DURATION = 240;

    terminableVestingWallet = await deployContract<TerminableVestingWallet>(
      "TerminableVestingWallet",
      [BENEFICIARY, START_TIME, DURATION],
      undefined
    );

    expect(
      await terminableVestingWallet["vestedAmount(address,uint64)"](
        vestedToken.address,
        +LAST_MINED_TIMESTAMP
      )
    ).to.equal(0);
    expect(
      await terminableVestingWallet["vestedAmount(address,uint64)"](
        vestedToken.address,
        START_TIME
      )
    ).to.equal(0);
    expect(
      await terminableVestingWallet["vestedAmount(address,uint64)"](
        vestedToken.address,
        +START_TIME + +DURATION * 0.3
      )
    ).to.equal(3600);
    expect(
      await terminableVestingWallet["vestedAmount(address,uint64)"](
        vestedToken.address,
        +START_TIME + +DURATION * 0.6
      )
    ).to.equal(7200);
    expect(
      await terminableVestingWallet["vestedAmount(address,uint64)"](
        vestedToken.address,
        +START_TIME + +DURATION
      )
    ).to.equal(TOKEN_BALANCE);
    expect(
      await terminableVestingWallet["vestedAmount(address,uint64)"](
        vestedToken.address,
        +START_TIME + +DURATION * 1.3
      )
    ).to.equal(TOKEN_BALANCE);
  });

  it("Should release vested tokens", async () => {
    const TOKEN_BALANCE = 12000;
    await vestedToken.transfer.returns(true);
    await vestedToken.balanceOf.returns(TOKEN_BALANCE);
    const signers = await ethers.getSigners();
    const LAST_MINED_TIMESTAMP: number = await time.latest();
    const BENEFICIARY = signers[9].address;
    const START_TIME: number = +LAST_MINED_TIMESTAMP + 100;
    const DURATION = 240;

    terminableVestingWallet = await deployContract<TerminableVestingWallet>(
      "TerminableVestingWallet",
      [BENEFICIARY, START_TIME, DURATION],
      undefined
    );

    const nextBlockTimestamp = +(await time.latest()) + +180;
    const expectedTokensVested = 4100;
    await time.increaseTo(nextBlockTimestamp);

    await terminableVestingWallet["release(address)"](vestedToken.address);

    expect(vestedToken.transfer).to.be.calledWith(
      BENEFICIARY,
      expectedTokensVested
    );
  });

  it("Should indicate termination at start if terminated earlier", async () => {
    const signers = await ethers.getSigners();
    const LAST_MINED_TIMESTAMP: number = await time.latest();
    const BENEFICIARY = signers[9].address;
    const START_TIME: number = +LAST_MINED_TIMESTAMP + 100;
    const DURATION = 240;

    terminableVestingWallet = await deployContract<TerminableVestingWallet>(
      "TerminableVestingWallet",
      [BENEFICIARY, START_TIME, DURATION],
      undefined
    );

    await terminableVestingWallet.terminateVesting();
    expect(await terminableVestingWallet.isTerminated()).to.equal(true);
    expect(await terminableVestingWallet.terminationTimestamp()).to.equal(
      START_TIME
    );
  });

  it("Should vest zero tokens if terminated before start", async () => {
    const TOKEN_BALANCE = 12500;
    vestedToken.balanceOf.returns(TOKEN_BALANCE);
    const signers = await ethers.getSigners();
    const LAST_MINED_TIMESTAMP: number = await time.latest();
    const BENEFICIARY = signers[9].address;
    const START_TIME: number = +LAST_MINED_TIMESTAMP + 100;
    const DURATION = 240;

    terminableVestingWallet = await deployContract<TerminableVestingWallet>(
      "TerminableVestingWallet",
      [BENEFICIARY, START_TIME, DURATION],
      undefined
    );

    await terminableVestingWallet.terminateVesting();
    expect(
      await terminableVestingWallet["vestedAmount(address,uint64)"](
        vestedToken.address,
        +START_TIME + +DURATION
      )
    ).to.equal(0);
  });

  it("Should vest only tokens before termination", async () => {
    const TOKEN_BALANCE = 12000;
    vestedToken.balanceOf.returns(TOKEN_BALANCE);
    const signers = await ethers.getSigners();
    const LAST_MINED_TIMESTAMP: number = await time.latest();
    const BENEFICIARY = signers[9].address;
    const START_TIME: number = +LAST_MINED_TIMESTAMP + 100;
    const DURATION = 240;

    terminableVestingWallet = await deployContract<TerminableVestingWallet>(
      "TerminableVestingWallet",
      [BENEFICIARY, START_TIME, DURATION],
      undefined
    );

    const nextBlockTimestamp = +(await time.latest()) + +180;
    const expectedTokensVested = 4100;
    await time.increaseTo(nextBlockTimestamp);

    await terminableVestingWallet.terminateVesting();
    expect(
      await terminableVestingWallet["vestedAmount(address,uint64)"](
        vestedToken.address,
        nextBlockTimestamp + 1
      )
    ).to.equal(expectedTokensVested);
    expect(
      await terminableVestingWallet["vestedAmount(address,uint64)"](
        vestedToken.address,
        +START_TIME + +DURATION
      )
    ).to.equal(expectedTokensVested);
  });
});
