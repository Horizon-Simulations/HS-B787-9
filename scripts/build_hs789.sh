#!/bin/bash

set -ex

# store current file ownership
ORIGINAL_USER_ID=$(stat -c '%u' /external)
ORIGINAL_GROUP_ID=$(stat -c '%g' /external)

# permission fix
git config --global --add safe.directory /external

# run build
time npx igniter -c igniter.config.mjs -r HS789 "$@"

if [ "${GITHUB_ACTIONS}" == "true" ]; then
  rm -rf /external/build-hs789/src
  rm -rf /external/horizonsim-789/src
fi

# restore ownership (when run as github action)
if [ "${GITHUB_ACTIONS}" == "true" ]; then
  chown -R ${ORIGINAL_USER_ID}:${ORIGINAL_GROUP_ID} /external
fi