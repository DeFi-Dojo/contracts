SCRIPT_DIR=$(dirname $0)

npm run rm:dist
echo "removed old bundle"

npm run build:ts
echo "build successfully"

npx ts-node $SCRIPT_DIR/aave-harvester/upload.ts
npx ts-node $SCRIPT_DIR/quickswap-rewards-getter/upload.ts
echo "Uploaded successfully code to autotask"
