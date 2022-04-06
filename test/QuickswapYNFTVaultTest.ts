/* eslint-disable no-underscore-dangle */
import { expect } from "chai";
import chai from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContract } from "../utils/deployment";
import { QuickswapYNFTVault } from "../typechain";
import IUniswapV2Router02 from "../artifacts/contracts/interfaces/uniswapv2/IUniswapV2Router02.sol/IUniswapV2Router02.json";
import IUniswapV2Pair from "../artifacts/contracts/interfaces/uniswapv2/IUniswapV2Pair.sol/IUniswapV2Pair.json";
import IStakingDualRewards from "../artifacts/contracts/interfaces/quickswap/IStakingDualRewards.sol/IStakingDualRewards.json";
import IStakingRewards from "../artifacts/contracts/interfaces/quickswap/IStakingRewards.sol/IStakingRewards.json";
import IERC20 from "../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json";

// @ts-ignore
import { expectRevert } from "@openzeppelin/test-helpers";
import { FakeContract } from "@defi-wonderland/smock/dist/src/types";
import { smock } from "@defi-wonderland/smock";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

chai.use(smock.matchers);

describe("QuickswapYNFTVault", () => {
  let quickswapYnftVault: Contract;
  let uniswapRouterMock: FakeContract;
  let uniswapPairMock: FakeContract;
  let stakingDualRewardsMock: FakeContract;
  let stakingRewardsMock: FakeContract;
  let dQuickMock: FakeContract;
  let wMaticMock: FakeContract;
  let token0Mock: FakeContract;
  let token1Mock: FakeContract;
  let tokenIn: FakeContract;
  let signers: SignerWithAddress[];

  const LIQUIDITY = 333;

  beforeEach(async () => {
    uniswapRouterMock = await smock.fake(IUniswapV2Router02.abi);
    uniswapPairMock = await smock.fake(IUniswapV2Pair.abi);
    stakingDualRewardsMock = await smock.fake(IStakingDualRewards.abi);
    stakingRewardsMock = await smock.fake(IStakingRewards.abi);
    dQuickMock = await smock.fake(IERC20.abi);
    wMaticMock = await smock.fake(IERC20.abi);
    token0Mock = await smock.fake(IERC20.abi);
    token1Mock = await smock.fake(IERC20.abi);
    tokenIn = await smock.fake(IERC20.abi);

    await uniswapPairMock.token0.returns(token0Mock.address);
    await uniswapPairMock.token1.returns(token1Mock.address);
    uniswapRouterMock.addLiquidity.returns([LIQUIDITY, LIQUIDITY, LIQUIDITY]);

    signers = await ethers.getSigners();

    quickswapYnftVault = await deployContract<QuickswapYNFTVault>(
      "QuickswapYNFTVault",
      [
        uniswapRouterMock.address,
        uniswapPairMock.address,
        stakingDualRewardsMock.address,
        dQuickMock.address,
        wMaticMock.address,
        signers[1].address,
        signers[0].address,
        "",
        "",
        "",
      ],
      undefined
    );
  });

  it("should revert setBeneficiary if no DEFAULT_ADMIN_ROLE rights", async () => {
    const signers = await ethers.getSigners();
    await expectRevert(
      quickswapYnftVault.connect(signers[1]).setBeneficiary(signers[2].address),
      "AccessControl: account ",
      signers[1].address,
      " is missing role 0x0000000000000000000000000000000000000000000000000000000000000000'"
    );
  });

  it("should change beneficiary by setBeneficiary when role set", async () => {
    const signers = await ethers.getSigners();
    await quickswapYnftVault.grantRole(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      signers[1].address
    );
    await quickswapYnftVault
      .connect(signers[1])
      .setBeneficiary(signers[2].address);
    expect(await quickswapYnftVault.beneficiary()).to.equal(signers[2].address);
  });

  it("should revert setFee if no DEFAULT_ADMIN_ROLE rights", async () => {
    const FEE = 12;
    const signers = await ethers.getSigners();
    await expectRevert(
      quickswapYnftVault.connect(signers[1]).setFee(FEE),
      "AccessControl: account ",
      signers[1].address,
      " is missing role 0x0000000000000000000000000000000000000000000000000000000000000000'"
    );
  });

  it("should set proper fee by setFee when role set", async () => {
    const FEE = 12;
    const signers = await ethers.getSigners();
    await quickswapYnftVault.grantRole(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      signers[1].address
    );
    await quickswapYnftVault.connect(signers[1]).setFee(FEE);
    expect(await quickswapYnftVault.feePerMile()).to.equal(FEE);
  });

  it("should revert setFee if fee above 100", async () => {
    const FEE = 101;
    await expectRevert(
      quickswapYnftVault.setFee(FEE),
      "Fee cannot be that much"
    );
  });

  it("createYNFT should call swapExactTokensForTokens for both tokens", async () => {
    const amountIn = 1000;
    const amountOutMinFirstToken = 900;
    const amountOutMinSecondToken = 800;
    const amountMinLiqudityFirstToken = 100;
    const amountMinLiquditySecondToken = 100;
    const DEADLINE = 101;

    const AMOUNT_AFTER_SWAP1 = 300;

    await tokenIn.transferFrom.returns(true);
    await tokenIn.approve.returns(true);
    uniswapRouterMock.swapExactTokensForTokens.returns([
      amountIn,
      AMOUNT_AFTER_SWAP1,
    ]);
    await token0Mock.approve.returns(true);
    await token1Mock.approve.returns(true);
    await tokenIn.approve.returns(true);
    uniswapPairMock.approve.returns(true);

    await quickswapYnftVault.createYNFT(
      tokenIn.address,
      amountIn,
      amountOutMinFirstToken,
      amountOutMinSecondToken,
      amountMinLiqudityFirstToken,
      amountMinLiquditySecondToken,
      DEADLINE
    );

    expect(uniswapRouterMock.swapExactTokensForTokens).to.have.callCount(2);
    expect(uniswapRouterMock.swapExactTokensForTokens).to.have.been.calledWith(
      497,
      amountOutMinFirstToken,
      [tokenIn.address, token0Mock.address],
      quickswapYnftVault.address,
      DEADLINE
    );
    expect(uniswapRouterMock.swapExactTokensForTokens).to.have.been.calledWith(
      497,
      amountOutMinSecondToken,
      [tokenIn.address, token1Mock.address],
      quickswapYnftVault.address,
      DEADLINE
    );
  });

  it("createYNFTForEther should call swapExactETHForTokens for both tokens", async () => {
    const amountIn = 1000;
    const amountOutMinFirstToken = 900;
    const amountOutMinSecondToken = 800;
    const amountMinLiqudityFirstToken = 100;
    const amountMinLiquditySecondToken = 100;
    const DEADLINE = 101;

    const AMOUNT_AFTER_SWAP1 = 300;

    uniswapRouterMock.swapExactETHForTokens.returns([
      amountIn,
      AMOUNT_AFTER_SWAP1,
    ]);
    await token0Mock.approve.returns(true);
    await token1Mock.approve.returns(true);
    uniswapPairMock.approve.returns(true);

    await quickswapYnftVault.createYNFTForEther(
      amountOutMinFirstToken,
      amountOutMinSecondToken,
      amountMinLiqudityFirstToken,
      amountMinLiquditySecondToken,
      DEADLINE
    );

    expect(uniswapRouterMock.swapExactETHForTokens).to.have.callCount(2);
    expect(uniswapRouterMock.swapExactETHForTokens).to.have.been.calledWith(
      amountOutMinFirstToken,
      ["0x0000000000000000000000000000000000000000", token0Mock.address],
      quickswapYnftVault.address,
      DEADLINE
    );
    expect(uniswapRouterMock.swapExactETHForTokens).to.have.been.calledWith(
      amountOutMinSecondToken,
      ["0x0000000000000000000000000000000000000000", token1Mock.address],
      quickswapYnftVault.address,
      DEADLINE
    );
  });

  it("withdrawToUnderlyingTokens should call removeLiquidity", async () => {
    uniswapRouterMock.swapExactETHForTokens.returns([1000, 300]);
    await token0Mock.approve.returns(true);
    await token1Mock.approve.returns(true);
    uniswapPairMock.approve.returns(true);
    stakingDualRewardsMock.balanceOf.returns(LIQUIDITY);
    await quickswapYnftVault.createYNFTForEther(900, 800, 100, 100, 101);

    const TOKEN_ID = 0;
    const amountOutMinFirstToken = 900;
    const amountOutMinSecondToken = 800;
    const DEADLINE = 101;
    const signers = await ethers.getSigners();

    await quickswapYnftVault.withdrawToUnderlyingTokens(
      TOKEN_ID,
      amountOutMinFirstToken,
      amountOutMinSecondToken,
      DEADLINE
    );

    expect(uniswapRouterMock.removeLiquidity).to.have.callCount(1);
    expect(uniswapRouterMock.removeLiquidity).to.have.been.calledWith(
      token0Mock.address,
      token1Mock.address,
      LIQUIDITY,
      900,
      800,
      signers[0].address,
      DEADLINE
    );
  });

  it("withdrawToUnderlyingTokens should revert if not called by owner", async () => {
    uniswapRouterMock.swapExactETHForTokens.returns([1000, 300]);
    await token0Mock.approve.returns(true);
    await token1Mock.approve.returns(true);
    uniswapPairMock.approve.returns(true);
    await quickswapYnftVault.createYNFTForEther(900, 800, 100, 100, 101);

    const TOKEN_ID = 0;
    const amountOutMinFirstToken = 900;
    const amountOutMinSecondToken = 800;
    const DEADLINE = 101;
    const signers = await ethers.getSigners();

    await expectRevert(
      quickswapYnftVault
        .connect(signers[1])
        .withdrawToUnderlyingTokens(
          TOKEN_ID,
          amountOutMinFirstToken,
          amountOutMinSecondToken,
          DEADLINE
        ),
      "Sender is not owner of the NFT"
    );
  });

  it("withdrawToEther should call removeLiquidity and swap to ether", async () => {
    uniswapRouterMock.swapExactETHForTokens.returns([1000, 300]);
    await token0Mock.approve.returns(true);
    await token1Mock.approve.returns(true);
    uniswapPairMock.approve.returns(true);
    stakingDualRewardsMock.balanceOf.returns(LIQUIDITY);
    await quickswapYnftVault.createYNFTForEther(900, 800, 100, 100, 101);

    const TOKEN_ID = 0;
    const amountOutMinFirstToken = 900;
    const amountOutMinSecondToken = 800;
    const amountOfEthMin = 1000;
    const DEADLINE = 101;
    const signers = await ethers.getSigners();

    await uniswapRouterMock.swapExactTokensForETH.returns([
      amountOutMinFirstToken,
      amountOfEthMin,
    ]);

    await quickswapYnftVault.withdrawToEther(
      TOKEN_ID,
      amountOutMinFirstToken,
      amountOutMinSecondToken,
      amountOfEthMin,
      DEADLINE
    );

    expect(uniswapRouterMock.removeLiquidity).to.have.callCount(1);
    expect(uniswapRouterMock.swapExactTokensForETH).to.have.callCount(2);
    expect(uniswapRouterMock.removeLiquidity).to.have.been.calledWith(
      token0Mock.address,
      token1Mock.address,
      LIQUIDITY,
      900,
      800,
      quickswapYnftVault.address,
      DEADLINE
    );
    expect(uniswapRouterMock.swapExactTokensForETH).to.have.been.calledWith(
      0,
      amountOfEthMin / 2,
      [token0Mock.address, "0x0000000000000000000000000000000000000000"],
      signers[0].address,
      DEADLINE
    );
    expect(uniswapRouterMock.swapExactTokensForETH).to.have.been.calledWith(
      0,
      amountOfEthMin / 2,
      [token1Mock.address, "0x0000000000000000000000000000000000000000"],
      signers[0].address,
      DEADLINE
    );
  });

  it("depositTokens should swap and add liquidity", async () => {
    const amountIn = 1000;
    const amountOutMinFirstToken = 900;
    const amountOutMinSecondToken = 800;
    const amountMinLiqudityFirstToken = 100;
    const amountMinLiquditySecondToken = 100;
    const DEADLINE = 101;
    const AMOUNT_AFTER_SWAP1 = 300;

    await quickswapYnftVault.grantRole(
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("HARVESTER_ROLE")),
      signers[0].address
    );
    token0Mock.approve.returns(true);
    token1Mock.approve.returns(true);
    uniswapPairMock.approve.returns(true);
    tokenIn.approve.returns(true);
    uniswapRouterMock.swapExactTokensForTokens.returns([
      amountIn,
      AMOUNT_AFTER_SWAP1,
    ]);

    await quickswapYnftVault.depositTokens(
      tokenIn.address,
      amountOutMinFirstToken,
      amountOutMinSecondToken,
      amountMinLiqudityFirstToken,
      amountMinLiquditySecondToken,
      DEADLINE
    );

    expect(uniswapRouterMock.swapExactTokensForTokens).to.have.callCount(2);
    expect(uniswapRouterMock.swapExactTokensForTokens).to.have.been.calledWith(
      0,
      amountOutMinFirstToken,
      [tokenIn.address, token0Mock.address],
      quickswapYnftVault.address,
      DEADLINE
    );
    expect(uniswapRouterMock.swapExactTokensForTokens).to.have.been.calledWith(
      0,
      amountOutMinSecondToken,
      [tokenIn.address, token1Mock.address],
      quickswapYnftVault.address,
      DEADLINE
    );

    expect(uniswapRouterMock.addLiquidity).to.have.callCount(1);
    expect(uniswapRouterMock.addLiquidity).to.have.been.calledWith(
      token0Mock.address,
      token1Mock.address,
      AMOUNT_AFTER_SWAP1,
      AMOUNT_AFTER_SWAP1,
      amountMinLiqudityFirstToken,
      amountMinLiquditySecondToken,
      quickswapYnftVault.address,
      DEADLINE
    );
    expect(stakingDualRewardsMock.stake).to.have.been.calledWith(LIQUIDITY);
  });

  it("depositETH should swap and add liquidity", async () => {
    const amountOutMinFirstToken = 900;
    const amountOutMinSecondToken = 800;
    const amountMinLiqudityFirstToken = 100;
    const amountMinLiquditySecondToken = 100;
    const amountOfEthMin = 1000;
    const DEADLINE = 101;

    await quickswapYnftVault.grantRole(
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("HARVESTER_ROLE")),
      signers[0].address
    );
    token0Mock.approve.returns(true);
    token1Mock.approve.returns(true);
    uniswapPairMock.approve.returns(true);
    tokenIn.approve.returns(true);
    await uniswapRouterMock.swapExactETHForTokens.returns([
      amountOutMinFirstToken,
      amountOfEthMin,
    ]);

    await quickswapYnftVault.depositETH(
      amountOutMinFirstToken,
      amountOutMinSecondToken,
      amountMinLiqudityFirstToken,
      amountMinLiquditySecondToken,
      DEADLINE
    );

    expect(uniswapRouterMock.swapExactETHForTokens).to.have.callCount(2);
    expect(uniswapRouterMock.swapExactETHForTokens).to.have.been.calledWith(
      amountOutMinFirstToken,
      ["0x0000000000000000000000000000000000000000", token0Mock.address],
      quickswapYnftVault.address,
      DEADLINE
    );
    expect(uniswapRouterMock.swapExactETHForTokens).to.have.been.calledWith(
      amountOutMinSecondToken,
      ["0x0000000000000000000000000000000000000000", token1Mock.address],
      quickswapYnftVault.address,
      DEADLINE
    );
    expect(uniswapRouterMock.addLiquidity).to.have.callCount(1);
    expect(uniswapRouterMock.addLiquidity).to.have.been.calledWith(
      token0Mock.address,
      token1Mock.address,
      amountOfEthMin,
      amountOfEthMin,
      amountMinLiqudityFirstToken,
      amountMinLiquditySecondToken,
      quickswapYnftVault.address,
      DEADLINE
    );
    expect(stakingDualRewardsMock.stake).to.have.been.calledWith(LIQUIDITY);
  });

  it("should calculate correct balance after claiming staking rewards", async () => {
    const amountIn = 1000;
    const amountOutMinFirstToken = 900;
    const amountOutMinSecondToken = 800;
    const amountMinLiqudityFirstToken = 100;
    const amountMinLiquditySecondToken = 100;
    const DEADLINE = 101;
    const AMOUNT_AFTER_SWAP1 = 300;

    await quickswapYnftVault.grantRole(
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("HARVESTER_ROLE")),
      signers[0].address
    );

    await tokenIn.transferFrom.returns(true);
    await tokenIn.approve.returns(true);
    uniswapRouterMock.swapExactTokensForTokens.returns([
      amountIn,
      AMOUNT_AFTER_SWAP1,
    ]);
    await token0Mock.approve.returns(true);
    await token1Mock.approve.returns(true);
    await tokenIn.approve.returns(true);
    uniswapPairMock.approve.returns(true);
    stakingDualRewardsMock.balanceOf.returnsAtCall(0, LIQUIDITY);
    stakingDualRewardsMock.balanceOf.returnsAtCall(1, LIQUIDITY);
    stakingDualRewardsMock.balanceOf.returnsAtCall(2, LIQUIDITY);
    stakingDualRewardsMock.balanceOf.returnsAtCall(3, LIQUIDITY);
    stakingDualRewardsMock.balanceOf.returnsAtCall(
      4,
      Math.floor(LIQUIDITY / 2)
    );

    await quickswapYnftVault
      .connect(signers[0])
      .createYNFT(
        tokenIn.address,
        amountIn,
        amountOutMinFirstToken,
        amountOutMinSecondToken,
        amountMinLiqudityFirstToken,
        amountMinLiquditySecondToken,
        DEADLINE
      );

    await quickswapYnftVault.getRewardLPMining();

    await quickswapYnftVault.depositTokens(
      tokenIn.address,
      amountOutMinFirstToken,
      amountOutMinSecondToken,
      amountMinLiqudityFirstToken,
      amountMinLiquditySecondToken,
      DEADLINE
    );

    await quickswapYnftVault
      .connect(signers[1])
      .createYNFT(
        tokenIn.address,
        amountIn,
        amountOutMinFirstToken,
        amountOutMinSecondToken,
        amountMinLiqudityFirstToken,
        amountMinLiquditySecondToken,
        DEADLINE
      );

    // expect(stakingDualRewardsMock.balanceOf).to.have.callCount(3);
    expect(stakingDualRewardsMock.getReward).to.have.callCount(1);
    expect(await quickswapYnftVault.balanceOf(0)).to.equal(LIQUIDITY);
    expect(await quickswapYnftVault.balanceOf(1)).to.equal(
      Math.floor(LIQUIDITY)
    );

    await quickswapYnftVault
      .connect(signers[0])
      .withdrawToUnderlyingTokens(
        0,
        amountOutMinFirstToken,
        amountOutMinSecondToken,
        DEADLINE
      );
    // expect(stakingDualRewardsMock.balanceOf).to.have.callCount(2);
    expect(uniswapRouterMock.removeLiquidity).to.have.been.calledWith(
      token0Mock.address,
      token1Mock.address,
      Math.floor(LIQUIDITY / 2),
      amountOutMinFirstToken,
      amountOutMinSecondToken,
      signers[0].address,
      DEADLINE
    );

    await quickswapYnftVault
      .connect(signers[1])
      .withdrawToUnderlyingTokens(
        1,
        amountOutMinFirstToken,
        amountOutMinSecondToken,
        DEADLINE
      );
    expect(uniswapRouterMock.removeLiquidity).to.have.been.calledWith(
      token0Mock.address,
      token1Mock.address,
      Math.floor(LIQUIDITY / 2),
      amountOutMinFirstToken,
      amountOutMinSecondToken,
      signers[1].address,
      DEADLINE
    );
  });

  it("should transfer tokens to beneficiary on getRewardLPMining called", async () => {
    const BALANCE1 = 200;
    const BALANCE2 = 300;
    const BENEFICIARY = signers[0].address;

    await dQuickMock.balanceOf.returns(BALANCE1);
    await wMaticMock.balanceOf.returns(BALANCE2);

    await quickswapYnftVault.grantRole(
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("HARVESTER_ROLE")),
      signers[0].address
    );
    await quickswapYnftVault.getRewardLPMining();
    expect(stakingDualRewardsMock.getReward).to.have.callCount(1);
    expect(dQuickMock.transfer).to.have.been.calledWith(BENEFICIARY, BALANCE1);
    expect(wMaticMock.transfer).to.have.been.calledWith(BENEFICIARY, BALANCE2);
  });

  it("should calculate correct performance fee on withdrawToUnderlyingTokens", async () => {

  });

  it("should calculate correct performance fee on withdrawToEther", async () => {

  });
});
