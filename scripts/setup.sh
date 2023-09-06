#!/bin/bash

set -ex

git config --global --add safe.directory "*"

cd /external
rm -rf node_modules
python3 --version
npm ci