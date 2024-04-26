import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
// import { stepFunctionSandbox } from './step-function';
import * as ssm from '@aws-cdk/aws-ssm';

export class CDKTestStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        const helloFunctionNumberOne = new lambda.Function(this, 'MyLambdaFunctionTest', {
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
                REGION: props.env?.region!,
            },
        });

        // Retrieve the parameter
        const parameter = ssm.StringParameter.fromStringParameterName(this, 'MyParameter', 'publicNetworks');

        // Update the parameter value
        parameter.setParameter('new-value', { overwrite: true });

        // const testSandbox = stepFunctionSandbox(this);
    }
}