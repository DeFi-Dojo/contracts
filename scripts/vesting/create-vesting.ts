import { createVestingSchedule } from "../../utils/deployment/token";
import configEnv from "../../config/config";

const CLIFF = 60;
const DURATION = 600;
const SLICE_PERIOD_SECONDS = 60;
const AMOUNT = 100000;

const { BENEFICIARY_ADDRESS } = configEnv;

const main = async () => {
  const NOW = Math.floor(Date.now() / 1000);
  await createVestingSchedule(
    BENEFICIARY_ADDRESS,
    NOW,
    CLIFF,
    DURATION,
    SLICE_PERIOD_SECONDS,
    AMOUNT
  );
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
