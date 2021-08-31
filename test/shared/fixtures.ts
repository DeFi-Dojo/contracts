import { Contract } from 'ethers'
import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import hre from 'hardhat'
import { expandTo18Decimals } from './utilities';

export const deployHHContract = async (name: string, constructorArgs: any[]) => {
  const factory = await hre.ethers.getContractFactory(name);
  const contract = await factory.deploy(...constructorArgs);
  await contract.deployed();
  return contract;
}

export const TOTAL_SUPPLY = expandTo18Decimals(10000)

export async function loadV2HHFixture() {
  const provider = hre.ethers.provider;
  const [wallet, other] = await hre.ethers.getSigners();
  const [
    WETH,
    TestERC20,
    tokenA,
    tokenB,
    WETHPartner,
    factoryV2,
    routerEventEmitter
  ] = await Promise.all([
    deployHHContract('WETH9', []),
    deployHHContract('TestERC20', [TOTAL_SUPPLY]),
    deployHHContract('GeneralERC20', [wallet.address, 'TokenA', 'TKA']),
    deployHHContract('GeneralERC20', [wallet.address, 'TokenB', 'TKB']),
    deployHHContract('GeneralERC20', [wallet.address, 'WETHPartner', 'WETHP']),
    deployHHContract('UniswapV2Factory', [wallet.address]),
    deployHHContract('RouterEventEmitter', []),
  ]);

  const router02 = await deployHHContract('UniswapV2Router02', [factoryV2.address, WETH.address])

  await factoryV2.createPair(tokenA.address, tokenB.address).then((res: any) => res.wait())
  const pairAddress = await factoryV2.getPair(tokenA.address, tokenB.address)
  const pair = new Contract(pairAddress, JSON.stringify(IUniswapV2Pair.abi), provider).connect(wallet)

  const token0Address = await pair.token0()
  const token0 = tokenA.address === token0Address ? tokenA : tokenB
  const token1 = tokenA.address === token0Address ? tokenB : tokenA

  await factoryV2.createPair(WETH.address, WETHPartner.address)
  const WETHPairAddress = await factoryV2.getPair(WETH.address, WETHPartner.address)
  const WETHPair = new Contract(WETHPairAddress, JSON.stringify(IUniswapV2Pair.abi), provider).connect(wallet)

  return {
    token0,
    token1,
    TestERC20,
    WETH,
    WETHPartner,
    factoryV2,
    router: router02, // the default router, 01 had a minor bug
    routerEventEmitter,
    pair,
    WETHPair,
    wallet,
    other
  }
}
