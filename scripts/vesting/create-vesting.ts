import { BigNumber } from "ethers";
import { createVestingSchedule } from "../../utils/deployment/token-vesting";
import configEnv from "../../config/config";
import { DECIMALS } from "../../consts";

const DURATION = 24 * 60 * 60;
const AMOUNT = BigNumber.from(10).pow(DECIMALS.DJO).mul(10000);

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
