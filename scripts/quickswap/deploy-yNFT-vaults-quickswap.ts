import { deployQuickswapVaultsWithMetadata } from "../../utils/deployment/quickswapVaults";

deployQuickswapVaultsWithMetadata()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
