import { ethers } from "hardhat";
import { DojoNFT, SushiLPNFT, TokenERC20, UniswapV2Factory, UniswapV2Pair, UniswapV2Router02, WETH9Mock } from "../typechain";
import { deployContract, waitForReceipt } from "../utils/deployment";


async function main() {
  const [owner] = await ethers.getSigners();
  const [
    uniswapv2SushiFactory,
    weth9Mock,
  ] = await Promise.all([
    deployContract<UniswapV2Factory>("UniswapV2Factory", [owner.address]),
    deployContract<WETH9Mock>("WETH9Mock", []),
  ]);
  const uniswapv2SushiRouter = await deployContract<UniswapV2Router02>("UniswapV2Router02", [uniswapv2SushiFactory.address, weth9Mock.address]);
  const [
    token1, token2,
  ] = await Promise.all([
    deployContract<TokenERC20>("TokenERC20", ["Token1", "TK1"]),
    deployContract<TokenERC20>("TokenERC20", ["Token2", "TK2"]),
  ]);

  await uniswapv2SushiFactory.createPair(token1.address, token2.address).then(waitForReceipt);
  const pairAddress = await uniswapv2SushiFactory.getPair(token1.address, token2.address); 
  console.log(`Pair address: ${pairAddress.toString()}`);

  const latestBlock = await ethers.provider.getBlock("latest");
  const latestBlockTime = latestBlock.timestamp;

  const TOKENS_IN_LPNFT = 100000;  
  await Promise.all([
    token1.approve(uniswapv2SushiRouter.address, TOKENS_IN_LPNFT).then(waitForReceipt),
    token2.approve(uniswapv2SushiRouter.address, TOKENS_IN_LPNFT).then(waitForReceipt),
  ]);

  await uniswapv2SushiRouter.addLiquidity(token1.address, token2.address, TOKENS_IN_LPNFT, TOKENS_IN_LPNFT, 0, 0, owner.address, latestBlockTime + 100000).then(waitForReceipt);
  console.log(`Token1 balance after adding liquidity ${await token1.balanceOf(owner.address)}, token2: ${await token2.balanceOf(owner.address)}`);

  const pair = await ethers.getContractAt<UniswapV2Pair>("UniswapV2Pair", pairAddress);
  const liquidity = await pair.balanceOf(owner.address);
  console.log(`Balance of SLP after adding liquidity: ${liquidity}`); 

  const dojoNft = await deployContract<DojoNFT>("DojoNFT", []);
  await dojoNft.mint().then(waitForReceipt);
  console.log("Minted NFT token");

  const lpnft = await deployContract<SushiLPNFT>("SushiLPNFT", [pair.address, uniswapv2SushiRouter.address, dojoNft.address]);

  await pair.approve(lpnft.address, liquidity).then(waitForReceipt);
  await lpnft.addLPtoNFT(0, liquidity).then(waitForReceipt);
  console.log(`Moving LP to NFT done, liquidity left: ${await pair.balanceOf(owner.address)}`);

  await lpnft.redeemLPTokens(0, liquidity).then(waitForReceipt);
  console.log(`Token1 balance after removing liquidity ${await token1.balanceOf(owner.address)}, token2: ${await token2.balanceOf(owner.address)}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });