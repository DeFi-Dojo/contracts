import { ethers } from "hardhat";
import {
  createDeployContract,
  uploadYnftMetadata,
  waitForReceipt,
} from "../../../utils";
import { AaveYNFTVault__factory } from "../../../typechain";
import { AaveVaultName } from "../../../consts";
import configEnv from "../../../config/config";
import * as consts from "../../../consts";

const { ADDRESSES, BENEFICIARY_ADDRESS, MORALIS_IPFS_URL } = configEnv;

async function main() {
  const signers = await ethers.getSigners();

  const deploy = createDeployContract<AaveYNFTVault__factory>("AaveYNFTVault");
  const ynftPathUri = await uploadYnftMetadata(AaveVaultName.usdt);
  const yNFTVault = await deploy(
    ADDRESSES.ROUTER_02_QUICKSWAP,
    ADDRESSES.A_USDT, // A_DAI, A_USDT, A_USDC
    ADDRESSES.INCENTIVES_CONTROLLER,
    signers[2].address,
    BENEFICIARY_ADDRESS,
    "Dojo yNFT",
    MORALIS_IPFS_URL,
    ynftPathUri
  );

  const amountOutMin = 0;
  const deadline = Math.round(Date.now() / 1000) + consts.SECONDS_IN_ONE_DAY;

  await yNFTVault
    .createYNFTForEther(amountOutMin, deadline, {
      value: ethers.utils.parseEther("100"),
    })
    .then(waitForReceipt);

  const WAIT_TIME_SEC = 60;
  for (let amountToClaim = await yNFTVault.getAmountToClaim(); ; ) {
    console.log(`amountToClaim: ${amountToClaim}`);
    if (amountToClaim > 0) {
      // eslint-disable-next-line no-await-in-loop
      await yNFTVault.connect(signers[2]).claimRewards(0, deadline);
      break;
    }
    console.log(`waiting ${WAIT_TIME_SEC} seconds`);
    // eslint-disable-next-line no-await-in-loop
    await new Promise((f) => setTimeout(f, WAIT_TIME_SEC * 1000));
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
