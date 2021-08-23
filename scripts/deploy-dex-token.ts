import hre, { ethers } from 'hardhat'

// token address 0x57A621d2A54A10282B843415ad86392Fc461295f on goerli

async function main() {
  const [owner] = await ethers.getSigners()
  console.log(`Deploying contracts using address: ${owner.address}`);

  // Deploy Tokens
  const Prey = await ethers.getContractFactory('Prey');
  const prey = await Prey.deploy("Prey", "PREY");

  console.log(`Deploy`);

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
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
