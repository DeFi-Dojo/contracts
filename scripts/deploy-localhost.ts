import hre, { ethers } from 'hardhat'

async function main() {
  const [owner] = await ethers.getSigners()
  console.log(`Deploying contracts using address: ${owner.address}`);
  
  // Deploy WETH
  const WETH = await ethers.getContractFactory('WETH');
  const weth = await WETH.deploy();
  await weth.deployed();

  await hre.ethernal.push({
    name: 'WETH',
    address: weth.address
  });

  console.log('WETH deployed to:', weth.address);

  // Deploy Factory
  const UniswapV2Factory = await ethers.getContractFactory('UniswapV2Factory');
  const uniswapV2Factory = await UniswapV2Factory.deploy(owner.address);

  await uniswapV2Factory.deployed();

  await hre.ethernal.push({
    name: 'UniswapV2Factory',
    address: uniswapV2Factory.address
  });

  console.log('UniswapV2Factory deployed to:', uniswapV2Factory.address);

  // Deploy Router
  const UniswapV2Router02 = await ethers.getContractFactory('UniswapV2Router02');
  const uniswapV2Router02 = await UniswapV2Router02.deploy(
    uniswapV2Factory.address,
    weth.address
  );
  
  await uniswapV2Router02.deployed();

  await hre.ethernal.push({
    name: 'UniswapV2Router02',
    address: uniswapV2Router02.address
  });

  console.log('UniswapV2Router02 deployed to:', uniswapV2Router02.address)

  // Deploy Multicall
  const UniswapInterfaceMulticall = await ethers.getContractFactory('UniswapInterfaceMulticall');
  const uniswapInterfaceMulticall = await UniswapInterfaceMulticall.deploy();
  
  await uniswapInterfaceMulticall.deployed();

  await hre.ethernal.push({
    name: 'UniswapInterfaceMulticall',
    address: uniswapInterfaceMulticall.address
  });

  console.log('UniswapInterfaceMulticall deployed to:', uniswapInterfaceMulticall.address);

  // Deploy Tokens
  const Token1 = await ethers.getContractFactory('Token1');
  const Token2 = await ethers.getContractFactory('Token2');
  const token1 = await Token1.deploy(owner.address);
  const token2 = await Token2.deploy(owner.address);

  await token1.deployed();
  await token2.deployed();

  await hre.ethernal.push({
    name: 'Token1',
    address: token1.address
  });

  await hre.ethernal.push({
    name: 'Token2',
    address: token2.address
  });

  console.log('Token1 deployed to:', token1.address);
  console.log('Token2 deployed to:', token2.address);

  // Create pair of deployed tokens
  await uniswapV2Factory.createPair(token1.address, token2.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
