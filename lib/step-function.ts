import { Construct } from 'constructs';
import * as stepfunctions from 'aws-cdk-lib/aws-stepfunctions';
import * as logs from 'aws-cdk-lib/aws-logs';

export function stepFunctionSandbox(scope: Construct) {

    const testStateParallel = new stepfunctions.Parallel(scope, 'TestStateParallel', {});

    const stateOne = new stepfunctions.Pass(scope, 'StateOne', {})
    const stateTwo = new stepfunctions.Pass(scope, 'StateTwo', {})

    const sandboxLogGroup = new logs.LogGroup(scope, 'Step Functions Log Group', {
        logGroupName: `sandbox-pipeline-test`,
        retention: logs.RetentionDays.INFINITE,
    });

    const parserStepFunction = new stepfunctions.StateMachine(
        scope,
        `test-step-function`,
        {
            definition: stepfunctions.Chain.start(
                testStateParallel
                    .branch(stateOne)
                    .branch(stateTwo)
            ),
            stateMachineName: `test-step-function-sandbox`,
            logs: {
                level: stepfunctions.LogLevel.ALL,
                includeExecutionData: true,
                destination: sandboxLogGroup
            }
        }
    );
}