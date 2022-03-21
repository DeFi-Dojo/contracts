import { deployAaveVaultsWithMetadata } from "../../utils";

deployAaveVaultsWithMetadata()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
