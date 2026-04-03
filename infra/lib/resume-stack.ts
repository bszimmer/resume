import * as path from 'path'
import * as cdk from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as targets from 'aws-cdk-lib/aws-route53-targets'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import type { Construct } from 'constructs'

interface ResumeStackProps extends cdk.StackProps {
  domainName: string
}

export class ResumeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ResumeStackProps) {
    super(scope, id, props)

    const { domainName } = props

    // ── 1. Hosted zone (must already exist in your account) ──────────────────
    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName,
    })

    // ── 2. TLS certificate (DNS-validated, us-east-1 required for CloudFront) ─
    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName,
      subjectAlternativeNames: [`www.${domainName}`],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    })

    // ── 3. S3 bucket (private — accessed only via CloudFront OAC) ────────────
    const bucket = new s3.Bucket(this, 'ResumeBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    })

    // ── 4. CloudFront distribution ───────────────────────────────────────────
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
      domainNames: [domainName, `www.${domainName}`],
      certificate,
      defaultRootObject: 'index.html',
      // SPA routing: return index.html for any 403/404 so Vue Router can handle the path
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
      ],
      // Reasonable security headers
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
    })

    // ── 5. Route 53 records (apex A + AAAA alias, www CNAME) ────────────────
    const cfTarget = route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution))

    new route53.ARecord(this, 'ARecord', {
      zone: hostedZone,
      target: cfTarget,
    })

    new route53.AaaaRecord(this, 'AaaaRecord', {
      zone: hostedZone,
      target: cfTarget,
    })

    new route53.CnameRecord(this, 'WwwRecord', {
      zone: hostedZone,
      recordName: 'www',
      domainName,
    })

    // ── 6. Deploy dist/ to S3 and invalidate CloudFront cache ────────────────
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../dist'))],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*'],
    })

    // ── 7. DynamoDB table for visit logs ─────────────────────────────────────
    const visitsTable = new dynamodb.Table(this, 'VisitsTable', {
      tableName: 'resume-visits',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    })

    // ── 8. Lambda — log visit to DynamoDB ────────────────────────────────────
    const logVisitFn = new lambda.Function(this, 'LogVisitFn', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'log-visit.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        TABLE_NAME: visitsTable.tableName,
      },
    })

    visitsTable.grantWriteData(logVisitFn)

    const logVisitUrl = logVisitFn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ['https://brennanzimmer.com'],
        allowedMethods: [lambda.HttpMethod.POST],
        allowedHeaders: ['Content-Type'],
      },
    })

    // ── Outputs ──────────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'CloudFrontDomain', {
      value: distribution.distributionDomainName,
      description: 'Test this URL directly while DNS propagates',
    })

    new cdk.CfnOutput(this, 'SiteUrl', {
      value: `https://${domainName}`,
    })

    new cdk.CfnOutput(this, 'LogVisitUrl', {
      value: logVisitUrl.url,
      description: 'Lambda Function URL for logging visits',
    })
  }
}
