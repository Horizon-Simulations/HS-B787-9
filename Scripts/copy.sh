#!/bin/bash

set -ex

df -h

rm -rvf HorizonSim-789/testme
mkdir -p ./HorizonSim-789/src/models/testme
cp -rva ./HorizonSim-789/src/base/. ./HorizonSim-789/testme
cp -rva ./Scripts/replace.py ./HorizonSim-789/src/models/testme/