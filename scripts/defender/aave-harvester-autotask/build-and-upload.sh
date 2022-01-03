rm -R ./dist
echo "cleared dist folder"
yarn build
echo "build successfully"
npx ts-node ./scripts/defender/aave-harvester-autotask/upload-autotask.ts
echo "Uploaded successfully code to autotask"
