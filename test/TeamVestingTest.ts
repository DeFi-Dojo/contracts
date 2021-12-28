import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContract, waitForReceipt } from "../utils/deployment";
import { DojoToken, TeamVesting } from "../typechain";

// @ts-ignore
import { time } from "@openzeppelin/test-helpers";

describe("TeamVesting", () => {
  let dojoToken: DojoToken;
  let teamVesting: TeamVesting;
  const ONE_WEEK_SECS = 604800;
  const dateNow = Math.floor(Date.now() / 1000);

  beforeEach(async function () {
    let addrs = await ethers.getSigners();
    dojoToken = await deployContract<DojoToken>("DojoToken", [], undefined);
    teamVesting = await deployContract<TeamVesting>(
      "TeamVesting",
      [addrs[1].address],
      undefined
    );
  });

  it("should release vested tokens if not stopped", async () => {
    const CLIFF_WEEKS = 26;
    const VESTED_TOKENS = 200;

    let addrs = await ethers.getSigners();
    let startTime = (await time.latest()).toNumber();

    await dojoToken.approve(teamVesting.address, 2 * VESTED_TOKENS);
    await teamVesting.addVest(
      dojoToken.address,
      VESTED_TOKENS,
      startTime + CLIFF_WEEKS * ONE_WEEK_SECS,
      3
    );
    await dojoToken.transfer(teamVesting.address, VESTED_TOKENS);
    await time.increaseTo(startTime + ONE_WEEK_SECS * (CLIFF_WEEKS + 4));
    await teamVesting["release(address)"](dojoToken.address);
    let released = await teamVesting["released(address)"](dojoToken.address);
    expect(released).to.equal(Math.floor(VESTED_TOKENS));
    let balance = await dojoToken.balanceOf(addrs[1].address);
    expect(balance).to.equal(VESTED_TOKENS);
  });

  it("should release vested tokens after stop", async () => {
    const CLIFF_WEEKS = 26;
    const VESTED_TOKENS = 200;

    let addrs = await ethers.getSigners();
    let startTime = (await time.latest()).toNumber();

    await dojoToken.approve(teamVesting.address, 2 * VESTED_TOKENS);
    await teamVesting.addVest(
      dojoToken.address,
      VESTED_TOKENS,
      startTime + CLIFF_WEEKS * ONE_WEEK_SECS,
      3
    );
    await dojoToken.transfer(teamVesting.address, VESTED_TOKENS);
    await time.increaseTo(startTime + ONE_WEEK_SECS * (CLIFF_WEEKS + 2));
    await teamVesting.stopVesting();
    await teamVesting["release(address)"](dojoToken.address);
    let released = await teamVesting["released(address)"](dojoToken.address);
    expect(released).to.equal(Math.floor(VESTED_TOKENS / 3));
    let balance = await dojoToken.balanceOf(addrs[1].address);
    expect(balance).to.equal(Math.floor(VESTED_TOKENS / 3));
  });

  it("should not release all vested tokens if stopped during vesting", async () => {
    const CLIFF_WEEKS = 26;
    const VESTED_TOKENS = 200;

    let addrs = await ethers.getSigners();
    let startTime = (await time.latest()).toNumber();

    await dojoToken.approve(teamVesting.address, 2 * VESTED_TOKENS);
    await teamVesting.addVest(
      dojoToken.address,
      VESTED_TOKENS,
      startTime + CLIFF_WEEKS * ONE_WEEK_SECS,
      3
    );
    await dojoToken.transfer(teamVesting.address, VESTED_TOKENS);
    await time.increaseTo(startTime + ONE_WEEK_SECS * (CLIFF_WEEKS + 2));
    await teamVesting.stopVesting();
    await time.increaseTo(startTime + ONE_WEEK_SECS * (CLIFF_WEEKS + 4));
    await teamVesting["release(address)"](dojoToken.address);
    let released = await teamVesting["released(address)"](dojoToken.address);
    expect(released).to.equal(Math.floor(VESTED_TOKENS / 3));
    let balance = await dojoToken.balanceOf(addrs[1].address);
    expect(balance).to.equal(Math.floor(VESTED_TOKENS / 3));
  });

  it("should be able to stop if partially released", async () => {
    const CLIFF_WEEKS = 26;
    const VESTED_TOKENS = 200;

    let addrs = await ethers.getSigners();
    let startTime = (await time.latest()).toNumber();

    await dojoToken.approve(teamVesting.address, 2 * VESTED_TOKENS);
    await teamVesting.addVest(
      dojoToken.address,
      VESTED_TOKENS,
      startTime + CLIFF_WEEKS * ONE_WEEK_SECS,
      3
    );
    await dojoToken.transfer(teamVesting.address, VESTED_TOKENS);
    await time.increaseTo(startTime + ONE_WEEK_SECS * (CLIFF_WEEKS + 2));
    await teamVesting["release(address)"](dojoToken.address);
    await teamVesting.stopVesting();
    await time.increaseTo(startTime + ONE_WEEK_SECS * (CLIFF_WEEKS + 4));
    await teamVesting["release(address)"](dojoToken.address);
    let released = await teamVesting["released(address)"](dojoToken.address);
    expect(released).to.equal(Math.floor(VESTED_TOKENS / 3));
    let balance = await dojoToken.balanceOf(addrs[1].address);
    expect(balance).to.equal(Math.floor(VESTED_TOKENS / 3));
  });
});
