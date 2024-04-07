import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as iam from "aws-cdk-lib/aws-iam";
import * as fs from "fs";
import * as path from "path";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, {
      env: {
        account: "659946347679",
        region: "us-east-1",
      },
      ...props,
    });

    const states = [
      "Utah",
      "California",
      "Nevada",
      "Arizona",
      "Colorado",
      "Texas",
      "NewMexico",
      "Oregon",
      "Washington",
      "Idaho",
      "Montana",
      "Wyoming",
      "NorthDakota",
      "SouthDakota",
      "Nebraska",
      "Kansas",
      "Oklahoma",
      "Minnesota",
    ];

    // Lambda
    const lambdaFunction = new lambda.Function(this, "MyFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda/apiHandler")),
    });

    // Route 53
    const domainName = "clientcultivator.biz";
    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: domainName,
    });

    // S3
    const clientCultivatorWebsiteBucketName = "clientcultivator.biz";
    const clientCultivatorWebsiteBucket = new s3.Bucket(
      this,
      clientCultivatorWebsiteBucketName,
      {
        bucketName: clientCultivatorWebsiteBucketName,
        websiteIndexDocument: "index.html",
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        versioned: true,
        blockPublicAccess: {
          blockPublicAcls: false,
          blockPublicPolicy: false,
          ignorePublicAcls: false,
          restrictPublicBuckets: false,
        },
        publicReadAccess: true,
      },
    );

    new s3deploy.BucketDeployment(this, "DeployClientCultivatorWebsite", {
      sources: [s3deploy.Source.asset("../ClientCultivatorFrontend/dist")],
      destinationBucket: clientCultivatorWebsiteBucket,
    });

    const clientCultivatorCloudfrontOAI = new cloudfront.OriginAccessIdentity(
      this,
      `ClientCultivatorCloudfrontOAI`,
      {
        comment: `OAI for ${clientCultivatorWebsiteBucket.bucketName} bucket.`,
      },
    );

    clientCultivatorWebsiteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [clientCultivatorWebsiteBucket.arnForObjects("*")],
        principals: [
          new iam.CanonicalUserPrincipal(
            clientCultivatorCloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId,
          ),
        ],
      }),
    );
    const clientCultivatorDomainName = "clientcultivator.biz";
    const clientCultivatorCloudfrontSiteCertificate = new acm.Certificate(
      this,
      `ClientCultivatorCloudfrontSiteCertificate`,
      {
        domainName: clientCultivatorDomainName,
        validation: acm.CertificateValidation.fromDns(hostedZone),
      },
    );
    const clientCultivatorViewerCertificate = cloudfront.ViewerCertificate.fromAcmCertificate(
      clientCultivatorCloudfrontSiteCertificate,
      {
        aliases: [clientCultivatorDomainName],
      },
    );
    const clientCultivatorDistribution = new cloudfront.CloudFrontWebDistribution(
      this,
      `ClientCultivatorCloudFrontDistribution`,
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: clientCultivatorWebsiteBucket,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
        viewerCertificate: clientCultivatorViewerCertificate,
        errorConfigurations: [
          {
            errorCode: 404,
            responsePagePath: "/index.html",
            responseCode: 200,
            errorCachingMinTtl: 300,
          },
          {
            errorCode: 403,
            responsePagePath: "/index.html",
            responseCode: 200,
            errorCachingMinTtl: 300,
          },
        ],
      },
    );
    const clientCultivatorRecordName = "clientcultivator.biz";
    new route53.ARecord(this, `ClientCultivatorCloudFrontARecord`, {
      zone: hostedZone,
      recordName: clientCultivatorRecordName,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(clientCultivatorDistribution),
      ),
    });


    states.forEach((state) => {
      const websiteBucketName = `${state.toLowerCase()}.solarpanelsolutions.clientcultivator.biz`;
      const websiteBucket = new s3.Bucket(this, websiteBucketName, {
        bucketName: websiteBucketName,
        websiteIndexDocument: "index.html",
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        versioned: true,
        blockPublicAccess: {
          blockPublicAcls: false,
          blockPublicPolicy: false,
          ignorePublicAcls: false,
          restrictPublicBuckets: false,
        },
        publicReadAccess: true,
      });

      const tempDir = fs.mkdtempSync(path.join("/tmp", "config-"));
      const tempFilePath = path.join(tempDir, "config.json");

      fs.writeFileSync(
        tempFilePath,
        JSON.stringify(
          {
            State: state,
          },
          null,
          2,
        ),
      );

      new s3deploy.BucketDeployment(this, `Deploy${state}Website`, {
        sources: [
          s3deploy.Source.asset("../SolarPanelSolutions/build"),
          s3deploy.Source.asset(tempDir),
        ],
        destinationBucket: websiteBucket,
      });

      // CloudFront
      const cloudfrontOAI = new cloudfront.OriginAccessIdentity(
        this,
        `CloudfrontOAI${state}`,
        {
          comment: `OAI for ${websiteBucket.bucketName} bucket.`,
        },
      );

      websiteBucket.addToResourcePolicy(
        new iam.PolicyStatement({
          actions: ["s3:GetObject"],
          resources: [websiteBucket.arnForObjects("*")],
          principals: [
            new iam.CanonicalUserPrincipal(
              cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId,
            ),
          ],
        }),
      );

      const domainName = `${state.toLowerCase()}.solarpanelsolutions.clientcultivator.biz`;
      const cloudfrontSiteCertificate = new acm.Certificate(
        this,
        `CloudFrontSiteCertificate${state}`,
        {
          domainName: domainName,
          validation: acm.CertificateValidation.fromDns(hostedZone),
        },
      );

      const viewerCertificate = cloudfront.ViewerCertificate.fromAcmCertificate(
        cloudfrontSiteCertificate,
        {
          aliases: [domainName],
        },
      );

      const distribution = new cloudfront.CloudFrontWebDistribution(
        this,
        `CloudFrontDistribution${state}`,
        {
          originConfigs: [
            {
              s3OriginSource: {
                s3BucketSource: websiteBucket,
              },
              behaviors: [{ isDefaultBehavior: true }],
            },
          ],
          viewerCertificate: viewerCertificate,
          errorConfigurations: [
            {
              errorCode: 404,
              responsePagePath: "/index.html",
              responseCode: 200,
              errorCachingMinTtl: 300,
            },
            {
              errorCode: 403,
              responsePagePath: "/index.html",
              responseCode: 200,
              errorCachingMinTtl: 300,
            },
          ],
        },
      );

      const recordName = `${state.toLowerCase()}.solarpanelsolutions`;
      new route53.ARecord(this, `CloudFrontARecord${state}`, {
        zone: hostedZone,
        recordName: recordName,
        target: route53.RecordTarget.fromAlias(
          new route53Targets.CloudFrontTarget(distribution),
        ),
      });
    });

    const siteCertificate = new acm.Certificate(this, "SiteCertificate", {
      domainName: "*.clientcultivator.biz",
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // API Gateway
    const apiDomainName = "api.clientcultivator.biz";
    const api = new apigateway.LambdaRestApi(this, "api.clientcultivator", {
      handler: lambdaFunction,
      domainName: {
        domainName: apiDomainName,
        certificate: siteCertificate,
      },
      proxy: false,
    });

    const apiKey = new apigateway.ApiKey(this, "MyApiKey", {
      apiKeyName: "MyApiKey",
      description: "API key for accessing MyFunction",
    });

    const usagePlan = new apigateway.UsagePlan(this, "UsagePlan", {
      name: "MyUsagePlan",
      throttle: {
        rateLimit: 10, // Max number of requests per second
        burstLimit: 20, // Max number of concurrent requests
      },
      quota: {
        limit: 10000, // Max number of requests in a specified time period
        period: apigateway.Period.MONTH,
      },
    });

    // Associate the API key with the usage plan
    usagePlan.addApiKey(apiKey);

    // Associate your REST API with the usage plan
    usagePlan.addApiStage({
      stage: api.deploymentStage,
      api: api,
    });

    // Define the CORS options
    const leadResource = api.root.addResource("lead");
    const corsOptions = {
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: apigateway.Cors.ALL_METHODS,
      allowHeaders: apigateway.Cors.DEFAULT_HEADERS.concat(["x-api-key"]),
    };

    leadResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(lambdaFunction),
      {
        apiKeyRequired: true, // Require an API Key for this method
      },
    );

    leadResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(lambdaFunction),
      {
        apiKeyRequired: true,
        // Enable CORS for the POST method
        methodResponses: [
          {
            statusCode: "200",
            responseModels: {
              "application/json": apigateway.Model.EMPTY_MODEL,
            },
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
              "method.response.header.Access-Control-Allow-Headers": true,
              "method.response.header.Access-Control-Allow-Methods": true,
            },
          },
        ],
      },
    );

    leadResource.addCorsPreflight(corsOptions);

    // Route 53 Records
    new route53.ARecord(this, "APIGatewayARecord", {
      zone: hostedZone,
      recordName: apiDomainName,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.ApiGateway(api),
      ),
    });

    new route53.TxtRecord(this, "DomainVerificationRecord", {
      zone: hostedZone,
      values: [
        "google-site-verification=9j0leehbW0QOr90z5PT-HX9fCwrHBsRzPI86FsITNVk",
      ],
    });

    // DynamoDB
    const table = new dynamodb.Table(this, "LeadsTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      tableName: "Leads",
    });

    table.grantReadWriteData(lambdaFunction);
  }
}
