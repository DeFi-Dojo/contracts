import { ethers } from "hardhat";
import { AaveLPNFT, DojoNFT, NFTMarketplace } from "../typechain";
import {
  deployContract,
  waitForReceipt,
  deployAaveContracts,
} from "../utils/deployment";

const nftTokenId = 0;

async function main() {
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
  ]);
  await dojoNft.mint().then(waitForReceipt);
  console.log("Minted NFT token");

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

  const balanceAfterAddLp = await lpnft.balanceOf(nftTokenId);
  console.log("Balance after adding LP:", balanceAfterAddLp.toString());

  await lpnft.redeemLPTokens(nftTokenId, TOKENS_IN_LPNFT).then(waitForReceipt);
  console.log("Redeem done");

  const balanceAfterReedemLp = await lpnft.balanceOf(nftTokenId);
  console.log("Balance after redeeming LP:", balanceAfterReedemLp.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
