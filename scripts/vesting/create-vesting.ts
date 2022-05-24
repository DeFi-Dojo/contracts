import { createVestingSchedule } from "../../utils/deployment/token";
import configEnv from "../../config/config";

const DURATION = 600;
const AMOUNT = 100000;

const { BENEFICIARY_ADDRESS } = configEnv;

const main = async () => {
  const NOW = Math.floor(Date.now() / 1000);
  await createVestingSchedule(BENEFICIARY_ADDRESS, NOW, DURATION, AMOUNT);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
