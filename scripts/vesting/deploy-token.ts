import { deployToken } from "../../utils/deployment/token";

const main = async () => {
  await deployToken();
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
