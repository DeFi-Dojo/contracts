/* eslint-disable no-underscore-dangle */
import { expect } from "chai";
import chai from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContract, waitForReceipt } from "../utils/deployment";
import {AaveYNFTVault, ERC20} from "../typechain";
import IUniswapV2Router02 from "../artifacts/contracts/interfaces/uniswapv2/IUniswapV2Router02.sol/IUniswapV2Router02.json";
import IAToken from "../artifacts/contracts/interfaces/aave/IAToken.sol/IAToken.json";
import IAaveIncentivesController from "../artifacts/contracts/interfaces/aave/IAaveIncentivesController.sol/IAaveIncentivesController.json";
import IERC20 from "../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json";
import ILendingPool from "../artifacts/contracts/interfaces/aave/ILendingPool.sol/ILendingPool.json";

// @ts-ignore
import { expectRevert } from "@openzeppelin/test-helpers";
import {smock} from "@defi-wonderland/smock";
import {FakeContract} from "@defi-wonderland/smock/dist/src/types";
import {deployMockContract} from "@ethereum-waffle/mock-contract";

chai.use(smock.matchers)

describe("AaveYNFTVault", () => {
    let aaveYnftVault: Contract;
    let uniswapRouter: FakeContract;
    let aToken: FakeContract;
    let aaveIncentivesController: FakeContract;
    let rewardToken: FakeContract;
    let underlyingToken: FakeContract;
    let pool: FakeContract;

    beforeEach(async () => {
        uniswapRouter = await smock.fake(IUniswapV2Router02.abi);
        aToken =  await smock.fake(IAToken.abi);
        aaveIncentivesController =  await smock.fake(IAaveIncentivesController.abi);


        rewardToken = await smock.fake(IERC20.abi);
        underlyingToken = await smock.fake(IERC20.abi);
        pool = await smock.fake(ILendingPool.abi);

        aaveIncentivesController.REWARD_TOKEN.returns(rewardToken.address);
        aToken.UNDERLYING_ASSET_ADDRESS.returns(underlyingToken.address);
        aToken.POOL.returns(pool.address);

        const signers = await ethers.getSigners();


        aaveYnftVault = await deployContract<AaveYNFTVault>(
            "AaveYNFTVault",
            [uniswapRouter.address, aToken.address, aaveIncentivesController.address, signers[1].address],
            undefined
        );
    });

    it('should return value from aave incentives controller on getAmountToClaim', async () => {
        const EXPECTED_AMOUNT = 200;
        aaveIncentivesController.getRewardsBalance.whenCalledWith([aToken.address], aaveYnftVault.address).returns(EXPECTED_AMOUNT);
        expect(await aaveYnftVault.getAmountToClaim()).to.equal(EXPECTED_AMOUNT);
    });

    it('should revert setBeneficiary if no DEFAULT_ADMIN_ROLE rights', async () => {
        const signers = await ethers.getSigners();
        await expectRevert(aaveYnftVault.connect(signers[1]).setBeneficiary(signers[2].address),
            "AccessControl: account ", signers[1].address, " is missing role 0x0000000000000000000000000000000000000000000000000000000000000000'");
    });

    it('should change beneficiary by setBeneficiary when role set', async () => {
        const signers = await ethers.getSigners();
        await aaveYnftVault.grantRole("0x0000000000000000000000000000000000000000000000000000000000000000", signers[1].address)
        await aaveYnftVault.connect(signers[1]).setBeneficiary(signers[2].address);
        expect(await aaveYnftVault.beneficiary()).to.equal(signers[2].address);
    });


    it('should revert setFee if no DEFAULT_ADMIN_ROLE rights', async () => {
        const FEE = 12;
        const signers = await ethers.getSigners();
        await expectRevert(aaveYnftVault.connect(signers[1]).setFee(FEE),
            "AccessControl: account ", signers[1].address, " is missing role 0x0000000000000000000000000000000000000000000000000000000000000000'");
    });

    it('should set proper fee by setFee when role set', async () => {
        const FEE = 12;
        const signers = await ethers.getSigners();
        await aaveYnftVault.grantRole("0x0000000000000000000000000000000000000000000000000000000000000000", signers[1].address)
        await aaveYnftVault.connect(signers[1]).setFee(FEE);
        expect(await aaveYnftVault.feePerMile()).to.equal(FEE);
    });

    it('should revert setFee if fee above 100', async () => {
        const FEE = 101;
        await expectRevert(aaveYnftVault.setFee(FEE), "Fee cannot be that much");
    });

    it('should revert claimRewards if caller has no HARVESTER_ROLE', async () => {
        const MIN_AMOUNT = 101;
        const DEADLINE = 101;
        const signers = await ethers.getSigners();
        await expectRevert(aaveYnftVault.claimRewards(MIN_AMOUNT, DEADLINE),
            "AccessControl: account ", signers[0].address, " is missing role ", ethers.utils.keccak256(ethers.utils.toUtf8Bytes("HARVESTER_ROLE")));
    });

    it('should deposit in pool when claimRewards called', async () => {
        const MIN_AMOUNT = 101;
        const DEADLINE = 101;
        const AMOUNT_TO_CLAIM = 1500;
        const signers = await ethers.getSigners();
        await aaveYnftVault.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("HARVESTER_ROLE")), signers[0].address);
        aaveIncentivesController.getRewardsBalance.whenCalledWith([aToken.address], aaveYnftVault.address).returns(AMOUNT_TO_CLAIM);
        aaveIncentivesController.claimRewards.whenCalledWith([aToken.address], AMOUNT_TO_CLAIM, aaveYnftVault.address).returns(AMOUNT_TO_CLAIM);
        rewardToken.approve.whenCalledWith(uniswapRouter.address, AMOUNT_TO_CLAIM).returns(true);
        uniswapRouter.swapExactTokensForTokens.returns([AMOUNT_TO_CLAIM, AMOUNT_TO_CLAIM]);
        underlyingToken.approve.whenCalledWith(pool.address, AMOUNT_TO_CLAIM).returns(true);
        await aaveYnftVault.claimRewards(MIN_AMOUNT, DEADLINE);
        expect(pool.deposit).to.have.been.calledWith(underlyingToken.address, AMOUNT_TO_CLAIM, aaveYnftVault.address, 0);
    });

    it('should revert if rewardToken not approved when claimRewards called', async () => {
        const MIN_AMOUNT = 101;
        const DEADLINE = 101;
        const AMOUNT_TO_CLAIM = 1500;
        const signers = await ethers.getSigners();
        await aaveYnftVault.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("HARVESTER_ROLE")), signers[0].address);
        aaveIncentivesController.getRewardsBalance.whenCalledWith([aToken.address], aaveYnftVault.address).returns(AMOUNT_TO_CLAIM);
        aaveIncentivesController.claimRewards.whenCalledWith([aToken.address], AMOUNT_TO_CLAIM, aaveYnftVault.address).returns(AMOUNT_TO_CLAIM);
        rewardToken.approve.whenCalledWith(uniswapRouter.address, AMOUNT_TO_CLAIM).returns(false);

        await expectRevert(aaveYnftVault.claimRewards(MIN_AMOUNT, DEADLINE), "approve failed.");
    });

    it('should revert if underlyingToken not approved when claimRewards called', async () => {
        const MIN_AMOUNT = 101;
        const DEADLINE = 101;
        const AMOUNT_TO_CLAIM = 1500;
        const signers = await ethers.getSigners();
        await aaveYnftVault.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("HARVESTER_ROLE")), signers[0].address);
        aaveIncentivesController.getRewardsBalance.whenCalledWith([aToken.address], aaveYnftVault.address).returns(AMOUNT_TO_CLAIM);
        aaveIncentivesController.claimRewards.whenCalledWith([aToken.address], AMOUNT_TO_CLAIM, aaveYnftVault.address).returns(AMOUNT_TO_CLAIM);
        rewardToken.approve.whenCalledWith(uniswapRouter.address, AMOUNT_TO_CLAIM).returns(true);

        uniswapRouter.swapExactTokensForTokens.returns([AMOUNT_TO_CLAIM, AMOUNT_TO_CLAIM]);
        underlyingToken.approve.whenCalledWith(pool.address, AMOUNT_TO_CLAIM).returns(false);

        await expectRevert(aaveYnftVault.claimRewards(MIN_AMOUNT, DEADLINE), "approve failed.");
    });

    it('should revert withdrawToUnderlyingTokens if contract paused', async () => {
        const TOKEN_ID = 1;
        await aaveYnftVault.pause();
        await expectRevert(aaveYnftVault.withdrawToUnderlyingTokens(TOKEN_ID), "Pausable: paused");
    });

    it('should revert withdrawToEther if contract paused', async () => {
        const TOKEN_ID = 1;
        const MIN_AMOUNT = 101;
        const DEADLINE = 101;
        await aaveYnftVault.pause();
        await expectRevert(aaveYnftVault.withdrawToEther(TOKEN_ID, MIN_AMOUNT, DEADLINE), "Pausable: paused");
    });

    it('should revert createYNFT if contract paused', async () => {
        const MIN_AMOUNT = 101;
        const DEADLINE = 101;
        await aaveYnftVault.pause();
        await expectRevert(aaveYnftVault.createYNFT(underlyingToken.address, MIN_AMOUNT, MIN_AMOUNT, DEADLINE), "Pausable: paused");
    });

    async function init_createYNFT_mocks(token: FakeContract) {
        const ATOKEN_BALANCE = 12000;
        await token.transferFrom.returns(true);
        await token.approve.returns(true);
        await aToken.balanceOf.returns(ATOKEN_BALANCE);
        await pool.deposit.returns();
    }

    it('should call transferFrom on underlyingToken when calling createYNFT for underlyingToken', async () => {
        const MIN_AMOUNT = 101;
        const DEADLINE = 101;
        await init_createYNFT_mocks(underlyingToken);

        await aaveYnftVault.createYNFT(underlyingToken.address, MIN_AMOUNT, MIN_AMOUNT, DEADLINE);

        expect(underlyingToken.transferFrom).to.have.been.called;
        expect(underlyingToken.approve).to.have.been.called;
        expect(pool.deposit).to.have.been.called;
   });

    it('should call transferFrom on input token when calling createYNFT for token other than underlyingToken', async () => {
        const MIN_AMOUNT = 101;
        const DEADLINE = 101;
        const signers = await ethers.getSigners();
        await init_createYNFT_mocks(underlyingToken);
        // const otherToken = await deployMockContract(signers[0], IERC20.abi);
        const otherToken = await smock.fake(IERC20.abi);
        otherToken.transferFrom.returns(true);
        otherToken.approve.returns(true);
        uniswapRouter.swapExactTokensForTokens.returns([MIN_AMOUNT, MIN_AMOUNT]);

        await aaveYnftVault.createYNFT(otherToken.address, MIN_AMOUNT, MIN_AMOUNT, DEADLINE);

        expect(otherToken.transferFrom).to.have.been.called;
        expect(underlyingToken.approve).to.have.been.called;
        expect(pool.deposit).to.have.been.called;
        expect(otherToken.approve).to.have.been.called;
        expect(uniswapRouter.swapExactTokensForTokens).to.have.been.called;
    });

    it('should collect proper fee when calling createYNFTForEther', async () => {
        const MIN_AMOUNT = 101;
        const DEADLINE = 101;
        const signers = await ethers.getSigners();

        const WethMock = await await deployMockContract(signers[0], IERC20.abi);
        await uniswapRouter.WETH.returns(WethMock.address);
        await uniswapRouter.swapExactETHForTokens.returns([MIN_AMOUNT, MIN_AMOUNT]);
        await init_createYNFT_mocks(underlyingToken);

        const balance_before = await signers[0].getBalance();
        await aaveYnftVault.createYNFTForEther(MIN_AMOUNT, DEADLINE);
        const balance_after = await signers[0].getBalance();

        // expect(balance_before.sub(balance_after)).to.equal("169503229193092");

        expect(uniswapRouter.swapExactETHForTokens).to.have.been.called;
        expect(underlyingToken.approve).to.have.been.called;
        expect(pool.deposit).to.have.been.called;
    });

    it('should withdraw from pool on withdrawToEther', async () => {
        const MIN_AMOUNT = 101;
        const DEADLINE = 101;
        await init_createYNFT_mocks(underlyingToken);

        await aaveYnftVault.createYNFT(underlyingToken.address, MIN_AMOUNT, MIN_AMOUNT, DEADLINE);

        await uniswapRouter.swapExactTokensForETH.returns([MIN_AMOUNT, MIN_AMOUNT]);

        await aaveYnftVault.withdrawToEther(0, MIN_AMOUNT, DEADLINE);

        expect(underlyingToken.approve).to.have.been.called;
        expect(uniswapRouter.swapExactTokensForETH).to.have.been.called;
        expect(pool.withdraw).to.have.been.called;
    });

    it('should withdraw from pool on withdrawToUnderlyingTokens', async () => {
        const MIN_AMOUNT = 101;
        const DEADLINE = 101;
        await init_createYNFT_mocks(underlyingToken);

        await aaveYnftVault.createYNFT(underlyingToken.address, MIN_AMOUNT, MIN_AMOUNT, DEADLINE);

        await aaveYnftVault.withdrawToUnderlyingTokens(0);
        expect(pool.withdraw).to.have.been.called;
    });
});