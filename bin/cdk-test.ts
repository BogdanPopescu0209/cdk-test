import * as cdk from 'aws-cdk-lib';
import { CdkTestStack } from '../lib/cdk-test-stack-pipeline';

const app = new cdk.App();

new CdkTestStack(app, 'CdkTestStack', {

  env: { account: '452280938609', region: 'eu-west-1' },

});

new CdkTestStack(app, 'CdkTestStack', {

  env: { account: '452280938609', region: 'us-west-2' },

});