#!/bin/bash

if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please copy .env.example to .env and add your API keys"
    exit 1
fi

echo "Building and starting Surrogates AI..."
docker-compose up --build
