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
import * as AWS from 'aws-sdk';

export class CDKTestStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        // const table = new dynamodb.Table(this, 'MyTable', {
        //     partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
        //     stream: dynamodb.StreamViewType.NEW_IMAGE,
        // });

        const theTest = [] as any;

        const dynamodb = new AWS.DynamoDB({
            accessKeyId: 'ASIAWSTQLOBY5XZGUWPN',
            secretAccessKey: 'IQoJb3JpZ2luX2VjEEsaCWV1LXdlc3QtMSJIMEYCIQDBwUFV0fvSeSZOTrEa7ZwSVn3QIiLycMLeBL5aziP2dgIhAN/qJWhu9ES6ImmJJNxaUwPw4SveZoBWGXURDqL5m1KpKpMDCGQQABoMNDUyMjgwOTM4NjA5IgximhFXG1ot8iFZYKUq8ALuGZeIHer1IDLBPjCkYi4028Qa6RlQi+VbhCs+n6SV9orprGRnXKw58G7MwiKd5/8dMDWqplI9eWwchsOnbrEx5i7F6vP8pG+200L1XbQMAVophkyP8TmGCDb/lsfEuX/7kc2IpzUIeZacVyirwe9n9nbTby/A4Scif6n1gzju1xIYO4rZb8lh0C5GPsZTRnrvRcU/oTeYhZgtimbOVYYG449xgmNSiNOeNa9aFhrOFfMvTDNx7e3/8OATdiyzvfUSSszej1tgwYOk2ggUA19kaBab5ycdfi3zLiqZs5VewAzqDvVHGcaj112Ht+fvU6buxFZTv0+uL1BV5Kw/19jqKFh2kdHf/xhtXlxnHS86UZ4vLaFVGKe4WrmJP0LXaJE9Q+hM2eA+Cc/ZYkWxrh0ZChGQB7tha3GjsbEnVhu/5w19BsP7KBdN2ezT4sDCOC6yS8pwSV6FyOsbSiLwvIAIMSq5093XnNT4KxJBwLItozD2i+WiBjqlAWL/rl7WXMDiFSxQmlfK9sBGViLc2jG+4qZWGin8Di7B+c1Ev6GRX3TzQCCmKcJ58sh1CqGGA1/TUfEUPEcbnL53cgTM/Qr8T+AsyRQ4kRAZanl/SeqtScWY/NvgJvXE1Bb3FI36Ou/mcMh/RUiebH8W6u6r9JeCI/8673OSmwmb0Yr15/d/g+ag4HpMdCbTJkr+4esDaz7FYQJ5i+JtRggy+03/wQ=='
        });

        // Retrieve the names of all tables in the account
        dynamodb.listTables({}, (err, data) => {
            if (err) {
                console.error(err);
            } else {
                theTest.push(data.TableNames)
                console.log(data.TableNames);
            }
        });

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
                THE_TEST: theTest
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

        //const dynamoDB = new db();

        // //const stack = this;

        // dynamoDB.listTables(function (err, data) {
        //     if (err) {
        //         console.log(err)
        //     } else {
        //         console.log(data)
        //     }
        // })

        // dynamoDB.listTables(function (err, data) {
        //     if (err) {
        //         console.error(err);
        //     } else {
        //         const tableNames = data.TableNames || [];
        //         const tables = tableNames.map(tableName => {
        //             return dynamodb.Table.fromTableName(stack, tableName, tableName);
        //         });

        //         tables.forEach(table => {
        //             helloFunction.addEventSource(new DynamoEventSource(table, {
        //                 startingPosition: lambda.StartingPosition.TRIM_HORIZON,
        //                 batchSize: 5,
        //                 bisectBatchOnError: true,
        //                 retryAttempts: 10,
        //             }));
        //         });
        //     }
        // });
    }
}