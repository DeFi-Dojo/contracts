import chai, { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { smock } from "@defi-wonderland/smock";
import { FakeContract } from "@defi-wonderland/smock/dist/src/types";
// @ts-ignore
import { balance } from "@openzeppelin/test-helpers";
import { deployContract } from "../utils/deployment";
import { DummyAaveYNFTVault } from "../typechain";
import IUniswapV2Router02 from "../artifacts/contracts/interfaces/uniswapv2/IUniswapV2Router02.sol/IUniswapV2Router02.json";
import IAToken from "../artifacts/contracts/interfaces/aave/IAToken.sol/IAToken.json";
import IAaveIncentivesController from "../artifacts/contracts/interfaces/aave/IAaveIncentivesController.sol/IAaveIncentivesController.json";
import IERC20 from "../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json";
import ILendingPool from "../artifacts/contracts/interfaces/aave/ILendingPool.sol/ILendingPool.json";

chai.use(smock.matchers);

describe("DummyAaveYNFTVault", () => {
  let dummyAaveYnftVault: Contract;
  let uniswapRouter: FakeContract;
  let aToken: FakeContract;
  let aaveIncentivesController: FakeContract;
  let rewardToken: FakeContract;
  let underlyingToken: FakeContract;
  let pool: FakeContract;
  let signers: SignerWithAddress[];

  beforeEach(async () => {
    uniswapRouter = await smock.fake(IUniswapV2Router02.abi);
    aToken = await smock.fake(IAToken.abi);
    aaveIncentivesController = await smock.fake(IAaveIncentivesController.abi);

    rewardToken = await smock.fake(IERC20.abi);
    underlyingToken = await smock.fake(IERC20.abi);
    pool = await smock.fake(ILendingPool.abi);

    aaveIncentivesController.REWARD_TOKEN.returns(rewardToken.address);
    aToken.UNDERLYING_ASSET_ADDRESS.returns(underlyingToken.address);
    aToken.POOL.returns(pool.address);

    signers = await ethers.getSigners();

    dummyAaveYnftVault = await deployContract<DummyAaveYNFTVault>(
      "DummyAaveYNFTVault",
      [
        uniswapRouter.address,
        aToken.address,
        aaveIncentivesController.address,
        signers[1].address,
        signers[0].address,
        "",
        "",
        "",
      ],
      undefined
    );
  });

  const MIN_AMOUNT = 101;
  const SWAPPED_AMOUNT = 246000;
  const ATOKEN_BALANCE = 1000;
  const POOL_WITHDRAW_VALUE = 100;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  async function init_createWithdrawYNFT_mocks() {
    const WethMock = await smock.fake(IERC20.abi);
    await uniswapRouter.WETH.returns(WethMock.address);
    await uniswapRouter.swapExactETHForTokens.returns([
      MIN_AMOUNT,
      SWAPPED_AMOUNT,
    ]);
    await underlyingToken.transferFrom.returns(true);
    await underlyingToken.approve.returns(true);
    await aToken.balanceOf.returns(ATOKEN_BALANCE);
    await pool.deposit.returns();

    pool.withdraw.returns(POOL_WITHDRAW_VALUE);
    await uniswapRouter.swapExactTokensForETH.returns([MIN_AMOUNT, MIN_AMOUNT]);
  }

  it("should return to deployer on removeVault", async () => {
    signers = await ethers.getSigners();
    const balanceBefore = await balance.current(signers[0].address);
    await signers[1].sendTransaction({
      to: dummyAaveYnftVault.address,
      value: ethers.utils.parseEther("1"),
    });
    await dummyAaveYnftVault.removeVault();
    const balanceAfter = await balance.current(signers[0].address);
    expect(balanceBefore - balanceAfter).to.lt(0);
  });

  it("should withdraw assets from lending pool for all tokens", async () => {
    signers = await ethers.getSigners();
    const DEADLINE = 101;

    init_createWithdrawYNFT_mocks();

    await dummyAaveYnftVault.createYNFTForEther(MIN_AMOUNT, DEADLINE, {
      value: ethers.utils.parseEther("100"),
    });
    await dummyAaveYnftVault.createYNFTForEther(MIN_AMOUNT, DEADLINE);

    await dummyAaveYnftVault.removeVault();
    expect(pool.withdraw).to.have.been.calledWith(
      underlyingToken.address,
      ATOKEN_BALANCE,
      dummyAaveYnftVault.address
    );
    expect(pool.withdraw).to.have.callCount(2);
    expect(uniswapRouter.swapExactTokensForETH).to.have.callCount(1);
    expect(uniswapRouter.swapExactTokensForETH.getCall(0).args[0]).to.be.equal(
      2 * POOL_WITHDRAW_VALUE
    );
    expect(uniswapRouter.swapExactTokensForETH.getCall(0).args[1]).to.be.equal(
      0
    );
    expect(uniswapRouter.swapExactTokensForETH.getCall(0).args[3]).to.be.equal(
      dummyAaveYnftVault.address
    );
  });

  it("should not withdraw asset from aave lending pool for already withdrawn token", async () => {
    signers = await ethers.getSigners();
    const DEADLINE = 101;

    await uniswapRouter.swapExactETHForTokens.returns([MIN_AMOUNT, MIN_AMOUNT]);
    await underlyingToken.approve.returns(true);
    await uniswapRouter.swapExactTokensForETH.returns([MIN_AMOUNT, MIN_AMOUNT]);

    aToken.balanceOf.returnsAtCall(0, 0);
    aToken.balanceOf.returnsAtCall(1, MIN_AMOUNT);
    aToken.balanceOf.returnsAtCall(2, MIN_AMOUNT);
    aToken.balanceOf.returnsAtCall(3, 2 * MIN_AMOUNT);
    aToken.balanceOf.returnsAtCall(4, 2 * MIN_AMOUNT);

    await dummyAaveYnftVault.createYNFTForEther(MIN_AMOUNT, DEADLINE, {
      value: ethers.utils.parseEther("0.001"),
    });
    await dummyAaveYnftVault.createYNFTForEther(MIN_AMOUNT, DEADLINE, {
      value: ethers.utils.parseEther("0.001"),
    });
    await dummyAaveYnftVault.withdrawToEther(0, MIN_AMOUNT, DEADLINE);
    expect(pool.withdraw).to.have.callCount(1);
    expect(aToken.balanceOf).to.have.callCount(5);

    await dummyAaveYnftVault.removeVault();
    expect(pool.withdraw).to.have.been.calledWith(
      underlyingToken.address,
      MIN_AMOUNT,
      dummyAaveYnftVault.address
    );
    expect(pool.withdraw).to.have.callCount(2);
    expect(uniswapRouter.swapExactTokensForETH).to.have.callCount(1);
  });
});
