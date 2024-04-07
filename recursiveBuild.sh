#!/bin/bash

set -e # Exit immediately if a command exits with a non-zero status.

echo "Starting build and deployment script..."

# Verify that AWS CLI is installed
if ! command -v aws &> /dev/null
then
    echo "AWS CLI could not be found. Please install it to proceed."
    exit 1
fi

# Verify that CDK CLI is installed
if ! command -v cdk &> /dev/null
then
    echo "AWS CDK CLI could not be found. Please install it to proceed."
    exit 1
fi

echo "Building the ClientCultivatorFrontend application..."
cd ClientCultivatorFrontend
npm ci
npm run build
echo "ClientCultivator application built successfully."
cd ..

echo "Building the Solar Panel front-end application..."
cd SolarPanelSolutions
npm run build
echo "Front-end application built successfully."
cd ..

echo "Building the Lambda function..."
cd cdk/lambda/apiHandler
npm run build
echo "Lambda function built successfully."
cd ../..

echo "Synthesizing the CDK application..."
cdk synth
echo "CDK application synthesized successfully."

echo "Deploying the CDK stack..."
cdk deploy --require-approval never
echo "CDK stack deployed successfully."

echo "Build and deployment script completed."
