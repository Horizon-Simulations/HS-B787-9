#!/bin/bash

set -ex

df -h

rm -rvf ./hs789-out/HorizonSim-789
mkdir -p ./hs789-out
cp -rva ./HorizonSim-789/src/base/. ./hs789-out/
cp -rva ./Scripts/replace.py ./hs789-out/src/model/testme/