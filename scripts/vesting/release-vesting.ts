import { releaseVesting } from "../../utils/deployment/token-vesting";
import configEnv from "../../config/config";

const { BENEFICIARY_ADDRESS } = configEnv;

const main = async () => {
  await releaseVesting(BENEFICIARY_ADDRESS);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
