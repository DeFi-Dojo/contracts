import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContract, waitForReceipt } from "../utils/deployment";
import { DojoToken, Vesting } from "../typechain";
// const time = require('@openzeppelin/test-helpers');

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
          [addrs[0].address],
          undefined
        );
    });

    it('should have zero vested amount after creation', async () => {
        const vestedAmount = await vesting["vestedAmount(address,uint64)"](dojoToken.address, 2365349629);
        expect(vestedAmount).to.equal(0);
    });

    it('should start vesting from next week from timestamp', async () => {
        const minTimestamp = 1639246638;
        const CLIFF_WEEKS = 26;
        const VESTED_TOKENS = 200;

        await dojoToken.approve(vesting.address, VESTED_TOKENS);
        await vesting.addVest(dojoToken.address, VESTED_TOKENS, minTimestamp + CLIFF_WEEKS*ONE_WEEK_SECS, 3);
        let vestedAmount = await vesting["vestedAmount(address,uint64)"](dojoToken.address, minTimestamp + ONE_WEEK_SECS*(CLIFF_WEEKS + 1));
        expect(vestedAmount).to.equal(0);
        vestedAmount = await vesting["vestedAmount(address,uint64)"](dojoToken.address, minTimestamp + ONE_WEEK_SECS*(CLIFF_WEEKS + 2));
        expect(vestedAmount).to.equal(66);
    });

    it('should divide vesting into equal parts', async () => {
        const minTimestamp = 1639246638;
        const CLIFF_WEEKS = 10;
        const VESTED_TOKENS = 200;

        await dojoToken.approve(vesting.address, VESTED_TOKENS);
        await vesting.addVest(dojoToken.address, VESTED_TOKENS, minTimestamp + CLIFF_WEEKS*ONE_WEEK_SECS, 3);
        const addVestingWeek = Math.floor((minTimestamp + CLIFF_WEEKS*ONE_WEEK_SECS)/ONE_WEEK_SECS);
        let vestedAmount = await vesting["vestedAmount(address,uint64)"](dojoToken.address, minTimestamp + ONE_WEEK_SECS*(CLIFF_WEEKS + 2));
        expect(vestedAmount).to.equal(66);
        vestedAmount = await vesting["vestedAmount(address,uint64)"](dojoToken.address, minTimestamp + ONE_WEEK_SECS*(CLIFF_WEEKS + 3));
        expect(vestedAmount).to.equal(133);
        vestedAmount = await vesting["vestedAmount(address,uint64)"](dojoToken.address, minTimestamp + ONE_WEEK_SECS*(CLIFF_WEEKS + 4));
        expect(vestedAmount).to.equal(200);
    });

    it('should not add vesting when finished', async () => {
        const minTimestamp = 1639246638;
        const CLIFF_WEEKS = 420;
        const VESTED_TOKENS = 200;

        await dojoToken.approve(vesting.address, VESTED_TOKENS);
        await vesting.addVest(dojoToken.address, VESTED_TOKENS, minTimestamp + CLIFF_WEEKS*ONE_WEEK_SECS, 3);
        const addVestingWeek = Math.floor((minTimestamp + CLIFF_WEEKS*ONE_WEEK_SECS)/ONE_WEEK_SECS);
        let vestedAmount = await vesting["vestedAmount(address,uint64)"](dojoToken.address, minTimestamp + ONE_WEEK_SECS*(CLIFF_WEEKS + 5));
        expect(vestedAmount).to.equal(200);
    });
});