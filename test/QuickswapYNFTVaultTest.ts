/* eslint-disable no-underscore-dangle */
import { expect } from "chai";
import chai from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContract} from "../utils/deployment";
import { QuickswapYNFTVault } from "../typechain";
import IUniswapV2Router02 from "../artifacts/contracts/interfaces/uniswapv2/IUniswapV2Router02.sol/IUniswapV2Router02.json";
import IUniswapV2Pair from "../artifacts/contracts/interfaces/uniswapv2/IUniswapV2Pair.sol/IUniswapV2Pair.json";
import IStakingDualRewards from "../artifacts/contracts/interfaces/quickswap/IStakingDualRewards.sol/IStakingDualRewards.json";
import IStakingRewards from "../artifacts/contracts/interfaces/quickswap/IStakingRewards.sol/IStakingRewards.json";
import IERC20 from "../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json";

// @ts-ignore
import { expectRevert } from "@openzeppelin/test-helpers";
import {FakeContract} from "@defi-wonderland/smock/dist/src/types";
import {smock} from "@defi-wonderland/smock";

chai.use(smock.matchers)

describe("QuickswapYNFTVault", () => {
  let quickswapYnftVault: Contract;
  let uniswapRouterMock: FakeContract;
  let uniswapPairMock: FakeContract;
  let stakingDualRewardsMock: FakeContract;
  let stakingRewardsMock: FakeContract;
  let dQuickMock: FakeContract;
  let token0Mock: FakeContract;
  let token1Mock: FakeContract;
  let tokenIn: FakeContract;

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    uniswapRouterMock = await smock.fake(IUniswapV2Router02.abi);
    uniswapPairMock = await smock.fake(IUniswapV2Pair.abi);
    stakingDualRewardsMock = await smock.fake(IStakingDualRewards.abi);
    stakingRewardsMock = await smock.fake(IStakingRewards.abi);
    dQuickMock = await smock.fake(IERC20.abi);
    token0Mock = await smock.fake(IERC20.abi);
    token1Mock = await smock.fake(IERC20.abi);

    await uniswapPairMock.token0.returns(token0Mock.address);
    await uniswapPairMock.token1.returns(token1Mock.address);
    tokenIn =  await smock.fake(IERC20.abi);

    quickswapYnftVault = await deployContract<QuickswapYNFTVault>(
      "QuickswapYNFTVault",
      [uniswapRouterMock.address, uniswapPairMock.address, stakingDualRewardsMock.address, stakingRewardsMock.address, dQuickMock.address, signers[1].address, signers[0].address, '', '', ''],
      undefined
    );
  });

  it('should revert setBeneficiary if no DEFAULT_ADMIN_ROLE rights', async () => {
    const signers = await ethers.getSigners();
    await expectRevert(quickswapYnftVault.connect(signers[1]).setBeneficiary(signers[2].address),
        "AccessControl: account ", signers[1].address, " is missing role 0x0000000000000000000000000000000000000000000000000000000000000000'");
  });

  it('should change beneficiary by setBeneficiary when role set', async () => {
    const signers = await ethers.getSigners();
    await quickswapYnftVault.grantRole("0x0000000000000000000000000000000000000000000000000000000000000000", signers[1].address)
    await quickswapYnftVault.connect(signers[1]).setBeneficiary(signers[2].address);
    expect(await quickswapYnftVault.beneficiary()).to.equal(signers[2].address);
  })

  it('should revert setFee if no DEFAULT_ADMIN_ROLE rights', async () => {
    const FEE = 12;
    const signers = await ethers.getSigners();
    await expectRevert(quickswapYnftVault.connect(signers[1]).setFee(FEE),
        "AccessControl: account ", signers[1].address, " is missing role 0x0000000000000000000000000000000000000000000000000000000000000000'");
  });

  it('should set proper fee by setFee when role set', async () => {
    const FEE = 12;
    const signers = await ethers.getSigners();
    await quickswapYnftVault.grantRole("0x0000000000000000000000000000000000000000000000000000000000000000", signers[1].address)
    await quickswapYnftVault.connect(signers[1]).setFee(FEE);
    expect(await quickswapYnftVault.feePerMile()).to.equal(FEE);
  });

  it('should revert setFee if fee above 100', async () => {
    const FEE = 101;
    await expectRevert(quickswapYnftVault.setFee(FEE), "Fee cannot be that much");
  });

  it('createYNFT', async () => {
    // let tokenIn: FakeContract;

    const amountIn = 1000;
    const amountOutMinFirstToken = 900;
    const amountOutMinSecondToken = 800;
    const amountMinLiqudityFirstToken = 100;
    const amountMinLiquditySecondToken = 100;
    const DEADLINE = 101;

    const AMOUNT_AFTER_SWAP1 = 300;

    await tokenIn.transferFrom.returns(true);
    await tokenIn.approve.returns(true);
    uniswapRouterMock.swapExactTokensForTokens.returns([amountIn, AMOUNT_AFTER_SWAP1]);
    await token0Mock.approve.returns(true);
    await token1Mock.approve.returns(true);
    await tokenIn.approve.returns(true);

    await quickswapYnftVault.createYNFT(tokenIn.address,
                                  amountIn,
                                  amountOutMinFirstToken,
                                  amountOutMinSecondToken,
                                  amountMinLiqudityFirstToken,
                                  amountMinLiquditySecondToken,
                                  DEADLINE);

    expect(uniswapRouterMock.swapExactTokensForTokens).to.have.callCount(2);
    expect(uniswapRouterMock.swapExactTokensForTokens).to.have.been.calledWith(497, amountOutMinFirstToken, [tokenIn.address, token0Mock.address], quickswapYnftVault.address, DEADLINE);
    expect(uniswapRouterMock.swapExactTokensForTokens).to.have.been.calledWith(497, amountOutMinSecondToken, [tokenIn.address, token1Mock.address], quickswapYnftVault.address, DEADLINE);
  });
});
