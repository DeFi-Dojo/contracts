import { deployAaveVaultsWithMetadata } from "../../utils";

deployAaveVaultsWithMetadata({ isDummyVault: true })
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
