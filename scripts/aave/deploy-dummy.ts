import { ethers } from "hardhat";
import { DummyAaveYNFTVault__factory } from "../../typechain";
import configEnv from "../../config";

const { ADDRESSES, HARVESTER_ADDRESS, BENEFICIARY_ADDRESS } = configEnv;

async function main() {
    const [owner] = await ethers.getSigners();
    console.log(`Deploying contracts using address: ${owner.address}`);

    const contractName = "DummyAaveYNFTVault";

    const contractFactory =
        await ethers.getContractFactory<DummyAaveYNFTVault__factory>(contractName);

    const contract = await contractFactory.deploy(
        ADDRESSES.ROUTER_02_QUICKSWAP,
        ADDRESSES.A_DAI,
        ADDRESSES.INCENTIVES_CONTROLLER,
        HARVESTER_ADDRESS,
        BENEFICIARY_ADDRESS
    );

    await contract.deployed();

    console.log(`${contractName} deployed to: `, contract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
