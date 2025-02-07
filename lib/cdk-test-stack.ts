import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { stepFunctionSandbox } from './step-function';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as iam from 'aws-cdk-lib/aws-iam';

export class CDKTestStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        const helloFunctionNumberOne = new lambda.Function(this, 'MyLambdaFunctionTest', {
            code: lambda.Code.fromAsset('./lambda/dist'),
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "index.handler",
            timeout: cdk.Duration.seconds(3),
            environment: {
                REGION: props.env?.region!,
            },
            architecture: lambda.Architecture.ARM_64,
        });

        helloFunctionNumberOne.grantPrincipal.addToPrincipalPolicy(new iam.PolicyStatement({
            resources: [
                'arn:aws:s3:::mr-big-bucket/*'
            ],
            actions: [
                "s3:PutObject",
                "s3:GetObject"],
            effect: iam.Effect.ALLOW
        }));

        new ssm.StringParameter(this, 'MyParameter', {
            parameterName: '/myapp/config/myparameter',
            stringValue: 'myparameter-value, helllooo, new parameter',
        });

        const testSandbox = stepFunctionSandbox(this);
    }
}