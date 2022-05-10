import { ethers } from "hardhat";
import assert from "assert";
import {
  createDeployContract,
  uploadYnftMetadata,
  waitForReceipt,
} from "../../../utils";
import {
  IStakingDualRewards,
  QuickswapYNFTVault__factory,
} from "../../../typechain";
import { QuickswapVaultName } from "../../../consts";
import configEnv from "../../../config/config";
import * as consts from "../../../consts";

const { ADDRESSES, BENEFICIARY_ADDRESS, MORALIS_IPFS_URL } = configEnv;

async function main() {
  const signers = await ethers.getSigners();
  const deploy =
    createDeployContract<QuickswapYNFTVault__factory>("QuickswapYNFTVault");
  const ynftPathUri = await uploadYnftMetadata(QuickswapVaultName.maticEth);
  const yNFTVault = await deploy(
    ADDRESSES.ROUTER_02_QUICKSWAP,
    ADDRESSES.PAIR_WMATIC_USDC_QUICKSWAP,
    ADDRESSES.STAKING_DUAL_REWARDS_WMATIC_USDC_QUICKSWAP,
    ADDRESSES.DQUICK,
    ADDRESSES.WMATIC,
    signers[2].address,
    BENEFICIARY_ADDRESS,
    "Dojo yNFT",
    MORALIS_IPFS_URL,
    ynftPathUri
  );

  const amountOutMin = 0;
  const deadline = Math.round(Date.now() / 1000) + consts.SECONDS_IN_ONE_DAY;

  await yNFTVault
    .createYNFTForEther(
      amountOutMin,
      amountOutMin,
      amountOutMin,
      amountOutMin,
      deadline,
      {
        value: ethers.utils.parseEther("100"),
      }
    )
    .then(waitForReceipt);

  const stakingDualRewards = await ethers.getContractAt<IStakingDualRewards>(
    "IStakingDualRewards",
    await yNFTVault.stakingDualRewards()
  );
  const lpBalanceBefore = await stakingDualRewards.balanceOf(yNFTVault.address);
  const WAIT_TIME_SEC = 60;
  for (
    let amountToClaim = (
      await stakingDualRewards.earnedA(yNFTVault.address)
    ).add(await stakingDualRewards.earnedB(yNFTVault.address));
    ;

  ) {
    console.log(`amountToClaim: ${amountToClaim}`);
    if (amountToClaim.gt(0)) {
      // eslint-disable-next-line no-await-in-loop
      await yNFTVault.connect(signers[2]).claimRewards();
      break;
    }
    console.log(`waiting ${WAIT_TIME_SEC} seconds`);
    // eslint-disable-next-line no-await-in-loop
    await new Promise((f) => setTimeout(f, WAIT_TIME_SEC * 1000));
  }

  const lpBalanceAfter = await stakingDualRewards.balanceOf(yNFTVault.address);
  console.log(
    `lpBalanceBefore: ${lpBalanceBefore}, lpBalanceAfter: ${lpBalanceAfter}`
  );
  assert.notEqual(lpBalanceAfter, lpBalanceBefore);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
