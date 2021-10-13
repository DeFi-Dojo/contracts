import { ethers } from "hardhat";
import { AaveLPNFT, DojoNFT, NFTMarketplace } from "../typechain";
import {
  deployContract,
  waitForReceipt,
  deployAaveContracts,
} from "../utils/deployment";

const NFT_TOKEN_ID = 0;

const { NFT_BASE_URI } = process.env;

async function main() {
  if (!NFT_BASE_URI) {
    throw new Error("NFT_BASE_URI not declared");
  }
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const {
    aToken,
    underlyingToken,
    aaveLendingPool,
    aaveLendingPoolCoreAddress,
  } = await deployAaveContracts();
  const marketplace = await deployContract<NFTMarketplace>(
    "NFTMarketplace",
    []
  );

  const dojoNft = await deployContract<DojoNFT>("DojoNFT", [
    marketplace.address,
    NFT_BASE_URI,
  ]);

  const lpnft = await deployContract<AaveLPNFT>("AaveLPNFT", [
    aToken.address,
    dojoNft.address,
  ]);

  const TOKENS_IN_LPNFT = 500000;
  await underlyingToken
    .approve(aaveLendingPoolCoreAddress, TOKENS_IN_LPNFT)
    .then(waitForReceipt);
  await aaveLendingPool
    .deposit(underlyingToken.address, TOKENS_IN_LPNFT, 0)
    .then(waitForReceipt);
  console.log("Deposing tokens in AAVE done");

  await aToken.approve(lpnft.address, TOKENS_IN_LPNFT).then(waitForReceipt);
  await lpnft.addLPtoNFT(0, TOKENS_IN_LPNFT).then(waitForReceipt);
  console.log("Adding LP done");

  const balanceAfterAddLp = await lpnft.balanceOf(NFT_TOKEN_ID);
  console.log("Balance after adding LP:", balanceAfterAddLp.toString());

  await lpnft
    .redeemLPTokens(NFT_TOKEN_ID, TOKENS_IN_LPNFT)
    .then(waitForReceipt);
  console.log("Redeem done");

  const balanceAfterReedemLp = await lpnft.balanceOf(NFT_TOKEN_ID);
  console.log("Balance after redeeming LP:", balanceAfterReedemLp.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
