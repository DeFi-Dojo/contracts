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

    const aaveTokenAddress = process.env.AAVE_TOKEN_ADDRESS;
    if (!aaveTokenAddress) {
        throw new Error("Please specify env variable AAVE_TOKEN_ADDRESS");
    }

    const contract = await contractFactory.deploy(
        ADDRESSES.ROUTER_02_QUICKSWAP,
        aaveTokenAddress,
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
