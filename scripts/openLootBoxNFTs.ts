import { ethers } from "hardhat";

const { RINKEBY_API_URL, WALLET_MNEMONIC } = process.env;

const LOOTBOX_ADDRESS = "0xc1a5553aff8719daa57c8861ca1a51e33911a3f5";

const TOKEN_ID = 2;

async function main() {
  // eslint-disable-next-line
  const [_, ownerOfLootBox] = await ethers.getSigners();

  if (!WALLET_MNEMONIC || !RINKEBY_API_URL) {
    return;
  }
  const CreatureLootBox = await ethers.getContractFactory("CreatureLootBox");

  const contract = await CreatureLootBox.attach(LOOTBOX_ADDRESS);

  const res = await contract.connect(ownerOfLootBox).unpack(TOKEN_ID);

  console.log("method called");

  await res.wait();

  console.log("done");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
