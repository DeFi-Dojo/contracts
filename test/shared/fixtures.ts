import { Contract } from 'ethers'
import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import hre from 'hardhat'

interface V2Fixture {
  token0: Contract
  token1: Contract
  WETH: Contract
  WETHPartner: Contract
  factoryV2: Contract
  router01: Contract
  router02: Contract
  routerEventEmitter: Contract
  router: Contract
  pair: Contract
  WETHPair: Contract
}

export const deployHHContract = async (name: string, constructorArgs: any[]) => {
  const factory = await hre.ethers.getContractFactory(name);
  const contract = await factory.deploy(...constructorArgs);
  await contract.deployed();
  return contract;
}

export async function loadV2HHFixture() {
  const provider = hre.ethers.provider;
  const [wallet] = await hre.ethers.getSigners();
  const [
    WETH,
    tokenA,
    tokenB,
    WETHPartner,
    factoryV2,
    routerEventEmitter
  ] = await Promise.all([
    deployHHContract('WETH9', []),
    deployHHContract('GeneralERC20', [wallet.address, 'TokenA', 'TKA']),
    deployHHContract('GeneralERC20', [wallet.address, 'TokenA', 'TKA']),
    deployHHContract('GeneralERC20', [wallet.address, 'WETHPartner', 'WETHP']),
    deployHHContract('UniswapV2Factory', [wallet.address]),
    deployHHContract('RouterEventEmitter', []),
  ]);

  const [
    router01,
    router02
  ] = await Promise.all([
    deployHHContract('UniswapV2Router01', [factoryV2.address, WETH.address]),
    deployHHContract('UniswapV2Router02', [factoryV2.address, WETH.address]),
  ])

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
    WETH,
    WETHPartner,
    factoryV2,
    router01,
    router02,
    router: router02, // the default router, 01 had a minor bug
    routerEventEmitter,
    pair,
    WETHPair,
    wallet
  }
}
