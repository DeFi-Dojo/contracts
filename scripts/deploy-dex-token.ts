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

  const contract = await Prey.attach(
    prey.address
  );

  const minterRole = '0x12ff340d0cd9c652c747ca35727e68c547d0f0bfa7758d2e77f75acef481b4f2';

  const MintableERC20PredicateProxyOnGorilla = '0x37c3bfC05d5ebF9EBb3FF80ce0bd0133Bf221BC8';

  await contract.grantRole(minterRole, MintableERC20PredicateProxyOnGorilla);

  console.log('Role granted');

  // let provider = ethers.getDefaultProvider();

  // let contract = new ethers.Contract(prey.address, prey.abi, provider);

  // let tx = await contractWithSigner.setValue("I like turtles.");

  // contract.
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
