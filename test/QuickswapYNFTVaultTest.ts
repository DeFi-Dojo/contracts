/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line import/no-duplicates
import { expect } from "chai";
// eslint-disable-next-line import/no-duplicates
import chai from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
// @ts-ignore
import { expectRevert, balance } from "@openzeppelin/test-helpers";
import { FakeContract } from "@defi-wonderland/smock/dist/src/types";
import { smock } from "@defi-wonderland/smock";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { deployContract } from "../utils/deployment";
import { QuickswapYNFTVault } from "../typechain";
import IUniswapV2Router02 from "../artifacts/contracts/interfaces/uniswapv2/IUniswapV2Router02.sol/IUniswapV2Router02.json";
import IUniswapV2Pair from "../artifacts/contracts/interfaces/uniswapv2/IUniswapV2Pair.sol/IUniswapV2Pair.json";
import IStakingDualRewards from "../artifacts/contracts/interfaces/quickswap/IStakingDualRewards.sol/IStakingDualRewards.json";
import IERC20 from "../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json";

chai.use(smock.matchers);

describe("QuickswapYNFTVault", () => {
  let quickswapYnftVault: Contract;
  let uniswapRouterMock: FakeContract;
  let uniswapPairMock: FakeContract;
  let stakingDualRewardsMock: FakeContract;
  let dQuickMock: FakeContract;
  let wMaticMock: FakeContract;
  let token0Mock: FakeContract;
  let token1Mock: FakeContract;
  let tokenIn: FakeContract;
  let signers: SignerWithAddress[];

  const LIQUIDITY = 333;
  const DEADLINE = 101;

  beforeEach(async () => {
    uniswapRouterMock = await smock.fake(IUniswapV2Router02.abi);
    uniswapPairMock = await smock.fake(IUniswapV2Pair.abi);
    stakingDualRewardsMock = await smock.fake(IStakingDualRewards.abi);
    dQuickMock = await smock.fake(IERC20.abi);
    wMaticMock = await smock.fake(IERC20.abi);
    token0Mock = await smock.fake(IERC20.abi);
    token1Mock = await smock.fake(IERC20.abi);
    tokenIn = await smock.fake(IERC20.abi);

    signers = await ethers.getSigners();

    await uniswapPairMock.token0.returns(token0Mock.address);
    await uniswapPairMock.token1.returns(token1Mock.address);
    uniswapRouterMock.addLiquidity.returns([LIQUIDITY, LIQUIDITY, LIQUIDITY]);

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
    await expectRevert(
      quickswapYnftVault.connect(signers[1]).setBeneficiary(signers[2].address),
      "AccessControl: account ",
      signers[1].address,
      " is missing role 0x0000000000000000000000000000000000000000000000000000000000000000'"
    );
  });

  it("should change beneficiary by setBeneficiary when role set", async () => {
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
    await expectRevert(
      quickswapYnftVault.connect(signers[1]).setFee(FEE),
      "AccessControl: account ",
      signers[1].address,
      " is missing role 0x0000000000000000000000000000000000000000000000000000000000000000'"
    );
  });

  it("should set proper fee by setFee when role set", async () => {
    const FEE = 12;
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

  it("createYNFT for underlying tokens", async () => {
    const amountIn = 1000;
    const amountOutMinFirstToken = 900;
    const amountOutMinSecondToken = 800;
    const amountMinLiqudityFirstToken = 100;
    const amountMinLiquditySecondToken = 100;

    const AMOUNT_AFTER_SWAP1 = 300;

    await token0Mock.transferFrom.returns(true);
    await token0Mock.approve.returns(true);
    uniswapRouterMock.swapExactTokensForTokens.returns([
      amountIn,
      AMOUNT_AFTER_SWAP1,
    ]);
    await token0Mock.approve.returns(true);
    await token1Mock.approve.returns(true);
    await tokenIn.approve.returns(true);
    uniswapPairMock.approve.returns(true);

    await quickswapYnftVault.createYNFT(
      token0Mock.address,
      amountIn,
      amountOutMinFirstToken,
      amountOutMinSecondToken,
      amountMinLiqudityFirstToken,
      amountMinLiquditySecondToken,
      DEADLINE
    );

    expect(uniswapRouterMock.swapExactTokensForTokens).to.have.callCount(1);
    expect(uniswapRouterMock.swapExactTokensForTokens).to.have.been.calledWith(
      497,
      amountOutMinSecondToken,
      [token0Mock.address, token1Mock.address],
      quickswapYnftVault.address,
      DEADLINE
    );

    await token1Mock.transferFrom.returns(true);

    stakingDualRewardsMock.balanceOf.returns(LIQUIDITY);

    await quickswapYnftVault.createYNFT(
      token1Mock.address,
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
      [token1Mock.address, token0Mock.address],
      quickswapYnftVault.address,
      DEADLINE
    );
  });

  it("createYNFT should revert if underlying token not approved", async () => {
    const amountIn = 1000;
    const amountOutMinFirstToken = 900;
    const amountOutMinSecondToken = 800;
    const amountMinLiqudityFirstToken = 100;
    const amountMinLiquditySecondToken = 100;
    const AMOUNT_AFTER_SWAP1 = 300;

    await tokenIn.transferFrom.returns(true);
    await tokenIn.approve.returns(true);
    uniswapRouterMock.swapExactTokensForTokens.returns([
      amountIn,
      AMOUNT_AFTER_SWAP1,
    ]);

    await token0Mock.approve.returns(false);
    await token1Mock.approve.returns(true);

    await expectRevert(
      quickswapYnftVault.createYNFT(
        tokenIn.address,
        amountIn,
        amountOutMinFirstToken,
        amountOutMinSecondToken,
        amountMinLiqudityFirstToken,
        amountMinLiquditySecondToken,
        DEADLINE
      ),
      "approve failed."
    );

    await token0Mock.approve.returns(true);
    await token1Mock.approve.returns(false);

    await expectRevert(
      quickswapYnftVault.createYNFT(
        tokenIn.address,
        amountIn,
        amountOutMinFirstToken,
        amountOutMinSecondToken,
        amountMinLiqudityFirstToken,
        amountMinLiquditySecondToken,
        DEADLINE
      ),
      "approve failed."
    );
  });

  it("createYNFT should call swapExactTokensForTokens for both tokens", async () => {
    const amountIn = 1000;
    const amountOutMinFirstToken = 900;
    const amountOutMinSecondToken = 800;
    const amountMinLiqudityFirstToken = 100;
    const amountMinLiquditySecondToken = 100;

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

  it("createYNFTForEther should revert if one of tokens not approved", async () => {
    const amountIn = 1000;
    const amountOutMinFirstToken = 900;
    const amountOutMinSecondToken = 800;
    const amountMinLiqudityFirstToken = 100;
    const amountMinLiquditySecondToken = 100;

    const AMOUNT_AFTER_SWAP1 = 300;

    uniswapRouterMock.swapExactETHForTokens.returns([
      amountIn,
      AMOUNT_AFTER_SWAP1,
    ]);

    await token1Mock.approve.returns(false);
    uniswapPairMock.approve.returns(true);

    await expectRevert(
      quickswapYnftVault.createYNFTForEther(
        amountOutMinFirstToken,
        amountOutMinSecondToken,
        amountMinLiqudityFirstToken,
        amountMinLiquditySecondToken,
        DEADLINE
      ),
      "approve failed."
    );

    await token0Mock.approve.returns(false);
    await token1Mock.approve.returns(true);

    await expectRevert(
      quickswapYnftVault.createYNFTForEther(
        amountOutMinFirstToken,
        amountOutMinSecondToken,
        amountMinLiqudityFirstToken,
        amountMinLiquditySecondToken,
        DEADLINE
      ),
      "approve failed."
    );
  });

  it("createYNFTForEther should call swapExactETHForTokens for both tokens", async () => {
    const amountIn = 1000;
    const amountOutMinFirstToken = 900;
    const amountOutMinSecondToken = 800;
    const amountMinLiqudityFirstToken = 100;
    const amountMinLiquditySecondToken = 100;

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

  it("createYNFTForEther should omit one swap if WMATIC in pair", async () => {
    const amountIn = 1000;
    const amountOutMinFirstToken = 900;
    const amountOutMinSecondToken = 800;
    const amountMinLiqudityFirstToken = 100;
    const amountMinLiquditySecondToken = 100;

    const AMOUNT_AFTER_SWAP1 = 300;

    uniswapRouterMock.swapExactETHForTokens.returns([
      amountIn,
      AMOUNT_AFTER_SWAP1,
    ]);

    uniswapRouterMock.WETH.returns(token0Mock.address);

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

    expect(uniswapRouterMock.swapExactETHForTokens).to.have.callCount(1);
    expect(uniswapRouterMock.swapExactETHForTokens).to.have.been.calledWith(
      amountOutMinSecondToken,
      [token0Mock.address, token1Mock.address],
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

  it("withdrawToUnderlyingTokens should call removeLiquidityETH when WMATIC in pair", async () => {
    uniswapRouterMock.swapExactETHForTokens.returns([1000, 300]);
    await token0Mock.approve.returns(true);
    await token1Mock.approve.returns(true);
    uniswapPairMock.approve.returns(true);
    stakingDualRewardsMock.balanceOf.returns(LIQUIDITY);

    uniswapRouterMock.addLiquidityETH.returns([
      LIQUIDITY,
      LIQUIDITY,
      LIQUIDITY,
    ]);
    await uniswapRouterMock.WETH.returns(token0Mock.address);

    await quickswapYnftVault.createYNFTForEther(900, 800, 100, 100, 101);

    const TOKEN_ID = 0;
    const amountOutMinFirstToken = 900;
    const amountOutMinSecondToken = 800;

    await quickswapYnftVault.withdrawToUnderlyingTokens(
      TOKEN_ID,
      amountOutMinFirstToken,
      amountOutMinSecondToken,
      DEADLINE
    );

    expect(uniswapRouterMock.removeLiquidityETH).to.have.callCount(1);
    expect(uniswapRouterMock.removeLiquidityETH).to.have.been.calledWith(
      token1Mock.address,
      LIQUIDITY,
      800,
      900,
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

  it("withdrawToEther should call removeLiquidityETH if WMATIC in pair", async () => {
    uniswapRouterMock.swapExactETHForTokens.returns([1000, 300]);
    await token0Mock.approve.returns(true);
    await token1Mock.approve.returns(true);
    uniswapPairMock.approve.returns(true);
    stakingDualRewardsMock.balanceOf.returns(LIQUIDITY);
    uniswapRouterMock.addLiquidityETH.returns([
      LIQUIDITY,
      LIQUIDITY,
      LIQUIDITY,
    ]);
    await uniswapRouterMock.WETH.returns(token0Mock.address);
    await quickswapYnftVault.createYNFTForEther(900, 800, 100, 100, 101);

    const TOKEN_ID = 0;
    const amountOutMinFirstToken = 900;
    const amountOutMinSecondToken = 800;
    const amountOfEthMin = 1000;

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

    expect(uniswapRouterMock.removeLiquidityETH).to.have.callCount(1);
    expect(uniswapRouterMock.removeLiquidityETH).to.have.been.calledWith(
      token1Mock.address,
      LIQUIDITY,
      800,
      900,
      quickswapYnftVault.address,
      DEADLINE
    );
  });

  it("should not allow performance fee higher than 20%", async () => {
    await expectRevert(
      quickswapYnftVault.setPerformanceFee(201),
      "Performance Fee cannot be that much"
    );
  });

  it("depositTokens should swap and add liquidity", async () => {
    const amountIn = 1000;
    const amountOutMinFirstToken = 900;
    const amountOutMinSecondToken = 800;
    const amountMinLiqudityFirstToken = 100;
    const amountMinLiquditySecondToken = 100;
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

  it("depositTokens should revert if LP tokens deposited", async () => {
    await quickswapYnftVault.grantRole(
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("HARVESTER_ROLE")),
      signers[0].address
    );

    await expectRevert(
      quickswapYnftVault.depositTokens(
        uniswapPairMock.address,
        0,
        0,
        0,
        0,
        DEADLINE
      ),
      "Cannot deposit LP tokens"
    );
  });

  it("depositETH should swap and add liquidity", async () => {
    const amountOutMinFirstToken = 900;
    const amountOutMinSecondToken = 800;
    const amountMinLiqudityFirstToken = 100;
    const amountMinLiquditySecondToken = 100;
    const amountOfEthMin = 1000;

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

  it("should get reward and put liquidity to staking on claimRewards", async () => {
    const BALANCE1 = 200;
    const BALANCE2 = 300;
    const AMOUNT_AFTER_SWAP1 = 250;
    const AMOUNT_AFTER_SWAP2 = 350;

    await dQuickMock.balanceOf.returns(BALANCE1);
    await wMaticMock.balanceOf.returns(BALANCE2);

    await wMaticMock.approve.returns(true);
    await dQuickMock.approve.returns(true);
    await token0Mock.approve.returns(true);
    await token1Mock.approve.returns(true);
    await uniswapPairMock.approve.returns(true);

    uniswapRouterMock.swapExactTokensForTokens.returnsAtCall(0, [
      BALANCE1,
      AMOUNT_AFTER_SWAP1,
    ]);
    uniswapRouterMock.swapExactTokensForTokens.returnsAtCall(1, [
      BALANCE1,
      AMOUNT_AFTER_SWAP1,
    ]);
    uniswapRouterMock.swapExactTokensForTokens.returnsAtCall(2, [
      BALANCE2,
      AMOUNT_AFTER_SWAP2,
    ]);
    uniswapRouterMock.swapExactTokensForTokens.returnsAtCall(3, [
      BALANCE2,
      AMOUNT_AFTER_SWAP2,
    ]);

    await quickswapYnftVault.grantRole(
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("HARVESTER_ROLE")),
      signers[0].address
    );

    const now = Math.floor(Date.now() / 1000);
    const time = now + 3600;
    await ethers.provider.send("evm_setNextBlockTimestamp", [time]);

    await quickswapYnftVault.claimRewards();

    expect(stakingDualRewardsMock.getReward).to.have.callCount(1);
    expect(uniswapRouterMock.addLiquidity).to.have.callCount(2);
    expect(uniswapRouterMock.addLiquidity).to.have.been.calledWith(
      token0Mock.address,
      token1Mock.address,
      AMOUNT_AFTER_SWAP1,
      AMOUNT_AFTER_SWAP1,
      0,
      0,
      quickswapYnftVault.address,
      time + 3600
    );
    expect(uniswapRouterMock.addLiquidity).to.have.been.calledWith(
      token0Mock.address,
      token1Mock.address,
      AMOUNT_AFTER_SWAP2,
      AMOUNT_AFTER_SWAP2,
      0,
      0,
      quickswapYnftVault.address,
      time + 3600
    );
    expect(uniswapRouterMock.swapExactTokensForTokens).to.have.callCount(4);
  });

  async function createTwoYNfts(LIQUIDITY_REWARDS: number) {
    uniswapRouterMock.swapExactETHForTokens.returns([1000, 300]);
    await token0Mock.approve.returns(true);
    await token1Mock.approve.returns(true);
    uniswapPairMock.approve.returns(true);
    stakingDualRewardsMock.balanceOf.returnsAtCall(0, LIQUIDITY);
    stakingDualRewardsMock.balanceOf.returnsAtCall(
      1,
      LIQUIDITY + LIQUIDITY_REWARDS
    );
    stakingDualRewardsMock.balanceOf.returnsAtCall(
      2,
      2 * LIQUIDITY + LIQUIDITY_REWARDS
    );
    stakingDualRewardsMock.balanceOf.returnsAtCall(
      3,
      2 * LIQUIDITY + 2 * LIQUIDITY_REWARDS
    );

    // 1. yNFT bought
    await quickswapYnftVault
      .connect(signers[1])
      .createYNFTForEther(0, 0, 0, 0, DEADLINE);

    // LIQUIDITY_REWARDS amount of LP tokens earned...

    // 2. yNFT bought
    await quickswapYnftVault
      .connect(signers[1])
      .createYNFTForEther(0, 0, 0, 0, DEADLINE);
  }

  async function withdrawYNftToUnderlyingTokens(
    EXTRACTED_TOKEN_ID: number,
    EXPECTED_PAYOUT: number,
    PERFORMANCE_FEE: number
  ) {
    await quickswapYnftVault
      .connect(signers[1])
      .withdrawToUnderlyingTokens(EXTRACTED_TOKEN_ID, 0, 0, DEADLINE);

    expect(uniswapRouterMock.removeLiquidity).to.have.been.calledWith(
      token0Mock.address,
      token1Mock.address,
      EXPECTED_PAYOUT - PERFORMANCE_FEE,
      0,
      0,
      signers[1].address,
      DEADLINE
    );
    expect(uniswapRouterMock.removeLiquidity).to.have.been.calledWith(
      token0Mock.address,
      token1Mock.address,
      PERFORMANCE_FEE,
      0,
      0,
      signers[0].address,
      DEADLINE
    );
  }

  it("should calculate correct performance fee on withdrawToUnderlyingTokens when withdrawing first yNFT", async () => {
    const EXTRACTED_TOKEN_ID = 0;
    const LIQUIDITY_REWARDS = 111;
    const EXPECTED_PAYOUT = 508;
    const PERFORMANCE_FEE = 17;

    await createTwoYNfts(LIQUIDITY_REWARDS);

    await withdrawYNftToUnderlyingTokens(
      EXTRACTED_TOKEN_ID,
      EXPECTED_PAYOUT,
      PERFORMANCE_FEE
    );

    expect(uniswapRouterMock.removeLiquidity).to.have.callCount(2);

    const EXPECTED_SECOND_PAYOUT =
      2 * LIQUIDITY + 2 * LIQUIDITY_REWARDS - EXPECTED_PAYOUT;
    const SECOND_PERFORMANCE_FEE = 4;

    stakingDualRewardsMock.balanceOf.returnsAtCall(4, EXPECTED_SECOND_PAYOUT);

    await withdrawYNftToUnderlyingTokens(
      1,
      EXPECTED_SECOND_PAYOUT,
      SECOND_PERFORMANCE_FEE
    );

    expect(uniswapRouterMock.removeLiquidity).to.have.callCount(4);
  });

  it("should calculate correct performance fee on withdrawToUnderlyingTokens if WMATIC in pair", async () => {
    const EXTRACTED_TOKEN_ID = 0;
    const LIQUIDITY_REWARDS = 111;
    const EXPECTED_PAYOUT = 508;
    const PERFORMANCE_FEE = 17;
    await uniswapRouterMock.WETH.returns(token0Mock.address);
    uniswapRouterMock.addLiquidityETH.returns([
      LIQUIDITY,
      LIQUIDITY,
      LIQUIDITY,
    ]);

    await createTwoYNfts(LIQUIDITY_REWARDS);

    await quickswapYnftVault
      .connect(signers[1])
      .withdrawToUnderlyingTokens(EXTRACTED_TOKEN_ID, 0, 0, DEADLINE);

    expect(uniswapRouterMock.removeLiquidityETH).to.have.callCount(2);
    expect(uniswapRouterMock.removeLiquidityETH).to.have.been.calledWith(
      token1Mock.address,
      EXPECTED_PAYOUT - PERFORMANCE_FEE,
      0,
      0,
      signers[1].address,
      DEADLINE
    );
    expect(uniswapRouterMock.removeLiquidityETH).to.have.been.calledWith(
      token1Mock.address,
      PERFORMANCE_FEE,
      0,
      0,
      signers[0].address,
      DEADLINE
    );
  });

  it("should calculate correct performance fee on estimatePerformanceFee", async () => {
    const TOKEN_ID = 1;
    const LIQUIDITY_REWARDS = 111;
    const PAIR_TOTAL_LIQUIDITY = 10000;
    const TOKEN0_RESERVES = 200000;
    const TOKEN1_RESERVES = 300000;
    const EXPECTED_RESULT_STRING = "80,120";

    await createTwoYNfts(LIQUIDITY_REWARDS);
    uniswapPairMock.totalSupply.returns(PAIR_TOTAL_LIQUIDITY);
    uniswapPairMock.getReserves.returns([
      TOKEN0_RESERVES,
      TOKEN1_RESERVES,
      400,
    ]);
    expect(
      (await quickswapYnftVault.estimatePerformanceFee(TOKEN_ID)).toString()
    ).to.be.equal(EXPECTED_RESULT_STRING);
  });

  it("should calculate correct performance fee on withdrawToUnderlyingTokens when withdrawing second yNFT", async () => {
    const EXTRACTED_TOKEN_ID = 1;
    const LIQUIDITY_REWARDS = 111;
    const EXPECTED_PAYOUT = 379;
    const PERFORMANCE_FEE = 4;

    await createTwoYNfts(LIQUIDITY_REWARDS);

    await withdrawYNftToUnderlyingTokens(
      EXTRACTED_TOKEN_ID,
      EXPECTED_PAYOUT,
      PERFORMANCE_FEE
    );
    expect(uniswapRouterMock.removeLiquidity).to.have.callCount(2);

    const EXPECTED_SECOND_PAYOUT =
      2 * LIQUIDITY + 2 * LIQUIDITY_REWARDS - EXPECTED_PAYOUT;
    const SECOND_PERFORMANCE_FEE = 17;

    stakingDualRewardsMock.balanceOf.returnsAtCall(4, EXPECTED_SECOND_PAYOUT);

    await withdrawYNftToUnderlyingTokens(
      0,
      EXPECTED_SECOND_PAYOUT,
      SECOND_PERFORMANCE_FEE
    );
    expect(uniswapRouterMock.removeLiquidity).to.have.callCount(4);
  });

  function expectSwapToEthWithPerformanceFee(
    performanceFee: number,
    tokenAmount: number,
    path: string[],
    beneficiary: string,
    owner: string
  ) {
    expect(uniswapRouterMock.swapExactTokensForETH).to.have.been.calledWith(
      performanceFee,
      0,
      path,
      beneficiary,
      DEADLINE
    );
    expect(uniswapRouterMock.swapExactTokensForETH).to.have.been.calledWith(
      tokenAmount - performanceFee,
      0,
      path,
      owner,
      DEADLINE
    );
  }

  it("should calculate correct performance fee on withdrawToEther for first token", async () => {
    const EXTRACTED_TOKEN_ID = 0;
    const LIQUIDITY_REWARDS = 111;
    const EXPECTED_PAYOUT = 508;
    const PERFORMANCE_FEE = 7;
    const PERFORMANCE_FEE2 = 37;
    const AMOUNT_OUT_TOKEN = 215;
    const AMOUNT_OUT_TOKEN2 = 1100;
    const AMOUNT_OUT_ETH = 15002900;

    await createTwoYNfts(LIQUIDITY_REWARDS);

    await uniswapRouterMock.swapExactTokensForETH.returns([
      AMOUNT_OUT_TOKEN,
      AMOUNT_OUT_ETH,
    ]);
    await uniswapRouterMock.removeLiquidity.returns([
      AMOUNT_OUT_TOKEN,
      AMOUNT_OUT_TOKEN2,
    ]);

    await quickswapYnftVault
      .connect(signers[1])
      .withdrawToEther(EXTRACTED_TOKEN_ID, 0, 0, 0, DEADLINE);

    expect(stakingDualRewardsMock.withdraw).to.have.been.calledWith(
      EXPECTED_PAYOUT
    );
    expect(uniswapRouterMock.removeLiquidity).to.have.been.calledWith(
      token0Mock.address,
      token1Mock.address,
      EXPECTED_PAYOUT,
      0,
      0,
      quickswapYnftVault.address,
      DEADLINE
    );

    expectSwapToEthWithPerformanceFee(
      PERFORMANCE_FEE,
      AMOUNT_OUT_TOKEN,
      [token0Mock.address, "0x0000000000000000000000000000000000000000"],
      signers[0].address,
      signers[1].address
    );

    expectSwapToEthWithPerformanceFee(
      PERFORMANCE_FEE2,
      AMOUNT_OUT_TOKEN2,
      [token1Mock.address, "0x0000000000000000000000000000000000000000"],
      signers[0].address,
      signers[1].address
    );

    expect(uniswapRouterMock.swapExactTokensForETH).to.have.callCount(4);
  });

  it("should calculate correct performance fee on withdrawToEther for second token", async () => {
    const EXTRACTED_TOKEN_ID = 1;
    const LIQUIDITY_REWARDS = 111;
    const EXPECTED_PAYOUT = 379;
    const PERFORMANCE_FEE = 2;
    const PERFORMANCE_FEE2 = 13;
    const AMOUNT_OUT_TOKEN = 215;
    const AMOUNT_OUT_TOKEN2 = 1100;
    const AMOUNT_OUT_ETH = 15002900;

    await createTwoYNfts(LIQUIDITY_REWARDS);

    await uniswapRouterMock.swapExactTokensForETH.returns([
      AMOUNT_OUT_TOKEN,
      AMOUNT_OUT_ETH,
    ]);
    await uniswapRouterMock.removeLiquidity.returns([
      AMOUNT_OUT_TOKEN,
      AMOUNT_OUT_TOKEN2,
    ]);

    await quickswapYnftVault
      .connect(signers[1])
      .withdrawToEther(EXTRACTED_TOKEN_ID, 0, 0, 0, DEADLINE);

    expect(stakingDualRewardsMock.withdraw).to.have.been.calledWith(
      EXPECTED_PAYOUT
    );
    expect(uniswapRouterMock.removeLiquidity).to.have.been.calledWith(
      token0Mock.address,
      token1Mock.address,
      EXPECTED_PAYOUT,
      0,
      0,
      quickswapYnftVault.address,
      DEADLINE
    );

    expectSwapToEthWithPerformanceFee(
      PERFORMANCE_FEE,
      AMOUNT_OUT_TOKEN,
      [token0Mock.address, "0x0000000000000000000000000000000000000000"],
      signers[0].address,
      signers[1].address
    );

    expectSwapToEthWithPerformanceFee(
      PERFORMANCE_FEE2,
      AMOUNT_OUT_TOKEN2,
      [token1Mock.address, "0x0000000000000000000000000000000000000000"],
      signers[0].address,
      signers[1].address
    );

    expect(uniswapRouterMock.swapExactTokensForETH).to.have.callCount(4);
  });

  it("should calculate correct performance fee on withdrawToEther for WETH pair", async () => {
    const EXTRACTED_TOKEN_ID = 1;
    const LIQUIDITY_REWARDS = 111;
    const EXPECTED_PAYOUT = 379;
    const PERFORMANCE_FEE = 2;
    const PERFORMANCE_FEE2 = 13;
    const AMOUNT_OUT_TOKEN = 215;
    const AMOUNT_OUT_TOKEN2 = 1100;
    const AMOUNT_OUT_ETH = 15002900;

    await createTwoYNfts(LIQUIDITY_REWARDS);

    await signers[2].sendTransaction({
      to: quickswapYnftVault.address,
      value: AMOUNT_OUT_TOKEN,
    });

    await uniswapRouterMock.swapExactTokensForETH.returns([
      AMOUNT_OUT_TOKEN,
      AMOUNT_OUT_ETH,
    ]);
    await uniswapRouterMock.removeLiquidityETH.returns([
      AMOUNT_OUT_TOKEN2,
      AMOUNT_OUT_TOKEN,
    ]);

    await uniswapRouterMock.WETH.returns(token0Mock.address);

    const beneficiaryBalanceBefore = await balance.current(signers[0].address);
    const vaultBalanceBefore = await balance.current(
      quickswapYnftVault.address
    );
    await quickswapYnftVault
      .connect(signers[1])
      .withdrawToEther(EXTRACTED_TOKEN_ID, 0, 0, 0, DEADLINE);
    const beneficiaryBalanceAfter = await balance.current(signers[0].address);
    const vaultBalanceAfter = await balance.current(quickswapYnftVault.address);
    expect(
      beneficiaryBalanceAfter.sub(beneficiaryBalanceBefore).toString()
    ).to.equal(PERFORMANCE_FEE.toString());
    expect(vaultBalanceBefore.sub(vaultBalanceAfter).toString()).to.equal(
      AMOUNT_OUT_TOKEN.toString()
    );
    expect(
      (await balance.current(quickswapYnftVault.address)).toString()
    ).to.equal("0");

    expect(stakingDualRewardsMock.withdraw).to.have.been.calledWith(
      EXPECTED_PAYOUT
    );

    expect(uniswapRouterMock.removeLiquidityETH).to.have.been.calledWith(
      token1Mock.address,
      EXPECTED_PAYOUT,
      0,
      0,
      quickswapYnftVault.address,
      DEADLINE
    );
    expectSwapToEthWithPerformanceFee(
      PERFORMANCE_FEE2,
      AMOUNT_OUT_TOKEN2,
      [token1Mock.address, token0Mock.address],
      signers[0].address,
      signers[1].address
    );
  });

  it("should return earned amounts from stakingDualRewards on getRewardsToClaim", async () => {
    const EARNED_A = 1200;
    const EARNED_B = 2700;
    stakingDualRewardsMock.earnedA.returns(EARNED_A);
    stakingDualRewardsMock.earnedB.returns(EARNED_B);
    const earned = await quickswapYnftVault.getRewardsToClaim();
    expect(earned.toString()).to.be.equal(
      [
        ethers.BigNumber.from(EARNED_A),
        ethers.BigNumber.from(EARNED_B),
      ].toString()
    );
  });
});
