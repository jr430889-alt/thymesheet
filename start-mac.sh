#!/bin/bash
cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies for first run..."
    npm install
    echo "Installation complete! Starting app..."
fi

npm start