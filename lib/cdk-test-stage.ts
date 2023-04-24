import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CDKTestStack } from './cdk-test-stack';

export class CollecpointIngressStage extends cdk.Stage {
    constructor(scope: Construct, id: string, props: cdk.StageProps) {
        super(scope, id, props);

        const lambdaStack = new CDKTestStack(this, 'CDKTestStage', props);
    }
}