import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as queue from 'aws-cdk-lib/aws-sqs';
import * as networks from '../shared/variables'

export class CDKTestStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

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
                PUBLIC_NETWORKS: networks as unknown as string
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

        const myQueue = new queue.Queue(this, 'MyQueue', {
            queueName: 'the-nice-queue'
        });

        // helloFunction.addEventSource(new DynamoEventSource(table, {
        //     startingPosition: lambda.StartingPosition.TRIM_HORIZON,
        //     batchSize: 5,
        //     bisectBatchOnError: true,
        //     retryAttempts: 10,
        // }));
    }
}