#!/bin/bash

set -ex

df -h

#remove directory if it exist
rm -rvf ./build-hs789

# create directory
mkdir -p ./build-hs789/src
mkdir -p ./build-hs789/out

# copy from Horizon B789 source into build
cp -rva ./horizonsim-789/src/model/. ./build-hs789/src/model

# create target directory for base aircraft
mkdir -p ./build-hs789/out/horizonsim-aircraft-787-9

# copy B789 base to out
cp -rva ./horizonsim-789/src/base/horizonsim-aircraft-787-9/. ./build-hs789/out/horizonsim-aircraft-787-9