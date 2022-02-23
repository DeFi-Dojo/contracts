import chai, { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
// @ts-ignore
import { expectRevert } from "@openzeppelin/test-helpers";
import { smock } from "@defi-wonderland/smock";
import { FakeContract } from "@defi-wonderland/smock/dist/src/types";
import { deployContract } from "../utils/deployment";
import { AaveYNFTVault } from "../typechain";
import IUniswapV2Router02 from "../artifacts/contracts/interfaces/uniswapv2/IUniswapV2Router02.sol/IUniswapV2Router02.json";
import IAToken from "../artifacts/contracts/interfaces/aave/IAToken.sol/IAToken.json";
import IAaveIncentivesController from "../artifacts/contracts/interfaces/aave/IAaveIncentivesController.sol/IAaveIncentivesController.json";
import IERC20 from "../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json";
import ILendingPool from "../artifacts/contracts/interfaces/aave/ILendingPool.sol/ILendingPool.json";


chai.use(smock.matchers)

describe("AaveYNFTVault", () => {
    let aaveYnftVault: Contract;
    let uniswapRouter: FakeContract;
    let aToken: FakeContract;
    let aaveIncentivesController: FakeContract;
    let rewardToken: FakeContract;
    let underlyingToken: FakeContract;
    let pool: FakeContract;
    let signers: SignerWithAddress[];

    const ATOKEN_BALANCE = 12000;

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

        signers = await ethers.getSigners();

        aaveYnftVault = await deployContract<AaveYNFTVault>(
            "AaveYNFTVault",
            [uniswapRouter.address, aToken.address, aaveIncentivesController.address, signers[1].address, signers[0].address],
            undefined
        );
    });

    it("should return value from aave incentives controller on getAmountToClaim", async () => {
        const EXPECTED_AMOUNT = 200;
        aaveIncentivesController.getRewardsBalance.whenCalledWith([aToken.address], aaveYnftVault.address).returns(EXPECTED_AMOUNT);
        expect(await aaveYnftVault.getAmountToClaim()).to.equal(EXPECTED_AMOUNT);
    });

    it("should revert setBeneficiary if no DEFAULT_ADMIN_ROLE rights", async () => {
        await expectRevert(aaveYnftVault.connect(signers[1]).setBeneficiary(signers[2].address),
            "AccessControl: account ", signers[1].address, " is missing role 0x0000000000000000000000000000000000000000000000000000000000000000'");
    });

    it("should change beneficiary by setBeneficiary when role set", async () => {
        await aaveYnftVault.grantRole("0x0000000000000000000000000000000000000000000000000000000000000000", signers[1].address)
        await aaveYnftVault.connect(signers[1]).setBeneficiary(signers[2].address);
        expect(await aaveYnftVault.beneficiary()).to.equal(signers[2].address);
    });


    it("should revert setFee if no DEFAULT_ADMIN_ROLE rights", async () => {
        const FEE = 12;
        await expectRevert(aaveYnftVault.connect(signers[1]).setFee(FEE),
            "AccessControl: account ", signers[1].address, " is missing role 0x0000000000000000000000000000000000000000000000000000000000000000'");
    });

    it("should set proper fee by setFee when role set", async () => {
        const FEE = 12;
        await aaveYnftVault.grantRole("0x0000000000000000000000000000000000000000000000000000000000000000", signers[1].address)
        await aaveYnftVault.connect(signers[1]).setFee(FEE);
        expect(await aaveYnftVault.feePerMile()).to.equal(FEE);
    });

    it("should revert setFee if fee above 100", async () => {
        const FEE = 101;
        await expectRevert(aaveYnftVault.setFee(FEE), "Fee cannot be that much");
    });

    it("should revert claimRewards if caller has no HARVESTER_ROLE", async () => {
        const MIN_AMOUNT = 101;
        const DEADLINE = 101;
        await expectRevert(aaveYnftVault.claimRewards(MIN_AMOUNT, DEADLINE),
            "AccessControl: account ", signers[0].address, " is missing role ", ethers.utils.keccak256(ethers.utils.toUtf8Bytes("HARVESTER_ROLE")));
    });

    it("should calculate balance when withdrawing from pool", async () => {
        const AMOUNT1 = 200;
        const AMOUNT1_AFTER_FEE = 198;
        const AMOUNT2 = 300;
        const AMOUNT2_AFTER_FEE = 297;
        const MIN_AMOUNT = 101;
        const DEADLINE = 101;

        await underlyingToken.transferFrom.returns(true);
        await underlyingToken.approve.returns(true);
        await aToken.balanceOf.returnsAtCall(0, 0);
        await aToken.balanceOf.returnsAtCall(1, AMOUNT1_AFTER_FEE);
        await aToken.balanceOf.returnsAtCall(2, AMOUNT1_AFTER_FEE + AMOUNT2_AFTER_FEE);
        await aToken.balanceOf.returnsAtCall(3, AMOUNT2_AFTER_FEE);
        await pool.deposit.returns();

        await aaveYnftVault.setFee(10);
        await aaveYnftVault.connect(signers[0]).createYNFT(underlyingToken.address, AMOUNT1, MIN_AMOUNT, DEADLINE);
        expect(await aaveYnftVault.balanceOf(0)).to.equal(AMOUNT1_AFTER_FEE);
        await aaveYnftVault.connect(signers[1]).createYNFT(underlyingToken.address, AMOUNT2, MIN_AMOUNT, DEADLINE);
        expect(await aaveYnftVault.balanceOf(1)).to.equal(AMOUNT2_AFTER_FEE);

        await aaveYnftVault.connect(signers[0]).withdrawToUnderlyingTokens(0);
        expect(pool.withdraw).to.have.been.calledWith(underlyingToken.address, AMOUNT1_AFTER_FEE, signers[0].address);
        await aaveYnftVault.connect(signers[1]).withdrawToUnderlyingTokens(1);
        expect(pool.withdraw).to.have.been.calledWith(underlyingToken.address, AMOUNT2_AFTER_FEE, signers[1].address);
        expect(aToken.balanceOf).to.have.callCount(4);
    });

    it("should calculate balance when withdrawing from pool in reverse order", async () => {
        const AMOUNT1 = 200;
        const AMOUNT1_AFTER_FEE = 198;
        const AMOUNT2 = 300;
        const AMOUNT2_AFTER_FEE = 297;
        const MIN_AMOUNT = 101;
        const DEADLINE = 101;

        underlyingToken.transferFrom.returns(true);
        underlyingToken.approve.returns(true);
        aToken.balanceOf.returnsAtCall(0, 0);
        aToken.balanceOf.returnsAtCall(1, AMOUNT1_AFTER_FEE);
        aToken.balanceOf.returnsAtCall(2, AMOUNT1_AFTER_FEE + AMOUNT2_AFTER_FEE);
        aToken.balanceOf.returnsAtCall(3, AMOUNT1_AFTER_FEE);
        pool.deposit.returns();

        await aaveYnftVault.setFee(10);
        await aaveYnftVault.connect(signers[0]).createYNFT(underlyingToken.address, AMOUNT1, MIN_AMOUNT, DEADLINE);
        expect(await aaveYnftVault.balanceOf(0)).to.equal(AMOUNT1_AFTER_FEE);
        await aaveYnftVault.connect(signers[1]).createYNFT(underlyingToken.address, AMOUNT2, MIN_AMOUNT, DEADLINE);
        expect(await aaveYnftVault.balanceOf(1)).to.equal(297);

        await aaveYnftVault.connect(signers[1]).withdrawToUnderlyingTokens(1);
        expect(pool.withdraw).to.have.been.calledWith(underlyingToken.address, AMOUNT2_AFTER_FEE, signers[1].address);
        await aaveYnftVault.connect(signers[0]).withdrawToUnderlyingTokens(0);
        expect(pool.withdraw).to.have.been.calledWith(underlyingToken.address, AMOUNT1_AFTER_FEE, signers[0].address);
        expect(aToken.balanceOf).to.have.callCount(4);
    });

    it("should calculate correct balance after claimRewards", async () => {
        const AMOUNT1 = 100;
        const AMOUNT1_AFTER_FEE = 99;
        const MIN_AMOUNT = 97;
        const DEADLINE = 101;
        const AMOUNT_TO_CLAIM = 1000;

        await aaveYnftVault.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("HARVESTER_ROLE")), signers[0].address);

        underlyingToken.transferFrom.returns(true);
        underlyingToken.approve.returns(true);
        aToken.balanceOf.returnsAtCall(0, 0);
        aToken.balanceOf.returnsAtCall(1, AMOUNT1+AMOUNT1_AFTER_FEE);
        pool.deposit.returns();

        aaveIncentivesController.getRewardsBalance.whenCalledWith([aToken.address], aaveYnftVault.address).returns(AMOUNT_TO_CLAIM);
        aaveIncentivesController.claimRewards.whenCalledWith([aToken.address], AMOUNT_TO_CLAIM, aaveYnftVault.address).returns(AMOUNT_TO_CLAIM);
        rewardToken.approve.whenCalledWith(uniswapRouter.address, AMOUNT_TO_CLAIM).returns(true);
        uniswapRouter.swapExactTokensForTokens.returns([AMOUNT_TO_CLAIM, AMOUNT1]);
        underlyingToken.approve.whenCalledWith(pool.address, AMOUNT1).returns(true);

        await aaveYnftVault.setFee(10);
        await aaveYnftVault.connect(signers[0]).createYNFT(underlyingToken.address, AMOUNT1, MIN_AMOUNT, DEADLINE);
        expect(await aaveYnftVault.balanceOf(0)).to.equal(AMOUNT1_AFTER_FEE);
        expect(await aaveYnftVault.totalSupply()).to.equal(AMOUNT1_AFTER_FEE);

        await aaveYnftVault.claimRewards(MIN_AMOUNT, DEADLINE);
        expect(await aaveYnftVault.totalSupply()).to.equal(AMOUNT1_AFTER_FEE);

        await aaveYnftVault.connect(signers[1]).createYNFT(underlyingToken.address, AMOUNT1, MIN_AMOUNT, DEADLINE);
        expect(aToken.balanceOf).to.have.callCount(2);
        expect(await aaveYnftVault.balanceOf(0)).to.equal(AMOUNT1_AFTER_FEE);
        expect(await aaveYnftVault.balanceOf(1)).to.equal(Math.floor(AMOUNT1_AFTER_FEE/2));
        expect(await aaveYnftVault.totalSupply()).to.equal(AMOUNT1_AFTER_FEE+Math.floor(AMOUNT1_AFTER_FEE/2));
        expect(aToken.balanceOf).to.have.callCount(2);
    });

    it("should deposit in pool when claimRewards called", async () => {
        const MIN_AMOUNT = 101;
        const DEADLINE = 101;
        const AMOUNT_TO_CLAIM = 1500;

        await aaveYnftVault.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("HARVESTER_ROLE")), signers[0].address);
        aaveIncentivesController.getRewardsBalance.whenCalledWith([aToken.address], aaveYnftVault.address).returns(AMOUNT_TO_CLAIM);
        aaveIncentivesController.claimRewards.whenCalledWith([aToken.address], AMOUNT_TO_CLAIM, aaveYnftVault.address).returns(AMOUNT_TO_CLAIM);
        rewardToken.approve.whenCalledWith(uniswapRouter.address, AMOUNT_TO_CLAIM).returns(true);
        uniswapRouter.swapExactTokensForTokens.returns([AMOUNT_TO_CLAIM, AMOUNT_TO_CLAIM]);
        underlyingToken.approve.whenCalledWith(pool.address, AMOUNT_TO_CLAIM).returns(true);
        await aaveYnftVault.claimRewards(MIN_AMOUNT, DEADLINE);
        expect(pool.deposit).to.have.been.calledWith(underlyingToken.address, AMOUNT_TO_CLAIM, aaveYnftVault.address, 0);
    });

    it("should revert if rewardToken not approved when claimRewards called", async () => {
        const MIN_AMOUNT = 101;
        const DEADLINE = 101;
        const AMOUNT_TO_CLAIM = 1500;
        await aaveYnftVault.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("HARVESTER_ROLE")), signers[0].address);
        aaveIncentivesController.getRewardsBalance.whenCalledWith([aToken.address], aaveYnftVault.address).returns(AMOUNT_TO_CLAIM);
        aaveIncentivesController.claimRewards.whenCalledWith([aToken.address], AMOUNT_TO_CLAIM, aaveYnftVault.address).returns(AMOUNT_TO_CLAIM);
        rewardToken.approve.whenCalledWith(uniswapRouter.address, AMOUNT_TO_CLAIM).returns(false);

        await expectRevert(aaveYnftVault.claimRewards(MIN_AMOUNT, DEADLINE), "approve failed.");
    });

    it("should revert if underlyingToken not approved when claimRewards called", async () => {
        const MIN_AMOUNT = 101;
        const DEADLINE = 101;
        const AMOUNT_TO_CLAIM = 1500;
        await aaveYnftVault.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("HARVESTER_ROLE")), signers[0].address);
        aaveIncentivesController.getRewardsBalance.whenCalledWith([aToken.address], aaveYnftVault.address).returns(AMOUNT_TO_CLAIM);
        aaveIncentivesController.claimRewards.whenCalledWith([aToken.address], AMOUNT_TO_CLAIM, aaveYnftVault.address).returns(AMOUNT_TO_CLAIM);
        rewardToken.approve.whenCalledWith(uniswapRouter.address, AMOUNT_TO_CLAIM).returns(true);

        uniswapRouter.swapExactTokensForTokens.returns([AMOUNT_TO_CLAIM, AMOUNT_TO_CLAIM]);
        underlyingToken.approve.whenCalledWith(pool.address, AMOUNT_TO_CLAIM).returns(false);

        await expectRevert(aaveYnftVault.claimRewards(MIN_AMOUNT, DEADLINE), "approve failed.");
    });

    it("should revert withdrawToUnderlyingTokens if contract paused", async () => {
        const TOKEN_ID = 1;
        await aaveYnftVault.pause();
        await expectRevert(aaveYnftVault.withdrawToUnderlyingTokens(TOKEN_ID), "Pausable: paused");
    });

    it("should revert withdrawToEther if contract paused", async () => {
        const TOKEN_ID = 1;
        const MIN_AMOUNT = 101;
        const DEADLINE = 101;
        await aaveYnftVault.pause();
        await expectRevert(aaveYnftVault.withdrawToEther(TOKEN_ID, MIN_AMOUNT, DEADLINE), "Pausable: paused");
    });

    it("should revert createYNFT if contract paused", async () => {
        const MIN_AMOUNT = 101;
        const DEADLINE = 101;
        await aaveYnftVault.pause();
        await expectRevert(aaveYnftVault.createYNFT(underlyingToken.address, MIN_AMOUNT, MIN_AMOUNT, DEADLINE), "Pausable: paused");
    });

    // eslint-disable-next-line @typescript-eslint/naming-convention
    async function init_createYNFT_mocks(token: FakeContract) {
        token.transferFrom.returns(true);
        token.approve.returns(true);
        aToken.balanceOf.returns(ATOKEN_BALANCE);
        pool.deposit.returns();
    }

    it("should call transferFrom on underlyingToken when calling createYNFT for underlyingToken", async () => {
        const MIN_AMOUNT = 123000;
        const DEADLINE = 101;

        await init_createYNFT_mocks(underlyingToken);
        await aaveYnftVault.connect(signers[1]).createYNFT(underlyingToken.address, MIN_AMOUNT, MIN_AMOUNT, DEADLINE);

        const EXPECTED_FEE = MIN_AMOUNT * 5 / 1000;

        expect(underlyingToken.transferFrom).to.have.been.calledWith(signers[1].address, signers[0].address, EXPECTED_FEE);
        expect(underlyingToken.approve).to.have.been.calledWith(pool.address, MIN_AMOUNT - EXPECTED_FEE);
        expect(underlyingToken.transferFrom).to.have.been.calledWith(signers[1].address, aaveYnftVault.address, MIN_AMOUNT - EXPECTED_FEE);
        expect(pool.deposit).to.have.been.calledWith(underlyingToken.address, MIN_AMOUNT - EXPECTED_FEE, aaveYnftVault.address, 0);
   });

    it("should call transferFrom on input token when calling createYNFT for token other than underlyingToken", async () => {
        const MIN_AMOUNT = 123000;
        const SWAPPED_AMOUNT = 246000;
        const DEADLINE = 101;
        await init_createYNFT_mocks(underlyingToken);
        const otherToken = await smock.fake(IERC20.abi);
        otherToken.transferFrom.returns(true);
        otherToken.approve.returns(true);
        uniswapRouter.swapExactTokensForTokens.returns([MIN_AMOUNT, SWAPPED_AMOUNT]);

        await aaveYnftVault.connect(signers[1]).createYNFT(otherToken.address, MIN_AMOUNT, MIN_AMOUNT, DEADLINE);

        const EXPECTED_FEE = MIN_AMOUNT * 5 / 1000;
        expect(otherToken.transferFrom).to.have.been.calledWith(signers[1].address, signers[0].address, EXPECTED_FEE);
        expect(underlyingToken.approve).to.have.been.calledWith(pool.address, SWAPPED_AMOUNT);
        expect(pool.deposit).to.have.been.calledWith(underlyingToken.address, SWAPPED_AMOUNT, aaveYnftVault.address, 0);
        expect(otherToken.approve).to.have.been.calledWith(uniswapRouter.address, MIN_AMOUNT - EXPECTED_FEE);
        expect(otherToken.transferFrom).to.have.been.calledWith(signers[1].address, aaveYnftVault.address, MIN_AMOUNT - EXPECTED_FEE);
        expect(uniswapRouter.swapExactTokensForTokens).to.have.been.calledWith(
                MIN_AMOUNT - EXPECTED_FEE,
                MIN_AMOUNT,
                [otherToken.address, underlyingToken.address],
                aaveYnftVault.address,
                DEADLINE);
    });

    it("should collect proper fee when calling createYNFTForEther", async () => {
        const MIN_AMOUNT = 101;
        const SWAPPED_AMOUNT = 246000;
        const DEADLINE = 101;

        const WethMock = await smock.fake(IERC20.abi);
        uniswapRouter.WETH.returns(WethMock.address);
        uniswapRouter.swapExactETHForTokens.returns([MIN_AMOUNT, SWAPPED_AMOUNT]);
        await init_createYNFT_mocks(underlyingToken);

        await aaveYnftVault.createYNFTForEther(MIN_AMOUNT, DEADLINE);

        expect(uniswapRouter.swapExactETHForTokens).to.have.been.calledWith(MIN_AMOUNT, [await uniswapRouter.WETH(), underlyingToken.address], aaveYnftVault.address, DEADLINE);
        expect(underlyingToken.approve).to.have.been.calledWith(pool.address, SWAPPED_AMOUNT);
        expect(pool.deposit).to.have.been.calledWith(underlyingToken.address, SWAPPED_AMOUNT, aaveYnftVault.address, 0);
    });

    it("should withdraw from pool on withdrawToEther", async () => {
        const MIN_AMOUNT = 123000;
        const DEADLINE = 101;
        const POOL_WITHDRAW_VALUE = 100000;
        await init_createYNFT_mocks(underlyingToken);

        await aaveYnftVault.createYNFT(underlyingToken.address, MIN_AMOUNT, MIN_AMOUNT, DEADLINE);

        uniswapRouter.swapExactTokensForETH.returns([MIN_AMOUNT, MIN_AMOUNT]);
        pool.withdraw.returns(POOL_WITHDRAW_VALUE);

        await aaveYnftVault.withdrawToEther(0, MIN_AMOUNT, DEADLINE);

        expect(underlyingToken.approve).to.have.been.calledWith(uniswapRouter.address, POOL_WITHDRAW_VALUE);
        expect(uniswapRouter.swapExactTokensForETH).to.have.been.calledWith(
            POOL_WITHDRAW_VALUE, MIN_AMOUNT,
            [underlyingToken.address, await uniswapRouter.WETH()],
            signers[0].address,
            DEADLINE
        );
        expect(pool.withdraw).to.have.been.calledWith(underlyingToken.address, ATOKEN_BALANCE, aaveYnftVault.address);
    });

    it("should withdraw from pool on withdrawToUnderlyingTokens", async () => {
        const MIN_AMOUNT = 101;
        const DEADLINE = 101;
        await init_createYNFT_mocks(underlyingToken);

        await aaveYnftVault.connect(signers[1]).createYNFT(underlyingToken.address, MIN_AMOUNT, MIN_AMOUNT, DEADLINE);

        await aaveYnftVault.connect(signers[1]).withdrawToUnderlyingTokens(0);
        expect(pool.withdraw).to.have.been.calledWith(underlyingToken.address, ATOKEN_BALANCE, signers[1].address);
    });

    it("should return underlying asset value for the first yNFT created", async () => {
        const minAmount = 0;
        const amount = 123000;
        const deadline = 101;
        const expectedResultForTokenId0 = 12000;

        await init_createYNFT_mocks(underlyingToken);
        await aaveYnftVault.createYNFT(underlyingToken.address, amount, minAmount, deadline);

        const nftTokenId = 0;
        const underlyingAssetBalance = await aaveYnftVault.balanceOfUnderlying(nftTokenId);

        expect(underlyingAssetBalance).to.equal(expectedResultForTokenId0);
    });

    it("should return underlying asset value for particular yNFT when couple yNFTs already created", async () => {
        const minAmount = 0;
        const amount = 100000;
        const deadline = 101;
        const expectedResultForTokenId2 = 10708;

        await init_createYNFT_mocks(underlyingToken);
        await aaveYnftVault.createYNFT(underlyingToken.address, amount, minAmount, deadline);
        await aaveYnftVault.createYNFT(underlyingToken.address, amount, minAmount, deadline);
        await aaveYnftVault.createYNFT(underlyingToken.address, amount, minAmount, deadline);

        const nftTokenId = 2;
        const underlyingAssetBalance = await aaveYnftVault.balanceOfUnderlying(nftTokenId);

        expect(underlyingAssetBalance).to.equal(expectedResultForTokenId2);
    });
});
