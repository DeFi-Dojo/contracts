import { ethers } from "hardhat";
import { AaveLPNFT, DojoNFT } from "../typechain";
import {
  deployContract,
  waitForReceipt,
  deployAaveContracts,
} from "../utils/deployment";

import configEnv from "../config";
import { PROXY_REGISTRY_ADDRESS_RINKEBY } from "../consts";

const { NFT_BASE_URI } = configEnv;

const NFT_TOKEN_ID = 0;

const A_WETH_ADDRESS = "0x87b1f4cf9BD63f7BBD3eE1aD04E8F52540349347";

const AAVE_LPNFT_ADDRESS = "0xa55742EfFC3d86Ad885dd2A6ebE4dF9FfC0772B2";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  // const dojoNft = await deployContract<DojoNFT>("DojoNFT", [
  //   NFT_BASE_URI,
  //   PROXY_REGISTRY_ADDRESS_RINKEBY,
  // ]);

  // const lpnft = await deployContract<AaveLPNFT>("AaveLPNFT", [
  //   A_WETH_ADDRESS,
  //   dojoNft.address,
  // ]);

  const TOKENS_IN_LPNFT = 5000;

  const AWETH = await ethers.getContractFactory("TokenERC20");

  const aWETH = await AWETH.attach(A_WETH_ADDRESS);

  const res = await aWETH.balanceOf(AAVE_LPNFT_ADDRESS);
  console.log("BALANCE OF: ", ethers.utils.formatEther(res));

  // console.log("AAVE_LPNFT");

  const AAVE_LPNFT = await ethers.getContractFactory("AaveLPNFT");

  // console.log("ATTACH");

  const lpnft = await AAVE_LPNFT.attach(AAVE_LPNFT_ADDRESS);

  // console.log("ATTACHED");

  // console.log("Approving");

  // await aWETH.approve(lpnft.address, TOKENS_IN_LPNFT).then(waitForReceipt);
  // console.log("Approved");

  // await lpnft.addLPtoNFT(0, TOKENS_IN_LPNFT).then(waitForReceipt);
  // console.log("Adding LP done");

  const balanceAfterAddLp = await lpnft.balanceOf(NFT_TOKEN_ID);
  console.log("Balance after adding LP:", balanceAfterAddLp.toString());

  // try {
  await lpnft
    .redeemLPTokens(NFT_TOKEN_ID, TOKENS_IN_LPNFT)
    .then(waitForReceipt);
  console.log("Redeem done");
  // } catch (err: any) {
  //   console.log(err.message);
  //   console.log(err.code);
  //   console.log(err.data);
  // }

  const balanceAfterReedemLp = await lpnft.balanceOf(NFT_TOKEN_ID);
  console.log("Balance after redeeming LP:", balanceAfterReedemLp.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
