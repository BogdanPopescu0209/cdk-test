import { Construct } from 'constructs';
import * as stepfunctions from 'aws-cdk-lib/aws-stepfunctions';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as cdk from 'aws-cdk-lib';

export function stepFunctionSandbox(scope: Construct) {

    // const testStateParallel = new stepfunctions.Parallel(scope, 'TestStateParallel', {});

    // const stateOne = new stepfunctions.Pass(scope, 'StateOne', {})
    // const stateTwo = new stepfunctions.Pass(scope, 'StateTwo', {})

    const sandboxLogGroup = new logs.LogGroup(scope, 'Step Functions Log Group', {
        logGroupName: `sandbox-pipeline-test-new-1`,
        retention: logs.RetentionDays.INFINITE,
    });

    const describeOpenStreetMapInstance = new tasks.CallAwsService(scope, 'Describe Start Open Street Map Instance', {
        service: 'ec2',
        action: 'describeInstances',
        parameters: {
            InstanceIds: ['i-0f86d6af863628a6c'],
        },
        iamResources: ['arn:aws:ec2:eu-west-1:452280938609:instance/i-0f86d6af863628a6c'],
        resultPath: '$.describeInstancesResult'
    });

    const waitForInstance = new stepfunctions.Wait(scope, 'Wait 1 Minute', {
        time: stepfunctions.WaitTime.duration(cdk.Duration.minutes(1)),
    })
        .next(describeOpenStreetMapInstance);

    const incrementRetryCount = new stepfunctions.Pass(scope, 'IncrementRetryCount', {
        result: stepfunctions.Result.fromObject({ retryIncrement: 1 }),
        resultPath: '$.retryIncrement',
    });

    const updateRetryCount = new stepfunctions.Pass(scope, 'UpdateRetryCount', {
        parameters: {
            'retryCount.$': 'States.MathAdd($.retryCount, $.retryIncrement.retryIncrement)'
        }
    });

    const startOpenStreetMapInstance = new tasks.CallAwsService(scope, 'Start Open Street Map Instance', {
        service: 'ec2',
        action: 'startInstances',
        parameters: {
            InstanceIds: ['i-0f86d6af863628a6c'],
        },
        iamResources: ['arn:aws:ec2:eu-west-1:452280938609:instance/i-0f86d6af863628a6c'],
        resultPath: '$.StartInstanceResult'
    })
        .addRetry({
            errors: ['States.ALL'],
            backoffRate: 1,
            interval: cdk.Duration.seconds(10),
            maxAttempts: 3
        })
        .addCatch(new stepfunctions.Pass(scope, 'Start Open Street Map Instance Failed'), {
            errors: ['States.ALL'],
            resultPath: '$.StartInstanceResult'
        })
        .next(incrementRetryCount)
        .next(updateRetryCount)
        .next(waitForInstance);

    const doNothing = new stepfunctions.Pass(scope, 'Do nothing');

    const failedState = new stepfunctions.Fail(scope, 'Failed State');

    const isOpenStreetMapInstanceRunning = new stepfunctions.Choice(scope, 'Is Open Street Map Instance Running?')
        .when(stepfunctions.Condition.stringEquals('$.Reservations[0].Instances[0].State.Name', 'running'), doNothing)
        .when(stepfunctions.Condition.numberGreaterThanEquals('$.retryCount', 3), failedState)
        .otherwise(startOpenStreetMapInstance);

    const parserStepFunction = new stepfunctions.StateMachine(
        scope,
        `test-step-function-new-1`,
        {
            definition: stepfunctions.Chain.start(
                describeOpenStreetMapInstance
                    .next(isOpenStreetMapInstanceRunning)
            ),
            stateMachineName: `test-step-function-sandbox-new-1`,
            logs: {
                level: stepfunctions.LogLevel.ALL,
                includeExecutionData: true,
                destination: sandboxLogGroup
            }
        }
    );
}

// const collateReplicateTableNames = new stepfunctions.Pass(scope, 'Collate Replicate Table Names', {
//     parameters: {
//         "replicateTableNames.$": "$[*][*].replicateTableName[*]"
//     }
// })
//     .next(getRegions);