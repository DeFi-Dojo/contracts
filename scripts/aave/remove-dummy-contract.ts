import { ethers } from "hardhat";
import { waitForReceipt } from "../../utils/deployment";

import { DummyAaveYNFTVault__factory } from "../../typechain";

async function main() {
    const { CONTRACT_ADDRESS: contractAddressToRemove } = process.env;

    if (!contractAddressToRemove) {
        throw new Error("CONTRACT_ADDRESS env variable not defined");
    }

    const contractName = "DummyAaveYNFTVault";
    const Contract = await ethers.getContractFactory<DummyAaveYNFTVault__factory>(contractName);
    const contract = await Contract.attach(contractAddressToRemove);

    console.log(`Trying to remove ${contractName} at address: ${contract.address}`);    

    await contract.removeVault().then(waitForReceipt);

    console.log(`${contractName} removed`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
