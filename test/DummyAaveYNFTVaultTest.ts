import { expect } from "chai";
import chai from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContract} from "../utils/deployment";
import {AaveYNFTVault, DummyAaveYNFTVault} from "../typechain";
import IUniswapV2Router02 from "../artifacts/contracts/interfaces/uniswapv2/IUniswapV2Router02.sol/IUniswapV2Router02.json";
import IAToken from "../artifacts/contracts/interfaces/aave/IAToken.sol/IAToken.json";
import IAaveIncentivesController from "../artifacts/contracts/interfaces/aave/IAaveIncentivesController.sol/IAaveIncentivesController.json";
import IERC20 from "../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json";
import ILendingPool from "../artifacts/contracts/interfaces/aave/ILendingPool.sol/ILendingPool.json";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

// @ts-ignore
import { expectRevert, balance } from "@openzeppelin/test-helpers";
import {smock} from "@defi-wonderland/smock";
import {FakeContract} from "@defi-wonderland/smock/dist/src/types";

chai.use(smock.matchers)

describe("AaveYNFTVault", () => {
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
        aToken =  await smock.fake(IAToken.abi);
        aaveIncentivesController =  await smock.fake(IAaveIncentivesController.abi);

        rewardToken = await smock.fake(IERC20.abi);
        underlyingToken = await smock.fake(IERC20.abi);
        pool = await smock.fake(ILendingPool.abi);

        aaveIncentivesController.REWARD_TOKEN.returns(rewardToken.address);
        aToken.UNDERLYING_ASSET_ADDRESS.returns(underlyingToken.address);
        aToken.POOL.returns(pool.address);

        signers = await ethers.getSigners();

        dummyAaveYnftVault = await deployContract<DummyAaveYNFTVault>(
            "DummyAaveYNFTVault",
            [uniswapRouter.address, aToken.address, aaveIncentivesController.address, signers[1].address, signers[0].address],
            undefined
        );
    });

    it("should return to deployer on removeVault", async () => {
        signers = await ethers.getSigners();
        const balanceBefore = await balance.current(signers[0].address);
        await signers[1].sendTransaction({to: dummyAaveYnftVault.address,value: ethers.utils.parseEther("1") });
        await dummyAaveYnftVault.removeVault();
        const balanceAfter = await balance.current(signers[0].address);
        expect(balanceBefore - balanceAfter).to.lt(0);
    });

    it("should return to specified address on removeVaultToAddress", async () => {
        signers = await ethers.getSigners();
        const RETURN_ADDRESS = signers[3].address;
        const balanceBefore = await balance.current(RETURN_ADDRESS);
        await signers[1].sendTransaction({to: dummyAaveYnftVault.address,value: ethers.utils.parseEther("1") });
        await dummyAaveYnftVault.removeVaultToAddress(RETURN_ADDRESS);
        const balanceAfter = await balance.current(RETURN_ADDRESS);
        expect(balanceBefore - balanceAfter).to.lt(0);
    });

});
