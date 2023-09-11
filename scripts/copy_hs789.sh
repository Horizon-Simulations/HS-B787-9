#!/bin/bash

set -ex

df -h

#remove directory if it exist
rm -rvf ./horizonsim-789/build/

# create directory
mkdir -p ./build-hs789/src
mkdir -p ./build-hs789/out

# copy from Horizon B789 model source into build
cp -rva ./horizonsim-789/src/model/build/ ./horizonsim-789/build/horizonsim-aircraft-787-9/SimObjects/Airplanes/HS_B787_9/model.GE
cp -rva ./horizonsim-789/src/model/build/ ./horizonsim-789/build/horizonsim-aircraft-787-9/SimObjects/Airplanes/HS_B787_9/model.RR
