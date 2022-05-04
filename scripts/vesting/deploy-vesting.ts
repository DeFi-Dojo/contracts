import { deployVesting } from "../../utils/deployment/token";

const main = async () => {
  await deployVesting();
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
