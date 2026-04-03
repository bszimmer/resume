#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { ResumeStack } from '../lib/resume-stack'

const app = new cdk.App()

const domainName = app.node.tryGetContext('domainName') as string

new ResumeStack(app, 'BrennanResumeStack', {
  // us-east-1 is required — CloudFront only accepts ACM certs from this region
  env: { account: '959912792316', region: 'us-east-1' },
  domainName,
})
