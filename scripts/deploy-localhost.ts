import hre, { ethers } from "hardhat";

const nftTokenId = 0;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts using address: ${owner.address}`);

  const DojoNFT = await ethers.getContractFactory("DojoNFT");
  const dojoNFT = await DojoNFT.deploy();
  await dojoNFT.deployed();

  await hre.ethernal.push({
    name: "DojoNFT",
    address: dojoNFT.address,
  });

  console.log("DojoNFT deployed to:", dojoNFT.address);

  const mintNFTTransaction = await dojoNFT.mint();

  await mintNFTTransaction.wait();

  console.log("Minted NFT token");

  const TokenERC20 = await ethers.getContractFactory("TokenERC20");
  const tokenERC20 = await TokenERC20.deploy("Token1", "TK1");
  await tokenERC20.deployed();

  await hre.ethernal.push({
    name: "TokenERC20",
    address: tokenERC20.address,
  });

  console.log("TokenERC20 deployed to:", tokenERC20.address);

  const LPNFT = await ethers.getContractFactory("LPNFT");
  const lpnft = await LPNFT.deploy(tokenERC20.address, dojoNFT.address);
  await lpnft.deployed();

  await hre.ethernal.push({
    name: "LPNFT",
    address: lpnft.address,
  });

  console.log("LPNFT deployed to:", lpnft.address);

  await tokenERC20.approve(lpnft.address, 100);

  const addLPTransaction = await lpnft.addLPtoNFT(nftTokenId, 100);

  await addLPTransaction.wait();

  console.log("Add lp done");

  const balanceAfterAddLp = await lpnft.balanceOf(nftTokenId);

  console.log("BalanceAfterAddLp:", balanceAfterAddLp.toString());

  const redeemLPTokensTransaction = await lpnft.redeemLPTokens(nftTokenId, 50);

  await redeemLPTokensTransaction.wait();

  console.log("Redeem done");

  const balanceAfterReedemLp = await lpnft.balanceOf(nftTokenId);

  console.log("BalanceAfterReedemLp:", balanceAfterReedemLp.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
