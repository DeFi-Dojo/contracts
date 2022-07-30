import {
  deployAaveVaultsWithMetadata,
  deployQuickswapVaultsWithMetadata,
} from "../utils";

const main = async () => {
  await deployAaveVaultsWithMetadata({ isDummyVault: false });
  await deployQuickswapVaultsWithMetadata({ isDummyVault: false });
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
