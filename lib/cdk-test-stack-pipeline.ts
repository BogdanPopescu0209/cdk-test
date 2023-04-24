import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { CollecpointIngressStage } from './cdk-test-stage';

export class CdkTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const githubInput = pipelines.CodePipelineSource.connection('BogdanPopescu0209/cdk-test', 'main', {
      connectionArn: 'arn:aws:codestar-connections:eu-west-1:452280938609:connection/bebcb069-0d3c-48d9-8fc4-750e94c5be20'
    });

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      pipelineName: 'CDK-test-pipeline',
      codeBuildDefaults: {
        buildEnvironment: {
          privileged: true
        }
      },
      synthCodeBuildDefaults: {
        buildEnvironment: {
          privileged: true
        }
      },
      selfMutation: true,
      synth: new pipelines.ShellStep('Synth', {
        input: githubInput,
        primaryOutputDirectory: './projects/cdk/cdk.out',
        commands: []
      })
    });

    const sandboxWave = pipeline.addWave('sandbox');
    sandboxWave.addStage(new CollecpointIngressStage(this, 'sandbox-stage', {}))
  }
}


