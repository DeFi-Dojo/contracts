import hre, { ethers } from 'hardhat'

async function main() {
  const [owner] = await ethers.getSigners()
  console.log(`Deploying contracts using address: ${owner.address}`);

  // Deploy Tokens
  const Prey = await ethers.getContractFactory('Prey');
  const prey = await Prey.deploy("Prey", "PREY");

  await prey.deployed();

  await hre.ethernal.push({
    name: 'Prey',
    address: prey.address
  });

  console.log('Prey deployed to:', prey.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
