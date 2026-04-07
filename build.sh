#!/bin/sh
# Build script for Cloudflare Pages
# Generates version.json from the latest git tag
VERSION=$(git describe --tags --always 2>/dev/null || echo "dev")
echo "{\"version\":\"$VERSION\"}" > version.json
