import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContract, waitForReceipt } from "../utils/deployment";
import { DojoToken, VestingFactory } from "../typechain";

// @ts-ignore
import { time, makeInterfaceId } from '@openzeppelin/test-helpers';

describe("VestingFactory", () => {
    let vestingFactory: VestingFactory;
    let dojoToken: DojoToken;

    beforeEach(async function () {
        let addrs = await ethers.getSigners();
        vestingFactory = await deployContract<VestingFactory>(
          "VestingFactory",
          [],
          undefined
        );
        dojoToken = await deployContract<DojoToken>(
          "DojoToken",
          [],
          undefined
        );
    });

    it('should return 0 address if contract not initialized', async () => {
        let addrs = await ethers.getSigners();
        let USER = addrs[1].address;
        let EXPECTED_ADDRESS = "0x0000000000000000000000000000000000000000"
        let cotractAddress = await vestingFactory.vestingForUser(USER);
        expect(cotractAddress).to.equal(EXPECTED_ADDRESS);
        cotractAddress = await vestingFactory.vestingForTeamMember(USER);
        expect(cotractAddress).to.equal(EXPECTED_ADDRESS);

    });

    it('should create contract if createVestingForUser called', async () => {
        let addrs = await ethers.getSigners();
        let USER = addrs[1].address;
        let NOT_EXPECTED_ADDRESS = "0x0000000000000000000000000000000000000000"
        await vestingFactory.createVestingForUser(addrs[1].address);
        let cotractAddress = await vestingFactory.vestingForUser(USER);
        expect(cotractAddress).to.not.equal(NOT_EXPECTED_ADDRESS);
        const contractFactory = await ethers.getContractFactory("Vesting");
        const contractInstance = contractFactory.attach(cotractAddress);

        const CLIFF_WEEKS = 26;
        const VESTED_TOKENS = 200;
        const ONE_WEEK_SECS = 604800;

        let startTime = (await time.latest()).toNumber();

        await dojoToken.approve(contractInstance.address, VESTED_TOKENS);
        await contractInstance.addVest(dojoToken.address, VESTED_TOKENS, startTime + CLIFF_WEEKS*ONE_WEEK_SECS, 3);
    });

});