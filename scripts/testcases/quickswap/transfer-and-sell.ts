import { ethers } from "hardhat";
import assert from "assert";
import { BigNumber } from "ethers";
import {
  createDeployContract,
  waitForReceipt,
} from "../../../utils/deployment";
import * as consts from "../../../consts";
import { QuickswapVaultName } from "../../../consts";
import { IERC20, QuickswapYNFTVault__factory, YNFT } from "../../../typechain";
import configEnv from "../../../config";
import { uploadYnftMetadata } from "../../../utils";

const { ADDRESSES, HARVESTER_ADDRESS, BENEFICIARY_ADDRESS, MORALIS_IPFS_URL } =
  configEnv;

async function main() {
  const signers = await ethers.getSigners();
  const owner = signers[0];

  const deploy =
    createDeployContract<QuickswapYNFTVault__factory>("QuickswapYNFTVault");
  const ynftPathUri = await uploadYnftMetadata(QuickswapVaultName.maticUsdc);
  const yNFTVault = await deploy(
    ADDRESSES.ROUTER_02_QUICKSWAP,
    ADDRESSES.PAIR_WMATIC_USDC_QUICKSWAP,
    ADDRESSES.STAKING_DUAL_REWARDS_WMATIC_USDC_QUICKSWAP,
    ADDRESSES.DQUICK,
    ADDRESSES.WMATIC,
    HARVESTER_ADDRESS,
    BENEFICIARY_ADDRESS,
    "Dojo yNFT",
    MORALIS_IPFS_URL,
    ynftPathUri
  );

  // frontend should calculate and pass it to the function, using "0" for convenience
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
        value: ethers.utils.parseEther("1"),
      }
    )
    .then(waitForReceipt);

  await yNFTVault
    .createYNFTForEther(
      amountOutMin,
      amountOutMin,
      amountOutMin,
      amountOutMin,
      deadline,
      {
        value: ethers.utils.parseEther("1"),
      }
    )
    .then(waitForReceipt);

  console.log("created");
  const provider = ethers.getDefaultProvider("http://127.0.0.1:8545/");

  const yNft = await ethers.getContractAt<YNFT>("YNFT", await yNFTVault.yNFT());
  const underlyingToken = await ethers.getContractAt<IERC20>(
    "IERC20",
    ADDRESSES.USDC
  );

  assert.equal(
    await yNft.ownerOf(0),
    owner.address,
    "yNFT minted for invalid address"
  );

  await yNft
    .transferFrom(owner.address, signers[1].address, 0)
    .then(waitForReceipt);
  assert.equal(await yNft.ownerOf(0), signers[1].address, "test assert");
  const underlyingTokenBalanceBefore: BigNumber =
    await underlyingToken.balanceOf(signers[1].address);
  const balanceBefore: BigNumber = await provider.getBalance(
    signers[1].address
  );
  const tx = await yNFTVault
    .connect(signers[1])
    .withdrawToUnderlyingTokens(0, amountOutMin, amountOutMin, deadline);
  await tx.wait();
  const underlyingTokenBalanceAfter: BigNumber =
    await underlyingToken.balanceOf(signers[1].address);
  const balanceAfter: BigNumber = await provider.getBalance(signers[1].address);
  console.log(
    `underlyingTokenBalanceBefore: ${underlyingTokenBalanceBefore}, underlyingTokenBalanceAfter: ${underlyingTokenBalanceAfter}`
  );
  console.log(`balanceBefore: ${balanceBefore}, balanceAfter: ${balanceAfter}`);
  assert(
    underlyingTokenBalanceAfter.gt(underlyingTokenBalanceBefore),
    "Underlying token balance did not increase after yNFT withdrawal"
  );
  assert(
    balanceAfter.gt(balanceBefore),
    "Selling accountalance did not increase after yNFT withdrawal"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
