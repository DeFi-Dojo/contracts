import { releaseVesting } from "../../utils/deployment/token";

const BENEFICIARY = "0x7b5de8815b0026f6e0196b83f401d3e30bebac82";

const main = async () => {
  await releaseVesting(BENEFICIARY);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
