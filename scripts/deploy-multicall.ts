import hre, { ethers } from 'hardhat'

async function main() {
  // Deploy Multicall
  const Multicall = await ethers.getContractFactory('Multicall');
  const multicall = await Multicall.deploy();
  
  await multicall.deployed();

  await hre.ethernal.push({
    name: 'Multicall',
    address: multicall.address
  });

  console.log('Multicall deployed to:', multicall.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
