#!/bin/bash
# Helper script to run the k6 load test inside a Docker container.
# This avoids needing to install k6 locally on the developer machine.

# Resolve the directory of this script to locate k6-load-test.js
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Default API URL to backend container or localhost
API_URL=${1:-"http://localhost:3000/api/v1"}

echo "=========================================================="
echo "Starting k6 load test against: $API_URL"
echo "=========================================================="

# Run k6 container. 
# --network=host allows the container to talk to localhost:3000 directly.
# -i runs interactively, passing the test script content over stdin.
docker run --rm -i --network=host \
  -e API_URL="$API_URL" \
  grafana/k6 run - < "$DIR/k6-load-test.js"
