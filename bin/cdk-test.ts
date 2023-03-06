#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkTestStack } from '../lib/cdk-test-stack';

const app = new cdk.App();
new CdkTestStack(app, 'CdkTestStack', {

  env: { account: '452280938609', region: 'eu-west-1' },

});