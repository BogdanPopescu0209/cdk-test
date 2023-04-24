import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';

export class CDKTestStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        const helloFunction = new lambda.Function(this, 'MyLambdaFunction', {
            code: lambda.Code.fromInline(`
                exports.handler = (event) => {
                    console.log("Hello World!");
                };
            `),
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: "index.handler",
            timeout: cdk.Duration.seconds(3)
        });

        const stateMachine = new sfn.StateMachine(this, 'MyStateMachine', {
            definition: new tasks.LambdaInvoke(this, "MyLambdaTask", {
                lambdaFunction: helloFunction
            }).next(new sfn.Succeed(this, "GreetedWorld"))
        });
    }
}