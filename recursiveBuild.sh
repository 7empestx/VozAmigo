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

echo "Building the VozAmigoFrontend application..."
cd VozAmigoFrontend
npm ci
npm run build
echo "VozAmigoFrontend application built successfully."
cd ..

echo "Building the Gemini Docker image..."
cd Gemini
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 659946347679.dkr.ecr.us-east-1.amazonaws.com
docker build --platform linux/amd64 -t 659946347679.dkr.ecr.us-east-1.amazonaws.com/gemini:latest .

echo "Pushing the Gemini Docker image to ECR..."
docker push 659946347679.dkr.ecr.us-east-1.amazonaws.com/gemini:latest
cd ..

echo "Synthesizing the CDK application..."
cd cdk
cdk synth
echo "CDK application synthesized successfully."

echo "Deploying the CDK stack..."
cdk deploy --require-approval never
echo "CDK stack deployed successfully."

echo "Updating the Lambda function code..."
aws lambda update-function-code --function-name alpha-gemini-lambda-function --image-uri 659946347679.dkr.ecr.us-east-1.amazonaws.com/gemini:latest | cat

echo "Invalidating the CloudFront cache..."
aws cloudfront create-invalidation --distribution-id ESZCT217A1VZO --paths "/*"

echo "Build and deployment script completed."
