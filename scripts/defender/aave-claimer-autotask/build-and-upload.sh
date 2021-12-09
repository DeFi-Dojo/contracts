npx hardhat compile
echo "compiled successfully"
cp -R ./typechain ./scripts/defender/aave-claimer-autotask/src
echo "copied typechain to autotask src folder"
rm -R ./dist
echo "cleared dist folder"
yarn build
echo "build successfully"
npx ts-node ./scripts/defender/aave-claimer-autotask/upload-autotask.ts
echo "Uploaded successfully code to autotask"
