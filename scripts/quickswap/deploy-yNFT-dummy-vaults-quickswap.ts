import { deployQuickswapVaultsWithMetadata } from "../../utils";

deployQuickswapVaultsWithMetadata({ isDummyVault: true })
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
