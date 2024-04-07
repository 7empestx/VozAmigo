#!/bin/bash

# Ask the user for the type of operation
read -p "Enter the type of operation (get or post): " operation_type

API_ENDPOINT=""
API_KEY=""
CONTENT_TYPE="application/json"

if [ "$operation_type" = "post" ]; then
    JSON_DATA=$(cat <<EOF
{
  "operation": "write",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "123-456-7890",
  "state": "",
  "business": ""
}
EOF
    )
    curl -X POST "$API_ENDPOINT" \
         -H "Content-Type: $CONTENT_TYPE" \
         -H "x-api-key: $API_KEY" \
         -d "$JSON_DATA"
elif [ "$operation_type" = "get" ]; then
    curl -X GET "$API_ENDPOINT" \
         -H "Content-Type: $CONTENT_TYPE" \
         -H "x-api-key: $API_KEY"
else
    echo "Invalid operation type. Please enter 'get' or 'post'."
fi
