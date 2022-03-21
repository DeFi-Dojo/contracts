import {
  deployAaveDummyVaultsWithMetadata,
  deployQuickswapDummyVaultsWithMetadata,
} from "../utils";

const main = async () => {
  await deployAaveDummyVaultsWithMetadata();
  await deployQuickswapDummyVaultsWithMetadata();
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
