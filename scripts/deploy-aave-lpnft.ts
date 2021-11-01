import { ethers } from "hardhat";
import { AaveLPNFT, DojoNFT } from "../typechain";
import { deployContract, waitForReceipt } from "../utils/deployment";

import configEnv from "../config";
import { PROXY_REGISTRY_ADDRESS_RINKEBY } from "../consts";

const { NFT_BASE_URI } = configEnv;

const NFT_TOKEN_ID = 0;

const TOKENS_IN_LPNFT = 5000;

const A_WETH_ADDRESS = "0x87b1f4cf9BD63f7BBD3eE1aD04E8F52540349347";

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

  const aWETH = await ethers.getContractAt("IAToken", A_WETH_ADDRESS);

  await aWETH.approve(lpnft.address, TOKENS_IN_LPNFT).then(waitForReceipt);

  await lpnft.addLPtoNFT(NFT_TOKEN_ID, TOKENS_IN_LPNFT).then(waitForReceipt);
  console.log("Adding LP done");

  await lpnft
    .redeemLPTokens(NFT_TOKEN_ID, TOKENS_IN_LPNFT)
    .then(waitForReceipt);
  console.log("Redeem done");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
