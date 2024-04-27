import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as iam from "aws-cdk-lib/aws-iam";
import * as fs from "fs";
import * as path from "path";
import * as ecr from "aws-cdk-lib/aws-ecr";

interface CustomStackProps extends cdk.StackProps {
  stage: string;
}

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CustomStackProps) {
    super(scope, id, {
      ...props,
    });

    const stage = props.stage;

    // Frontend Setup
    // Route53 Records for Site Hosting
    let hostedZone: route53.IHostedZone;
    if (stage === "alpha") {
      const domainName = "grantstarkman.com";
      hostedZone = route53.HostedZone.fromLookup(
        this,
        `${stage}-HostedZone`,
        {
          domainName: domainName,
        },
      );
    } else {
      hostedZone = route53.HostedZone.fromHostedZoneAttributes(
        this,
        `${stage}-HostedZone`,
        {
          hostedZoneId: 'Z02660942J8A2F4D19HYD',
          zoneName: `${stage}-grantstarkman.com`,
        },
      );
    }

    // S3 Bucket for Website Hosting
    const vozAmigoWebsiteBucketName = `${stage}-vozamigo.grantstarkman.com`;
    const vozAmigoWebsiteBucket = new s3.Bucket(
      this,
      vozAmigoWebsiteBucketName,
      {
        bucketName: vozAmigoWebsiteBucketName,
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

    // S3 Deployment - Drop environment.json file into S3 bucket
    const jsonData = {
      environment: stage,
      apiUrl: "https://alpha.api.vozamigo.grantstarkman.com/question",
    };

    const dedicatedDir = path.join(__dirname, "tempAssets");
    if (!fs.existsSync(dedicatedDir)) {
      fs.mkdirSync(dedicatedDir);
    }
    const jsonFilePath = path.join(dedicatedDir, "environment.json");
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));

    new s3deploy.BucketDeployment(this, `${stage}-DeployVozAmigo`, {
      sources: [
        s3deploy.Source.asset("../VozAmigoFrontend/build"),
        s3deploy.Source.asset(dedicatedDir),
      ],
      destinationBucket: vozAmigoWebsiteBucket,
    });

    // Cloudfront OAI for S3 Bucket
    const vozAmigoCloudfrontOAI = new cloudfront.OriginAccessIdentity(
      this,
      `${stage}-VozAmigoCloudfrontOAI`,
      {
        comment: `OAI for ${vozAmigoWebsiteBucket.bucketName} bucket.`,
      },
    );
    vozAmigoWebsiteBucket.grantRead(vozAmigoCloudfrontOAI);

    // Add permissions for CloudFront OAI to access the S3 bucket
    vozAmigoWebsiteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [vozAmigoWebsiteBucket.arnForObjects("*")],
        principals: [
          new iam.CanonicalUserPrincipal(
            vozAmigoCloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId,
          ),
        ],
      }),
    );

    // ACM Certificate for Cloudfront Frontend
    const vozAmigoDomainName = `${stage}.vozamigo.grantstarkman.com`;
    const vozAmigoCloudfrontSiteCertificate = new acm.Certificate(
      this,
      `${stage}-VozAmigoCloudfrontSiteCertificate`,
      {
        domainName: vozAmigoDomainName,
        certificateName: `${stage}-VozAmigoCloudfrontSiteCertificate`,
        validation: acm.CertificateValidation.fromDns(hostedZone),
      },
    );

    // Viewer Certificate for Cloudfront Distribution Frontend
    const vozAmigoViewerCertificate =
      cloudfront.ViewerCertificate.fromAcmCertificate(
        vozAmigoCloudfrontSiteCertificate,
        {
          aliases: [vozAmigoDomainName],
        },
      );

    // Cloudfront Distribution for Frontend
    const vozAmigoDistribution = new cloudfront.CloudFrontWebDistribution(
      this,
      `${stage}-VozAmigoCloudFrontDistribution`,
      {
        comment: `CloudFront distribution for ${vozAmigoWebsiteBucket.bucketName} bucket.`,
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: vozAmigoWebsiteBucket,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
        viewerCertificate: vozAmigoViewerCertificate,
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

    // Route 53 Records for Cloudfront Distribution Frontend
    const vozAmigoRecordName = `${stage}.vozamigo.grantstarkman.com`;
    new route53.ARecord(this, `${stage}-VozAmigoCloudFrontARecord`, {
      zone: hostedZone,
      recordName: vozAmigoRecordName,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(vozAmigoDistribution),
      ),
    });

    // Backend Setup
    // ECR Gemini
    const repository = ecr.Repository.fromRepositoryArn(
      this,
      "GeminiRepository",
      "arn:aws:ecr:us-east-1:659946347679:repository/gemini",
    );

    // Gemini Lambda Function
    const geminiLambdaFunction = new lambda.Function(
      this,
      `${stage}-GeminiFunction`,
      {
        functionName: `${stage}-gemini-lambda-function`,
        code: lambda.Code.fromEcrImage(repository, {
          tag: "latest",
        }),
        handler: lambda.Handler.FROM_IMAGE,
        runtime: lambda.Runtime.FROM_IMAGE,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(30),
      },
    );

    // Backend API Certificate for API Gateway
    const apiCertificate = new acm.Certificate(
      this,
      `${stage}-ApiCertificate`,
      {
        domainName: `${stage}.api.vozamigo.grantstarkman.com`,
        validation: acm.CertificateValidation.fromDns(hostedZone),
      },
    );

    // Lambda Rest API
    const apiDomainName = `${stage}.api.vozamigo.grantstarkman.com`;
    const api = new apigateway.LambdaRestApi(
      this,
      `${stage}.api.vozamigo.grantstarkman.com`,
      {
        handler: geminiLambdaFunction,
        apiKeySourceType: apigateway.ApiKeySourceType.HEADER,
        domainName: {
          domainName: apiDomainName,
          certificate: apiCertificate,
        },
        proxy: false,
        defaultCorsPreflightOptions: {
          allowOrigins: apigateway.Cors.ALL_ORIGINS,
          allowMethods: apigateway.Cors.ALL_METHODS,
          allowHeaders: apigateway.Cors.DEFAULT_HEADERS.concat(["x-api-key"]),
          allowCredentials: true,
        },
      },
    );

    // Add Gateway Responses
    api.addGatewayResponse("Default4xx", {
      type: apigateway.ResponseType.DEFAULT_4XX,
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
        "Access-Control-Allow-Headers": "'*'",
        "Access-Control-Allow-Methods": "'*'",
      },
    });

    // API Key for API Gateway
    const apiKey = new apigateway.ApiKey(this, "${stage}-api.vozamigo-ApiKey", {
      apiKeyName: `${stage}-api.vozamigo-ApiKey`,
      description: `API key for accessing the ${stage} grantstarkman.com API.`,
    });

    // Usage Plan for API Gateway
    const usagePlan = new apigateway.UsagePlan(this, `${stage}-UsagePlan`, {
      name: `${stage}-UsagePlan`,
      throttle: {
        rateLimit: 10,
        burstLimit: 20,
      },
      quota: {
        limit: 10000,
        period: apigateway.Period.MONTH,
      },
      apiStages: [
        {
          api: api,
          stage: api.deploymentStage,
        },
      ],
      description: `Usage plan for the ${stage} grantstarkman.com API.`,
    });
    usagePlan.addApiKey(apiKey);

    // Define the CORS options
    const questionResource = api.root.addResource("question");
    questionResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(geminiLambdaFunction),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseModels: {
              "application/json": apigateway.Model.EMPTY_MODEL,
            },
          },
        ],
      },
    );

    // Route 53 Records
    new route53.ARecord(this, `${stage}-ApiGateway-ARecord`, {
      zone: hostedZone,
      recordName: apiDomainName,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.ApiGateway(api),
      ),
    });
  }
}
