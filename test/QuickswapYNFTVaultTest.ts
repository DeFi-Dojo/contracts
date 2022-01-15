/* eslint-disable no-underscore-dangle */
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContract, waitForReceipt } from "../utils/deployment";
import { QuickswapYNFTVault } from "../typechain";
import IUniswapV2Router02 from "../artifacts/contracts/interfaces/uniswapv2/IUniswapV2Router02.sol/IUniswapV2Router02.json";
import IUniswapV2Pair from "../artifacts/contracts/interfaces/uniswapv2/IUniswapV2Pair.sol/IUniswapV2Pair.json";
import IStakingDualRewards from "../artifacts/contracts/interfaces/quickswap/IStakingDualRewards.sol/IStakingDualRewards.json";
import IStakingRewards from "../artifacts/contracts/interfaces/quickswap/IStakingRewards.sol/IStakingRewards.json";
import IERC20 from "../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json";

import {deployMockContract} from '@ethereum-waffle/mock-contract';

// @ts-ignore
import { expectRevert } from "@openzeppelin/test-helpers";

describe("DojoToken", () => {
  let quickswapYnftVault: Contract;

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    const uniswapRouterMock = await deployMockContract(signers[0], IUniswapV2Router02.abi);
    const uniswapPairMock = await deployMockContract(signers[0], IUniswapV2Pair.abi);
    const stakingDualRewardsMock = await deployMockContract(signers[0], IStakingDualRewards.abi);
    const stakingRewardsMock = await deployMockContract(signers[0], IStakingRewards.abi);
    const dQuickMock = await deployMockContract(signers[0], IERC20.abi);
    const token0Mock = await deployMockContract(signers[0], IERC20.abi);
    const token1Mock = await deployMockContract(signers[0], IERC20.abi);
    await uniswapPairMock.mock.token0.returns(token0Mock.address);
    await uniswapPairMock.mock.token1.returns(token1Mock.address);

    quickswapYnftVault = await deployContract<QuickswapYNFTVault>(
      "QuickswapYNFTVault",
      [uniswapRouterMock.address, uniswapPairMock.address, stakingDualRewardsMock.address, stakingRewardsMock.address, dQuickMock.address, signers[1].address],
      undefined
    );
  });

  it('empty testcase', async () => {

  });


});
