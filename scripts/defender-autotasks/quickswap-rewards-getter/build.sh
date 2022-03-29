SCRIPT_DIR=$(dirname $0)

echo Building autotask script
cd $SCRIPT_DIR
npx webpack
echo Build successfull
