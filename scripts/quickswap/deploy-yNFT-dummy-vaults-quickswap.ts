import { deployQuickswapDummyVaultsWithMetadata } from "../../utils";

deployQuickswapDummyVaultsWithMetadata()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
