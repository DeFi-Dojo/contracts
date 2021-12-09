import configEnv from "../../config";

const {
  DEFENDER_TEAM_API_KEY,
  DEFENDER_TEAM_API_SECRET,
  DEFENDER_AUTOTASK_ID,
} = configEnv;

async function main() {
  //   await deployContract<TestERC20>("TestERC20", []);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
