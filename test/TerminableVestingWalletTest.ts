import { ethers } from "hardhat";
import chai, { expect } from "chai";
import { FakeContract } from "@defi-wonderland/smock/dist/src/types";
import { smock } from "@defi-wonderland/smock";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expectRevert } from "@openzeppelin/test-helpers";

import { deployContract } from "../utils";
import { TerminableVestingWallet } from "../typechain";
import IERC20 from "../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json";
import { increaseTime, latestTime } from "./utils";

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
    const LAST_MINED_TIMESTAMP = await latestTime();
    const BENEFICIARY = signers[9].address;
    const START_TIME = LAST_MINED_TIMESTAMP + 100;
    const DURATION = 240;

    terminableVestingWallet = await deployContract<TerminableVestingWallet>(
      "TerminableVestingWallet",
      [BENEFICIARY, START_TIME, DURATION],
      undefined
    );

    expect(
      await terminableVestingWallet["vestedAmount(address,uint64)"](
        vestedToken.address,
        LAST_MINED_TIMESTAMP
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
        START_TIME + DURATION * 0.3
      )
    ).to.equal(3600);
    expect(
      await terminableVestingWallet["vestedAmount(address,uint64)"](
        vestedToken.address,
        START_TIME + DURATION * 0.6
      )
    ).to.equal(7200);
    expect(
      await terminableVestingWallet["vestedAmount(address,uint64)"](
        vestedToken.address,
        START_TIME + DURATION
      )
    ).to.equal(TOKEN_BALANCE);
    expect(
      await terminableVestingWallet["vestedAmount(address,uint64)"](
        vestedToken.address,
        START_TIME + DURATION * 1.3
      )
    ).to.equal(TOKEN_BALANCE);
  });

  it("Should release vested tokens", async () => {
    const TOKEN_BALANCE = 12000;
    vestedToken.transfer.returns(true);
    vestedToken.balanceOf.returns(TOKEN_BALANCE);
    const signers = await ethers.getSigners();
    const LAST_MINED_TIMESTAMP = await latestTime();
    const BENEFICIARY = signers[9].address;
    const START_TIME = LAST_MINED_TIMESTAMP + 100;
    const DURATION = 240;

    terminableVestingWallet = await deployContract<TerminableVestingWallet>(
      "TerminableVestingWallet",
      [BENEFICIARY, START_TIME, DURATION],
      undefined
    );

    const nextBlockTimestamp = (await latestTime()) + 180;
    const expectedTokensVested = 4100;
    await increaseTime(nextBlockTimestamp);

    await terminableVestingWallet["release(address)"](vestedToken.address);

    expect(vestedToken.transfer).to.be.calledWith(
      BENEFICIARY,
      expectedTokensVested
    );
  });

  it("Should indicate termination at start if terminated earlier", async () => {
    const signers = await ethers.getSigners();
    const LAST_MINED_TIMESTAMP = await latestTime();
    const BENEFICIARY = signers[9].address;
    const START_TIME = LAST_MINED_TIMESTAMP + 100;
    const DURATION = 240;

    terminableVestingWallet = await deployContract<TerminableVestingWallet>(
      "TerminableVestingWallet",
      [BENEFICIARY, START_TIME, DURATION],
      undefined
    );

    expect(await terminableVestingWallet.isTerminated()).to.equal(false);
    await terminableVestingWallet.terminateVesting();
    expect(await terminableVestingWallet.isTerminated()).to.equal(true);
    expect(await terminableVestingWallet.terminationTimestamp()).to.equal(
      START_TIME
    );
  });

  it("Should not let to terminate vesting for non-owner", async () => {
    const signers = await ethers.getSigners();
    const LAST_MINED_TIMESTAMP = await latestTime();
    const BENEFICIARY = signers[9].address;
    const START_TIME = LAST_MINED_TIMESTAMP + 100;
    const DURATION = 240;

    terminableVestingWallet = await deployContract<TerminableVestingWallet>(
      "TerminableVestingWallet",
      [BENEFICIARY, START_TIME, DURATION],
      undefined
    );

    await expectRevert(
      terminableVestingWallet.connect(signers[1]).terminateVesting(),
      "Ownable: caller is not the owner"
    );
    expect(await terminableVestingWallet.isTerminated()).to.equal(false);
    expect(await terminableVestingWallet.terminationTimestamp()).to.equal(0);
  });

  describe("withdrawAllFromTerminated", () => {
    let signers: SignerWithAddress[];
    let BENEFICIARY: string;
    let TO: string;
    let START_TIME: number;
    let DURATION: number;
    let TOKEN_BALANCE: number;

    beforeEach(async () => {
      signers = await ethers.getSigners();
      BENEFICIARY = signers[9].address;
      TO = signers[5].address;

      const LAST_MINED_TIMESTAMP = await latestTime();
      START_TIME = LAST_MINED_TIMESTAMP + 100;
      DURATION = 240;

      TOKEN_BALANCE = 12000;
      vestedToken.balanceOf.returns(TOKEN_BALANCE);
      vestedToken.transfer.returns(true);

      terminableVestingWallet = await deployContract<TerminableVestingWallet>(
        "TerminableVestingWallet",
        [BENEFICIARY, START_TIME, DURATION],
        undefined
      );
    });

    it("Should withdraw all tokens from terminated", async () => {
      vestedToken.transfer.whenCalledWith(TO, TOKEN_BALANCE).returns(true);

      await terminableVestingWallet.terminateVesting();
      // should not revert
      await terminableVestingWallet.withdrawAllFromTerminated(
        vestedToken.address,
        TO
      );
    });

    it("Should revert when called by non-owner account", async () => {
      await terminableVestingWallet.terminateVesting();
      await expectRevert(
        terminableVestingWallet
          .connect(signers[6])
          .withdrawAllFromTerminated(vestedToken.address, TO),
        "Ownable: caller is not the owner"
      );
    });

    it("Should revert when transfer fails", async () => {
      await terminableVestingWallet.terminateVesting();
      vestedToken.transfer.whenCalledWith(TO, TOKEN_BALANCE).returns(false);

      await expectRevert(
        terminableVestingWallet.withdrawAllFromTerminated(
          vestedToken.address,
          TO
        ),
        "SafeERC20: ERC20 operation did not succeed"
      );
    });

    it("Should revert when not terminated", async () => {
      await expectRevert(
        terminableVestingWallet.withdrawAllFromTerminated(
          vestedToken.address,
          TO
        ),
        "not terminated"
      );
    });
  });

  it("Should vest zero tokens if terminated before start", async () => {
    const TOKEN_BALANCE = 12500;
    vestedToken.balanceOf.returns(TOKEN_BALANCE);
    const signers = await ethers.getSigners();
    const LAST_MINED_TIMESTAMP = await latestTime();
    const BENEFICIARY = signers[9].address;
    const START_TIME = LAST_MINED_TIMESTAMP + 100;
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
        START_TIME + DURATION
      )
    ).to.equal(0);
  });

  it("Should vest only tokens before termination", async () => {
    const TOKEN_BALANCE = 12000;
    vestedToken.balanceOf.returns(TOKEN_BALANCE);
    const signers = await ethers.getSigners();
    const LAST_MINED_TIMESTAMP = await latestTime();
    const BENEFICIARY = signers[9].address;
    const START_TIME = LAST_MINED_TIMESTAMP + 100;
    const DURATION = 240;

    terminableVestingWallet = await deployContract<TerminableVestingWallet>(
      "TerminableVestingWallet",
      [BENEFICIARY, START_TIME, DURATION],
      undefined
    );

    const nextBlockTimestamp = (await latestTime()) + 180;
    const expectedTokensVested = 4100;
    await increaseTime(nextBlockTimestamp);

    await terminableVestingWallet.terminateVesting();
    expect(await terminableVestingWallet.isTerminated()).to.equal(true);
    expect(
      await terminableVestingWallet["vestedAmount(address,uint64)"](
        vestedToken.address,
        nextBlockTimestamp + 1
      )
    ).to.equal(expectedTokensVested);
    expect(
      await terminableVestingWallet["vestedAmount(address,uint64)"](
        vestedToken.address,
        START_TIME + DURATION
      )
    ).to.equal(expectedTokensVested);
  });
});
