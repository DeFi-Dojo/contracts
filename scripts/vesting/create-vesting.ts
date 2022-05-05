import { createVestingSchedule } from "../../utils/deployment/token";

const BENEFICIARY = "0x7b5de8815b0026f6e0196b83f401d3e30bebac82";
const CLIFF = 60;
const DURATION = 600;
const SLICE_PERIOD_SECONDS = 60;
const AMOUNT = 100000;

const main = async () => {
  const NOW = Math.floor(Date.now() / 1000);
  await createVestingSchedule(
    BENEFICIARY,
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
