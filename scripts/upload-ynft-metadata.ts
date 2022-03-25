import { AllVaultsToDeploy } from "../consts";
import { resultToPromiseFn, sequence, uploadYnftMetadata } from "../utils";

const main = async () => {
  await sequence(AllVaultsToDeploy.map(resultToPromiseFn(uploadYnftMetadata)));
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
