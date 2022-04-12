/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/quotes */

import { exec } from "child_process";
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from "fs/promises";
import glob from "glob";
import path from "path";
import { promisify } from "util";

async function copyDir(source: string, destination: string): Promise<any> {
  const directoryEntries = await readdir(source, { withFileTypes: true });
  await mkdir(destination, { recursive: true });

  return Promise.all(
    directoryEntries.map(async (entry) => {
      const sourcePath = path.join(source, entry.name);
      const destinationPath = path.join(destination, entry.name);

      return entry.isDirectory()
        ? copyDir(sourcePath, destinationPath)
        : copyFile(sourcePath, destinationPath);
    })
  );
}

const replaceOpenZeppelinImportsWithRelative =
  (contractsPath: string) => async (solFilePath: string) => {
    const solFileContent = await readFile(solFilePath, {
      encoding: "utf-8",
    });

    const numberOfDirsUp =
      solFilePath.replace(`${contractsPath}/`, "").split("/").length - 1;
    const pathPrefix = Array(numberOfDirsUp).fill("../").join("");
    const searchValue = ` "@openzeppelin/contracts/`;
    const replaceValue = ` "${pathPrefix}../node_modules/@openzeppelin/contracts/`;
    const newFileContent = solFileContent.replaceAll(searchValue, replaceValue);

    await writeFile(solFilePath, newFileContent);
  };

const runMythril = async (pattern: string) => {
  const bashScript = `rm $HOME/.mythril/config.ini; for f in ${pattern} ; do echo "echo $f; myth analyze $f \n"; done | parallel --will-cite`;
  const child = exec(bashScript);

  child.stdout?.pipe(process.stdout);
  child.stderr?.pipe(process.stderr);

  await new Promise((resolve) => {
    child.on("close", resolve);
  });
};

const main = async () => {
  const projectPath = path.join(__dirname, "../");
  const contractsSrcPath = path.join(projectPath, "contracts");
  const contractsPath = path.join(projectPath, "contracts-myth");
  const pattern = `${contractsPath}/**/*.sol`;

  await copyDir(contractsSrcPath, contractsPath);

  const solFilePaths = await promisify(glob)(pattern);
  await Promise.all(
    solFilePaths.map(replaceOpenZeppelinImportsWithRelative(contractsPath))
  );
  await runMythril(pattern);

  await rm(contractsPath, { recursive: true });
};

main();
