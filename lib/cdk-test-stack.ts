import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as fs from 'fs';
import { Role, ServicePrincipal, PolicyStatement, Effect, PolicyDocument } from 'aws-cdk-lib/aws-iam';
import * as db from 'aws-sdk/clients/dynamodb';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { StreamEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as iam from 'aws-cdk-lib/aws-iam';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export class CDKTestStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        const table = new dynamodb.Table(this, 'MyTable', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            stream: dynamodb.StreamViewType.NEW_IMAGE,
        });

        const helloFunction = new lambda.Function(this, 'MyLambdaFunctionTest', {
            code: lambda.Code.fromInline(`
                exports.handler = (event) => {
                    console.log("Hello World!");
                };
            `),
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: "index.handler",
            timeout: cdk.Duration.seconds(3)
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

        // helloFunction.addEventSource(new DynamoEventSource(table, {
        //     startingPosition: lambda.StartingPosition.TRIM_HORIZON,
        //     batchSize: 5,
        //     bisectBatchOnError: true,
        //     retryAttempts: 10,
        // }));

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

        // const existingTable = dynamodb.Table.fromTableName(this, 'v2_collectpoint_dpd_private', 'v2_collectpoint_dpd_private');

        // existingTable.grantStream(helloFunction);

        const dynamoDB = new db();

        const stack = this;

        dynamoDB.listTables(function (err, data) {
            if (err) {
                console.error(err);
            } else {
                const tableNames = data.TableNames || [];
                const tables = tableNames.map(tableName => {
                    return dynamodb.Table.fromTableName(stack, tableName, tableName);
                });

                tables.forEach(table => {
                    helloFunction.addEventSource(new DynamoEventSource(table, {
                        startingPosition: lambda.StartingPosition.TRIM_HORIZON,
                        batchSize: 5,
                        bisectBatchOnError: true,
                        retryAttempts: 10,
                    }));
                });
            }
        });
    }
}