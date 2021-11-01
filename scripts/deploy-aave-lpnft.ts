import { ethers } from "hardhat";
import { AaveLPNFT, DojoNFT } from "../typechain";
import { deployContract, waitForReceipt } from "../utils/deployment";

import configEnv from "../config";
import { PROXY_REGISTRY_ADDRESS_RINKEBY } from "../consts";

const { NFT_BASE_URI } = configEnv;

const NFT_TOKEN_ID = 0;

const A_WETH_ADDRESS = "0x87b1f4cf9BD63f7BBD3eE1aD04E8F52540349347";

const AAVE_LPNFT_ADDRESS = "0x0c948306b27f25F85A03b9d3aa55B562FEAD3dB9";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const dojoNft = await deployContract<DojoNFT>("DojoNFT", [
    NFT_BASE_URI,
    PROXY_REGISTRY_ADDRESS_RINKEBY,
  ]);

  const lpnft = await deployContract<AaveLPNFT>("AaveLPNFT", [
    A_WETH_ADDRESS,
    dojoNft.address,
  ]);

  const TOKENS_IN_LPNFT = 5000;

  const AWETH = await ethers.getContractFactory("TokenERC20");

  const aWETH = await AWETH.attach(A_WETH_ADDRESS);

  const res = await aWETH.balanceOf(lpnft.address);
  console.log("BALANCE OF LPNFT CONTRACT: ", ethers.utils.formatEther(res));

  // console.log("AAVE_LPNFT");

  // const AAVE_LPNFT = await ethers.getContractFactory("AaveLPNFT");

  // console.log("ATTACH");

  // const lpnft = await AAVE_LPNFT.attach(AAVE_LPNFT_ADDRESS);

  // console.log("ATTACHED");

  console.log("Approving");

  await aWETH.approve(lpnft.address, TOKENS_IN_LPNFT).then(waitForReceipt);
  console.log("Approved");

  await lpnft.addLPtoNFT(NFT_TOKEN_ID, TOKENS_IN_LPNFT).then(waitForReceipt);
  console.log("Adding LP done");

  const res1 = await aWETH.balanceOf(lpnft.address);
  console.log("BALANCE OF LPNFT CONTRACT: ", ethers.utils.formatEther(res1));

  const balanceAfterAddLp = await aWETH.balanceOf(owner.address);
  console.log("Balance after adding LP:", balanceAfterAddLp.toString());

  await lpnft
    .redeemLPTokens(NFT_TOKEN_ID, TOKENS_IN_LPNFT)
    .then(waitForReceipt);
  console.log("Redeem done");

  const balanceAfterReedemLp = await aWETH.balanceOf(owner.address);
  console.log("Balance after redeeming LP:", balanceAfterReedemLp.toString());

  const res2 = await aWETH.balanceOf(lpnft.address);
  console.log("BALANCE OF LPNFT CONTRACT: ", ethers.utils.formatEther(res2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
