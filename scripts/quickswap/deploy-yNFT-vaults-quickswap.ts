import { deployQuickswapVaultsWithMetadata } from "../../utils";

deployQuickswapVaultsWithMetadata({})
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
