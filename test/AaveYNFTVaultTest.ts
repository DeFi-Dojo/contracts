/* eslint-disable no-underscore-dangle */
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContract, waitForReceipt } from "../utils/deployment";
import { AaveYNFTVault } from "../typechain";
import IUniswapV2Router02 from "../artifacts/contracts/interfaces/uniswapv2/IUniswapV2Router02.sol/IUniswapV2Router02.json";
import IAToken from "../artifacts/contracts/interfaces/aave/IAToken.sol/IAToken.json";
import IAaveIncentivesController from "../artifacts/contracts/interfaces/aave/IAaveIncentivesController.sol/IAaveIncentivesController.json";
import IERC20 from "../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json";
import ILendingPool from "../artifacts/contracts/interfaces/aave/ILendingPool.sol/ILendingPool.json";
import {deployMockContract} from '@ethereum-waffle/mock-contract';

// @ts-ignore
import { expectRevert } from "@openzeppelin/test-helpers";
import {MockContract} from "ethereum-waffle";

describe("DojoToken", () => {
  let aaveYnftVault: Contract;
  let aToken: MockContract;
  let aaveIncentivesController: MockContract;

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    const uniswapRouter = await deployMockContract(signers[0], IUniswapV2Router02.abi);
    aToken = await deployMockContract(signers[0], IAToken.abi);
    aaveIncentivesController = await deployMockContract(signers[0], IAaveIncentivesController.abi);
    const rewardToken = await deployMockContract(signers[0], IERC20.abi);
    const pool = await deployMockContract(signers[0], ILendingPool.abi);
    await aaveIncentivesController.mock.REWARD_TOKEN.returns(rewardToken.address);
    await aToken.mock.UNDERLYING_ASSET_ADDRESS.returns(rewardToken.address);
    await aToken.mock.POOL.returns(pool.address);


    aaveYnftVault = await deployContract<AaveYNFTVault>(
      "AaveYNFTVault",
      [uniswapRouter.address, aToken.address, aaveIncentivesController.address, signers[1].address],
      undefined
    );
  });

  it('should return value from aave incentives controller on getAmountToClaim', async () => {
    const EXPECTED_AMOUNT = 200;
    await aaveIncentivesController.mock.getRewardsBalance.withArgs([aToken.address], aaveYnftVault.address).returns(EXPECTED_AMOUNT);
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

});
