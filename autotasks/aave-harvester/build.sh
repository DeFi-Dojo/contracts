SCRIPT_DIR=$(dirname $0)

rm -fr $SCRIPT_DIR/dist

echo Building autotask script
cd $SCRIPT_DIR
if npx webpack; then
  echo Build successfull
else
  echo Failed to build
fi
