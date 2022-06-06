import { deployVesting } from "../../utils/deployment/token-vesting";

const main = deployVesting;

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
