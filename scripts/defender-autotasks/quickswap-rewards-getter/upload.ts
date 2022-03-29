import { uploadAutotaskFromFolder } from "../upload-autotask";

console.log("Uploading autotask script");
uploadAutotaskFromFolder(`${__dirname}/dist`)
  .then(() => {
    console.log("Uploaded autotask script");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
