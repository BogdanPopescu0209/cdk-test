import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as queue from 'aws-cdk-lib/aws-sqs';
import { networks } from '../shared/variables'
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class CDKTestStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        const latestStringToken = ssm.StringParameter.valueForStringParameter(
            this, 'test-parameter');

        const helloFunction = new lambda.Function(this, 'MyLambdaFunctionTest', {
            code: lambda.Code.fromInline(`
                exports.handler = (event) => {
                    console.log(event);
                    console.log("Hello World!");
                };
            `),
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: "index.handler",
            timeout: cdk.Duration.seconds(3),
            environment: {
                PUBLIC_NETWORKS: networks,
                PARAMETER_VALUE: latestStringToken
            }
        });

        helloFunction.grantPrincipal.addToPrincipalPolicy(new iam.PolicyStatement({
            resources: [
                '*'],
            actions: [
                "dynamodb:DescribeStream",
                "dynamodb:GetRecords",
                "dynamodb:GetShardIterator",
                "dynamodb:ListStreams"],
            effect: iam.Effect.ALLOW
        }));
    }
}