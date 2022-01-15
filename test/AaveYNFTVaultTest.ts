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

describe("DojoToken", () => {
  let aaveYnftVault: Contract;

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    const uniswapRouter = await deployMockContract(signers[0], IUniswapV2Router02.abi);
    const aToken = await deployMockContract(signers[0], IAToken.abi);
    const aaveIncentivesController = await deployMockContract(signers[0], IAaveIncentivesController.abi);
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

  it('empty testcase', async () => {

  });


});
