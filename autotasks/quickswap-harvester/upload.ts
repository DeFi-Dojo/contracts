import { uploadAutotaskFromFolder } from "../upload-autotask";
import configEnv from "../../config";

const autotaskId = configEnv.DEFENDER_QUICKSWAP_AUTOTASK_ID;

console.log("Uploading autotask script");
uploadAutotaskFromFolder(autotaskId)(`${__dirname}/dist`)
  .then(() => {
    console.log("Uploaded autotask script");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
