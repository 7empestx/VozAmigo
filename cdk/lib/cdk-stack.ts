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
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";

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
    const domainName = "grantstarkman.com";
    hostedZone = route53.HostedZone.fromLookup(this, `${stage}-HostedZone`, {
      domainName: domainName,
    });

    // S3 Bucket for Website Hosting
    const vozAmigoWebsiteBucketName = `vozamigo.grantstarkman.com`;
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
      apiUrl: "https://api.grantstarkman.com/question",
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
    //const vozAmigoDomainName = `${stage}.vozamigo.grantstarkman.com`;
    const vozAmigoDomainName = "vozamigo.grantstarkman.com";
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
    const vozAmigoDistribution = new cloudfront.Distribution(
      this,
      "VozAmigoDistribution",
      {
        comment: `CloudFront distribution for ${vozAmigoWebsiteBucket.bucketName} bucket.`,
        defaultBehavior: {
          responseHeadersPolicy: new cloudfront.ResponseHeadersPolicy(
            this,
            "ResponseHeadersPolicy",
            {
              customHeadersBehavior: {
                customHeaders: [
                  {
                    header: "cache-control",
                    value: "no-store",
                    override: true,
                  },
                ],
              },
            },
          ),
          origin: new origins.S3Origin(vozAmigoWebsiteBucket, {
            originAccessIdentity: vozAmigoCloudfrontOAI,
          }),

          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
          },
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
          },
        ],
        defaultRootObject: "index.html",
        domainNames: ["vozamigo.grantstarkman.com"],
        certificate: vozAmigoCloudfrontSiteCertificate,
      },
    );

    // Route 53 Records for Cloudfront Distribution Frontend
    //const vozAmigoRecordName = `${stage}.vozamigo.grantstarkman.com`;
    const vozAmigoRecordName = "vozamigo.grantstarkman.com";
    new route53.ARecord(this, `VozAmigoCloudFrontARecord`, {
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
    const geminiLambdaFunction = new lambda.Function(this, `GeminiFunction`, {
      functionName: `gemini-lambda-function`,
      code: lambda.Code.fromEcrImage(repository, {
        tag: "latest",
      }),
      handler: lambda.Handler.FROM_IMAGE,
      runtime: lambda.Runtime.FROM_IMAGE,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
      environment: {
        GEMINI_API_KEY: "",
      },
      tracing: lambda.Tracing.ACTIVE,
    });

    // Lambda Rest API
    const apiDomainName = `api.grantstarkman.com`;
    const api = new apigateway.LambdaRestApi(this, `api.grantstarkman.com`, {
      handler: geminiLambdaFunction,
      apiKeySourceType: apigateway.ApiKeySourceType.HEADER,
      domainName: {
        domainName: apiDomainName,
        certificate: acm.Certificate.fromCertificateArn(
          this,
          "ApiCertificateArn",
          "arn:aws:acm:us-east-1:659946347679:certificate/84ad3177-76df-4e35-8130-007428a7ed5e",
        ),
      },
      proxy: false,
    });

    // Define the CORS options
    const questionResource = api.root.addResource("question");
    questionResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(geminiLambdaFunction),
    );
    questionResource.addCorsPreflight({
      allowOrigins: ["*"],
      allowMethods: ["GET"],
    });

    // Route 53 Records
    new route53.ARecord(this, `ApiGateway-ARecord`, {
      zone: hostedZone,
      recordName: apiDomainName,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.ApiGateway(api),
      ),
      deleteExisting: true,
    });
  }
}
