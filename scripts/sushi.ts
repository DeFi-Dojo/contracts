import { ethers } from "hardhat";
import { TokenERC20, UniswapV2Factory, UniswapV2Pair, UniswapV2Router02, WETH9Mock } from "../typechain";
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

  let latestBlock = await ethers.provider.getBlock("latest");
  let latestBlockTime = latestBlock.timestamp;
  await Promise.all([
    token1.approve(pairAddress, 100000).then(waitForReceipt),
    token2.approve(pairAddress, 100000).then(waitForReceipt),
    token1.approve(uniswapv2SushiRouter.address, 100000).then(waitForReceipt),
    token2.approve(uniswapv2SushiRouter.address, 100000).then(waitForReceipt),
  ]);

  console.log(`Token1 balance after adding liquidity ${await token1.balanceOf(owner.address)}, token2: ${await token2.balanceOf(owner.address)}`);
  await uniswapv2SushiRouter.addLiquidity(token1.address, token2.address, 100000, 100000, 0, 0, owner.address, latestBlockTime + 100000).then(waitForReceipt);

  const pair = await ethers.getContractAt<UniswapV2Pair>("UniswapV2Pair", pairAddress);
  
  const token1inPair = await token1.balanceOf(pair.address);
  const token2inPair = await token2.balanceOf(pair.address);
  const liquidity = await pair.balanceOf(owner.address);
  const totalSupply = await pair.totalSupply();
  const naiveToken1Expected = token1inPair.mul(liquidity).div(totalSupply);
  const naiveToken2Expected = token2inPair.mul(liquidity).div(totalSupply);
  console.log(`Balance of SLP after adding liquidity: ${liquidity}`); 

  await pair.approve(uniswapv2SushiRouter.address, 100000).then(waitForReceipt);

  latestBlock = await ethers.provider.getBlock("latest");
  latestBlockTime = latestBlock.timestamp;
  await uniswapv2SushiRouter.removeLiquidity(
    token1.address,
    token2.address,
    liquidity,
    naiveToken1Expected,
    naiveToken2Expected,
    owner.address,
    latestBlockTime + 100000,
  ).then(waitForReceipt);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });