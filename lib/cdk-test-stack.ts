import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as fs from 'fs';
import { Role, ServicePrincipal, PolicyStatement, Effect, PolicyDocument } from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-sdk/clients/dynamodb';

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

        // const stateMachine = new sfn.StateMachine(this, 'MyStateMachine', {
        //     definition: new tasks.LambdaInvoke(this, "MyLambdaTask", {
        //         lambdaFunction: helloFunction
        //     }).next(new sfn.Succeed(this, "GreetedWorld"))
        // });

        // const file = fs.readFileSync("./stepfunction/stepfunction-parser.json");

        // const role = new Role(this, 'StepFunctionRole', {
        //     assumedBy: new ServicePrincipal('states.amazonaws.com'),
        //     description: 'Role for Step Functions to access other AWS services',
        // });

        // const fileToString = file.toString();

        // const stepFunction = new sfn.CfnStateMachine(
        //     this,
        //     "cfnStepFunction",
        //     {
        //         roleArn: role.roleArn,
        //         definitionString: fileToString.replace(new RegExp('\\$\\$environment\\$\\$', 'g'), 'sandbox'),
        //         stateMachineName: 'sandbox-parser',
        //     }
        // );

        const dynamoDB = new dynamodb();

        dynamoDB.listTables(function (err, data) {
            if (err) err;
            else {
                data.TableNames?.forEach((tableName) => {
                    dynamoDB.describeTable({ TableName: tableName }, function (err, data) {
                        if (err) err;
                        else {
                            if (tableName === 'collectpoint-v2-evri-sandbox') {
                                helloFunction.addEventSourceMapping('MyMapping', {
                                    eventSourceArn: data.Table?.TableArn,
                                    batchSize: 100
                                });
                            }
                        };
                    });
                });
            };
        });

    }
}