#!/bin/bash

set -ex

#remove directory if it exist
rm -rvf ./horizonsim-789/build/
#rm -rvf ./horizonsim-789/src/model/build/

mkdir -p ./horizonsim-789/build/
#mkdir -p ./horizonsim-789/src/model/build/
# copy from Horizon B789 model source into build
cp -rva ./horizonsim-789/src/base/. ./horizonsim-789/build/
