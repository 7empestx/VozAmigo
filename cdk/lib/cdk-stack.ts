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
    console.log(`Deploying to stage: ${stage}`);

    // Specify the ECR repository
    const repository = ecr.Repository.fromRepositoryName(
      this,
      "GeminiRepository",
      "gemini",
    );

    // Define the Lambda function
    const geminiLambdaFunction = new lambda.Function(this, `${stage}-GeminiFunction`, {
      functionName: `${stage}-gemini-lambda-function`,
      code: lambda.Code.fromEcrImage(repository, {
        tag: "latest",
      }),
      handler: lambda.Handler.FROM_IMAGE,
      runtime: lambda.Runtime.FROM_IMAGE,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
    });

    // Route 53
    const domainName = "grantstarkman.com";
    const hostedZone = route53.HostedZone.fromLookup(this, `${stage}-HostedZone`, {
      domainName: domainName,
    });

    // S3
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

    // Define JSON content and create a temp file
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

    const vozAmigoCloudfrontOAI = new cloudfront.OriginAccessIdentity(
      this,
      `${stage}-VozAmigoCloudfrontOAI`,
      {
        comment: `OAI for ${vozAmigoWebsiteBucket.bucketName} bucket.`,
      },
    );

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

    const vozAmigoDomainName = `${stage}.vozamigo.grantstarkman.com`;
    const vozAmigoCloudfrontSiteCertificate = new acm.Certificate(
      this,
      `${stage}-VozAmigoCloudfrontSiteCertificate`,
      {
        domainName: vozAmigoDomainName,
        validation: acm.CertificateValidation.fromDns(hostedZone),
      },
    );

    const vozAmigoViewerCertificate =
      cloudfront.ViewerCertificate.fromAcmCertificate(
        vozAmigoCloudfrontSiteCertificate,
        {
          aliases: [vozAmigoDomainName],
        },
      );

    const vozAmigoDistribution = new cloudfront.CloudFrontWebDistribution(
      this,
      `${stage}-VozAmigoCloudFrontDistribution`,
      {
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

    const vozAmigoRecordName = `${stage}.vozamigo.grantstarkman.com`;
    new route53.ARecord(this, `${stage}-VozAmigoCloudFrontARecord`, {
      zone: hostedZone,
      recordName: vozAmigoRecordName,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(vozAmigoDistribution),
      ),
    });

    const siteCertificate = new acm.Certificate(this, `${stage}-SiteCertificate`, {
      domainName: `${stage}.api.vozamigo.grantstarkman.com`,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // API Gateway
    const apiDomainName = `${stage}.api.vozamigo.grantstarkman.com`;
    const api = new apigateway.LambdaRestApi(this, `${stage}.api.vozamigo.grantstarkman.com`, {
      handler: geminiLambdaFunction,
      apiKeySourceType: apigateway.ApiKeySourceType.HEADER,
      domainName: {
        domainName: apiDomainName,
        certificate: siteCertificate,
      },
      proxy: false,
      defaultCorsPreflightOptions: {
        allowOrigins: ['https://alpha.vozamigo.grantstarkman.com'],
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS.concat(["x-api-key"]),
        allowCredentials: true,
      },
    });

    api.addGatewayResponse("Default4xx", {
      type: apigateway.ResponseType.DEFAULT_4XX,
      responseHeaders: {
        "Access-Control-Allow-Origin": "'https://alpha.vozamigo.grantstarkman.com/'",
        "Access-Control-Allow-Headers": "'*'",
        "Access-Control-Allow-Methods": "'*'",
      },
    });

    const apiKey = new apigateway.ApiKey(this, "${stage}-api.vozamigo-ApiKey", {
      apiKeyName: `${stage}-api.vozamigo-ApiKey`,
      description: `API key for accessing the ${stage} grantstarkman.com API.`,
    });

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
    });

    // Associate the API key with the usage plan
    usagePlan.addApiKey(apiKey);

    // Associate your REST API with the usage plan
    usagePlan.addApiStage({
      stage: api.deploymentStage,
      api: api,
    });

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
