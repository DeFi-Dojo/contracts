import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContract, waitForReceipt } from "../utils/deployment";
import { DojoToken, Vesting } from "../typechain";

// @ts-ignore
import { time } from '@openzeppelin/test-helpers';

describe("Vesting", () => {
    let dojoToken: DojoToken;
    let vesting: Vesting;
    const ONE_WEEK_SECS = 604800;
    const dateNow = Math.floor(Date.now()/1000);

    beforeEach(async function () {
        let addrs = await ethers.getSigners();
        dojoToken = await deployContract<DojoToken>(
          "DojoToken",
          [],
          undefined
        );
        vesting = await deployContract<Vesting>(
          "Vesting",
          [addrs[1].address],
          undefined
        );
    });

    it('should have zero vested amount after creation', async () => {
        const vestedAmount = await vesting["vestedAmount(address,uint64)"](dojoToken.address, 2365349629);
        expect(vestedAmount).to.equal(0);
    });

    it('should start vesting from next week from timestamp', async () => {
        const CLIFF_WEEKS = 26;
        const VESTED_TOKENS = 200;

        let startTime = (await time.latest()).toNumber();

        await dojoToken.approve(vesting.address, VESTED_TOKENS);
        await vesting.addVest(dojoToken.address, VESTED_TOKENS, startTime + CLIFF_WEEKS*ONE_WEEK_SECS, 3);
        let vestedAmount = await vesting["vestedAmount(address,uint64)"](dojoToken.address, startTime + ONE_WEEK_SECS*(CLIFF_WEEKS + 1));
        expect(vestedAmount).to.equal(0);
        vestedAmount = await vesting["vestedAmount(address,uint64)"](dojoToken.address, startTime + ONE_WEEK_SECS*(CLIFF_WEEKS + 2));
        expect(vestedAmount).to.equal(66);
    });

    it('should divide vesting into equal parts', async () => {
        const CLIFF_WEEKS = 10;
        const VESTED_TOKENS = 200;

        let startTime = (await time.latest()).toNumber();

        await dojoToken.approve(vesting.address, VESTED_TOKENS);
        await vesting.addVest(dojoToken.address, VESTED_TOKENS, startTime + CLIFF_WEEKS*ONE_WEEK_SECS, 3);
        const addVestingWeek = Math.floor((startTime + CLIFF_WEEKS*ONE_WEEK_SECS)/ONE_WEEK_SECS);
        let vestedAmount = await vesting["vestedAmount(address,uint64)"](dojoToken.address, startTime + ONE_WEEK_SECS*(CLIFF_WEEKS + 2));
        expect(vestedAmount).to.equal(66);
        vestedAmount = await vesting["vestedAmount(address,uint64)"](dojoToken.address, startTime + ONE_WEEK_SECS*(CLIFF_WEEKS + 3));
        expect(vestedAmount).to.equal(133);
        vestedAmount = await vesting["vestedAmount(address,uint64)"](dojoToken.address, startTime + ONE_WEEK_SECS*(CLIFF_WEEKS + 4));
        expect(vestedAmount).to.equal(200);
    });

    it('should not add vesting when finished', async () => {
        const CLIFF_WEEKS = 420;
        const VESTED_TOKENS = 200;

        let startTime = (await time.latest()).toNumber();

        await dojoToken.approve(vesting.address, VESTED_TOKENS);
        await vesting.addVest(dojoToken.address, VESTED_TOKENS, startTime + CLIFF_WEEKS*ONE_WEEK_SECS, 3);
        const addVestingWeek = Math.floor((startTime + CLIFF_WEEKS*ONE_WEEK_SECS)/ONE_WEEK_SECS);
        let vestedAmount = await vesting["vestedAmount(address,uint64)"](dojoToken.address, startTime + ONE_WEEK_SECS*(CLIFF_WEEKS + 5));
        expect(vestedAmount).to.equal(200);
    });

    it('should not send tokens if not yet vested', async () => {
        const CLIFF_WEEKS = 26;
        const VESTED_TOKENS = 200;

        let addrs = await ethers.getSigners();
        let startTime = (await time.latest()).toNumber();

        await dojoToken.approve(vesting.address, VESTED_TOKENS);
        await vesting.addVest(dojoToken.address, VESTED_TOKENS, startTime + CLIFF_WEEKS*ONE_WEEK_SECS, 3);
        await time.increaseTo(startTime + ONE_WEEK_SECS*(CLIFF_WEEKS + 0.5));
        await vesting["release(address)"](dojoToken.address);
        let balance = await dojoToken.balanceOf(addrs[1].address);

        expect(balance).to.equal(0);
    });

    it('should send tokens partially vested', async () => {
        const CLIFF_WEEKS = 26;
        const VESTED_TOKENS = 200;

        let addrs = await ethers.getSigners();
        let startTime = (await time.latest()).toNumber();

        await dojoToken.approve(vesting.address, VESTED_TOKENS);
        await vesting.addVest(dojoToken.address, VESTED_TOKENS, startTime + CLIFF_WEEKS*ONE_WEEK_SECS, 3);
        await time.increaseTo(startTime + ONE_WEEK_SECS*(CLIFF_WEEKS + 2));
        await vesting["release(address)"](dojoToken.address);
        let released = await vesting["released(address)"](dojoToken.address);
        expect(released).to.equal(Math.floor(VESTED_TOKENS/3));
        let balance = await dojoToken.balanceOf(addrs[1].address);
        expect(balance).to.equal(Math.floor(VESTED_TOKENS/3));
    });

    it('should not exceed total vesting when partially released earlier', async () => {
        const CLIFF_WEEKS = 26;
        const VESTED_TOKENS = 200;

        let addrs = await ethers.getSigners();
        let startTime = (await time.latest()).toNumber();

        await dojoToken.approve(vesting.address, 2*VESTED_TOKENS);
        await vesting.addVest(dojoToken.address, VESTED_TOKENS, startTime + CLIFF_WEEKS*ONE_WEEK_SECS, 3);
        await dojoToken.transfer(vesting.address, VESTED_TOKENS);
        await time.increaseTo(startTime + ONE_WEEK_SECS*(CLIFF_WEEKS + 2));
        await vesting["release(address)"](dojoToken.address);
        await time.increaseTo(startTime + ONE_WEEK_SECS*(CLIFF_WEEKS + 4));
        await vesting["release(address)"](dojoToken.address);
        let released = await vesting["released(address)"](dojoToken.address);
        expect(released).to.equal(Math.floor(VESTED_TOKENS));
        let balance = await dojoToken.balanceOf(addrs[1].address);
        expect(balance).to.equal(VESTED_TOKENS);
    });
});