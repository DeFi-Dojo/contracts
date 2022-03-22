# This script requires "myth", "solc" and "parallel" in your PATH
for f in contracts/**/*.sol ; do echo "echo $f; myth analyze $f \n"; done | parallel --will-cite
