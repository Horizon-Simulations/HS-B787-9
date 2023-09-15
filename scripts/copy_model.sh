set -ex

# copy from Horizon B789 model source into build
cp -rva ./horizonsim-789/src/base/. ./horizonsim-789/build/
cp -rva ./horizonsim-789/src/model/build/. ./horizonsim-789/build/horizonsim-aircraft-787-9/SimObjects/Airplanes/HS_B787_9/model.GE
cp -rva ./horizonsim-789/src/model/build/. ./horizonsim-789/build/horizonsim-aircraft-787-9/SimObjects/Airplanes/HS_B787_9/model.RR