import { uploadAutotask } from "../upload-autotask";

const dirName = __dirname.replace("/contracts/", "/contracts/dist/");

uploadAutotask(`${dirName}/src`)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
