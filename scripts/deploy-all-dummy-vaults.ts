import {
  deployAaveVaultsWithMetadata,
  deployQuickswapVaultsWithMetadata,
} from "../utils";

const main = async () => {
  await deployAaveVaultsWithMetadata({ isDummyVault: true });
  await deployQuickswapVaultsWithMetadata({ isDummyVault: true });
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
