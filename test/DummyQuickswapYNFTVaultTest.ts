import chai, { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { smock } from "@defi-wonderland/smock";
import { FakeContract } from "@defi-wonderland/smock/dist/src/types";
// @ts-ignore
import { balance } from "@openzeppelin/test-helpers";
import { deployContract} from "../utils/deployment";
import {DummyQuickswapYNFTVault} from "../typechain";
import IUniswapV2Router02 from "../artifacts/contracts/interfaces/uniswapv2/IUniswapV2Router02.sol/IUniswapV2Router02.json";
import IUniswapV2Pair from "../artifacts/contracts/interfaces/uniswapv2/IUniswapV2Pair.sol/IUniswapV2Pair.json";
import IStakingDualRewards from "../artifacts/contracts/interfaces/quickswap/IStakingDualRewards.sol/IStakingDualRewards.json"
import IERC20 from "../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json";

chai.use(smock.matchers)

describe("DummyQuickswapYNFTVault", () => {
    let dummyQuickswapYnftVault: Contract;
    let uniswapRouter: FakeContract;
    let stakingRewardsMock: FakeContract;
    let dQuickMock: FakeContract;
    let pairMock: FakeContract;
    let token0Mock: FakeContract;
    let token1Mock: FakeContract;
    let WethMock: FakeContract;
    let signers: SignerWithAddress[];

    beforeEach(async () => {
        uniswapRouter = await smock.fake(IUniswapV2Router02.abi);
        pairMock = await smock.fake(IUniswapV2Pair.abi);
        stakingRewardsMock = await smock.fake(IStakingDualRewards.abi);
        dQuickMock = await smock.fake(IERC20.abi);

        token0Mock = await smock.fake(IERC20.abi);
        token1Mock = await smock.fake(IERC20.abi);
        WethMock = await smock.fake(IERC20.abi);
        await pairMock.token0.returns(token0Mock.address);
        await pairMock.token1.returns(token1Mock.address);
        await token0Mock.approve.returns(true);
        await token1Mock.approve.returns(true);
        await uniswapRouter.WETH.returns(WethMock.address);

        signers = await ethers.getSigners();

        dummyQuickswapYnftVault = await deployContract<DummyQuickswapYNFTVault>(
            "DummyQuickswapYNFTVault",
            [uniswapRouter.address, pairMock.address, stakingRewardsMock.address, dQuickMock.address, signers[1].address, signers[0].address, "", "", ""],
            undefined
        );
    });

    const MIN_AMOUNT = 101;
    const LIQUIDITY = 333;

    it("should return to deployer on removeVault", async () => {
        signers = await ethers.getSigners();
        const balanceBefore = await balance.current(signers[0].address);
        await signers[1].sendTransaction({to: dummyQuickswapYnftVault.address,value: ethers.utils.parseEther("1") });
        await dummyQuickswapYnftVault.removeVault();
        const balanceAfter = await balance.current(signers[0].address);
        expect(balanceBefore - balanceAfter).to.lt(0);
    });

    it("should withdraw assets from liquidity pool for all tokens", async () => {
        signers = await ethers.getSigners();
        const DEADLINE = 101;

        await uniswapRouter.swapExactETHForTokens.returns([MIN_AMOUNT, MIN_AMOUNT]);
        await uniswapRouter.swapExactTokensForETH.returns([MIN_AMOUNT, MIN_AMOUNT]);
        await uniswapRouter.removeLiquidity.returns([MIN_AMOUNT, MIN_AMOUNT]);
        await pairMock.approve.returns(true);
        await stakingRewardsMock.balanceOf.returns(LIQUIDITY);
        await uniswapRouter.addLiquidity.returns([MIN_AMOUNT, MIN_AMOUNT, LIQUIDITY]);

        await dummyQuickswapYnftVault.createYNFTForEther(MIN_AMOUNT, MIN_AMOUNT, 0, 0, DEADLINE, {value: ethers.utils.parseEther("100")});
        await dummyQuickswapYnftVault.createYNFTForEther(MIN_AMOUNT, MIN_AMOUNT, 0, 0, DEADLINE);

        await dummyQuickswapYnftVault.removeVault();

        expect(uniswapRouter.removeLiquidity).to.have.callCount(2);
        expect(uniswapRouter.removeLiquidity.getCall(0).args[0]).to.equal(token0Mock.address);
        expect(uniswapRouter.removeLiquidity.getCall(0).args[1]).to.equal(token1Mock.address);
        expect(uniswapRouter.removeLiquidity.getCall(0).args[2]).to.equal(LIQUIDITY);
        expect(uniswapRouter.removeLiquidity.getCall(0).args[3]).to.equal(0);
        expect(uniswapRouter.removeLiquidity.getCall(0).args[4]).to.equal(0);
        expect(uniswapRouter.removeLiquidity.getCall(0).args[5]).to.equal(signers[0].address);
        expect(uniswapRouter.swapExactTokensForETH.getCall(0).args[0]).to.equal(MIN_AMOUNT);
        expect(uniswapRouter.swapExactTokensForETH.getCall(0).args[1]).to.equal(0);
        expect(uniswapRouter.swapExactTokensForETH.getCall(0).args[2]).to.eql([token0Mock.address, WethMock.address]);
        expect(uniswapRouter.swapExactTokensForETH.getCall(0).args[3]).to.equal(dummyQuickswapYnftVault.address);
        expect(uniswapRouter.swapExactTokensForETH.getCall(1).args[0]).to.equal(MIN_AMOUNT);
        expect(uniswapRouter.swapExactTokensForETH.getCall(1).args[1]).to.equal(0);
        expect(uniswapRouter.swapExactTokensForETH.getCall(1).args[2]).to.eql([token1Mock.address, WethMock.address]);
        expect(uniswapRouter.swapExactTokensForETH.getCall(1).args[3]).to.equal(dummyQuickswapYnftVault.address);
    });

    it("should not withdraw asset from quickswap liquidity pool for already withdrawn token", async () => {
        signers = await ethers.getSigners();
        const DEADLINE = 101;

        await uniswapRouter.swapExactETHForTokens.returns([MIN_AMOUNT, MIN_AMOUNT]);
        await uniswapRouter.swapExactTokensForETH.returns([MIN_AMOUNT, MIN_AMOUNT]);
        await uniswapRouter.removeLiquidity.returns([MIN_AMOUNT, MIN_AMOUNT]);
        await pairMock.approve.returns(true);
        await stakingRewardsMock.balanceOf.returns(LIQUIDITY);
        await uniswapRouter.addLiquidity.returns([MIN_AMOUNT, MIN_AMOUNT, LIQUIDITY]);

        await dummyQuickswapYnftVault.createYNFTForEther(MIN_AMOUNT, MIN_AMOUNT, 0, 0, DEADLINE);
        await dummyQuickswapYnftVault.createYNFTForEther(MIN_AMOUNT, MIN_AMOUNT, 0, 0, DEADLINE);
        await dummyQuickswapYnftVault.withdrawToEther(0, MIN_AMOUNT, MIN_AMOUNT, 0, DEADLINE);

        await dummyQuickswapYnftVault.removeVault();
        expect(uniswapRouter.removeLiquidity).to.have.callCount(2);
        expect(uniswapRouter.swapExactTokensForETH).to.have.callCount(4);

        expect(uniswapRouter.removeLiquidity.getCall(0).args[0]).to.equal(token0Mock.address);
        expect(uniswapRouter.removeLiquidity.getCall(0).args[1]).to.equal(token1Mock.address);
        expect(uniswapRouter.removeLiquidity.getCall(0).args[2]).to.equal(Math.floor(LIQUIDITY/2));
        expect(uniswapRouter.removeLiquidity.getCall(0).args[3]).to.equal(MIN_AMOUNT);
        expect(uniswapRouter.removeLiquidity.getCall(0).args[4]).to.equal(MIN_AMOUNT);
        expect(uniswapRouter.removeLiquidity.getCall(0).args[5]).to.equal(dummyQuickswapYnftVault.address);

        expect(uniswapRouter.swapExactTokensForETH.getCall(2).args[0]).to.equal(MIN_AMOUNT);
        expect(uniswapRouter.swapExactTokensForETH.getCall(2).args[1]).to.equal(0);
        expect(uniswapRouter.swapExactTokensForETH.getCall(2).args[2]).to.eql([token0Mock.address, WethMock.address]);
        expect(uniswapRouter.swapExactTokensForETH.getCall(2).args[3]).to.equal(dummyQuickswapYnftVault.address);
        expect(uniswapRouter.swapExactTokensForETH.getCall(3).args[0]).to.equal(MIN_AMOUNT);
        expect(uniswapRouter.swapExactTokensForETH.getCall(3).args[1]).to.equal(0);
        expect(uniswapRouter.swapExactTokensForETH.getCall(3).args[2]).to.eql([token1Mock.address, WethMock.address]);
        expect(uniswapRouter.swapExactTokensForETH.getCall(3).args[3]).to.equal(dummyQuickswapYnftVault.address);
    });

});