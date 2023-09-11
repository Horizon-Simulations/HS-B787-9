#!/bin/bash

set -ex

df -h

#remove directory if it exist
rm -rvf ./horizonsim-789/build/

mkdir -p ./horizonsim-789/build/
# copy from Horizon B789 model source into build
cp -rva ./horizonsim-789/src/base/. ./horizonsim-789/build/

# for now use working legacy model
cp -rva ./horizonsim-789/src/model/legacy/. ./horizonsim-789/build/horizonsim-aircraft-787-9/SimObjects/Airplanes/HS_B787_9/model.GE
cp -rva ./horizonsim-789/src/model/legacy/. ./horizonsim-789/build/horizonsim-aircraft-787-9/SimObjects/Airplanes/HS_B787_9/model.RR
