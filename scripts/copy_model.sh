set -ex

mkdir -p ./horizonsim-789/build/horizonsim-aircraft-787-9/SimObjects/Airplanes/HorizonSim_B787_9_SHARED/model/
# copy from Horizon B789 model source into build
cp -rva ./horizonsim-789/src/model/build/*.bin ./horizonsim-789/build/horizonsim-aircraft-787-9/SimObjects/Airplanes/HorizonSim_B787_9_SHARED/model/.
cp -rva ./horizonsim-789/src/model/build/*.gltf ./horizonsim-789/build/horizonsim-aircraft-787-9/SimObjects/Airplanes/HorizonSim_B787_9_SHARED/model/.
