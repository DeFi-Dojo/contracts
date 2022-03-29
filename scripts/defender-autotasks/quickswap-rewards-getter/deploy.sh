SCRIPT_DIR=$(dirname $0)

$SCRIPT_DIR/build.sh

npx ts-node $SCRIPT_DIR/upload.ts
