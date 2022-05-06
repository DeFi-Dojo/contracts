import { ethers } from "hardhat";
import assert from "assert";
import {
  createDeployContract,
  waitForReceipt,
} from "../../../utils/deployment";
import * as consts from "../../../consts";
import { AaveYNFTVault__factory, YNFT } from "../../../typechain";
import configEnv from "../../../config";
import { uploadYnftMetadata } from "../../../utils";
import { AaveVaultName } from "../../../consts";

const { ADDRESSES, HARVESTER_ADDRESS, BENEFICIARY_ADDRESS, MORALIS_IPFS_URL } =
  configEnv;

async function main() {
  const signers = await ethers.getSigners();
  const owner = signers[0];

  const deploy = createDeployContract<AaveYNFTVault__factory>("AaveYNFTVault");
  const ynftPathUri = await uploadYnftMetadata(AaveVaultName.usdt);
  const yNFTVault = await deploy(
    ADDRESSES.ROUTER_02_SUSHISWAP,
    ADDRESSES.A_USDT, // A_DAI, A_USDT, A_USDC
    ADDRESSES.INCENTIVES_CONTROLLER,
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
    .createYNFTForEther(amountOutMin, deadline, {
      value: ethers.utils.parseEther("0.1"),
    })
    .then(waitForReceipt);
  console.log("created");

  const yNft = await ethers.getContractAt<YNFT>("YNFT", await yNFTVault.yNFT());

  assert.equal(await yNft.ownerOf(0), owner.address, "test assert");

  await yNft
    .transferFrom(owner.address, signers[1].address, 0)
    .then(waitForReceipt);
  assert.equal(await yNft.ownerOf(0), signers[1].address, "test assert");
  await yNFTVault.connect(signers[1]).withdrawToUnderlyingTokens(0);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
