#!/usr/bin/env bash
# Packages this directory into function.zip for upload to AWS Lambda.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

echo "Installing production dependencies..."
rm -rf node_modules
npm ci --omit=dev

echo "Building function.zip..."
rm -f function.zip
zip -r -X -q function.zip index.js package.json node_modules

echo "Done: $(pwd)/function.zip ($(du -h function.zip | cut -f1))"
