const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const uuidv4 = require('uuid').v4;
import { APIGatewayProxyEvent } from 'aws-lambda';

exports.handler = async (event: APIGatewayProxyEvent) => {
    const data = event.body ? JSON.parse(event.body) : {};
    const operation = event.httpMethod === 'GET' ? 'read' : event.body ? JSON.parse(event.body).operation : null;

    if (operation === 'write') {
        // Generate a unique ID for this entry
        const id = uuidv4();

        const params = {
            TableName: "Leads",
            Item: {
                id: id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                state: data.state,
                business: data.business
            }
        };

        try {
            await dynamoDB.put(params).promise();
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": true,
                },
                body: JSON.stringify({
                    message: `Lead with ID ${id} stored successfully`
                })
            };
        } catch (error) {
            console.error("DynamoDB error: ", error);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: "Failed to store lead",
                    error: error
                })
            };
        }
    } else if (operation === 'read') {
        // Assuming you want to scan the table to get all items
        const params = {
            TableName: "Leads",
        };

        try {
            const result = await dynamoDB.scan(params).promise();
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": true,
                },
                body: JSON.stringify({
                    message: "Successfully retrieved all leads",
                    data: result.Items // Return the array of items
                })
            };
        } catch (error) {
            console.error("DynamoDB error: ", error);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: "Failed to retrieve leads",
                    error: error
                })
            };
        }
    } else {
        // Handle unknown operation
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Invalid operation specified"
            })
        };
    }
};
