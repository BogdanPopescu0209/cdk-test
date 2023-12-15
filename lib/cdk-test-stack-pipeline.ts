import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { CollecpointIngressStage } from './cdk-test-stage';
import { BuildSpec } from 'aws-cdk-lib/aws-codebuild';

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
        },
        partialBuildSpec: BuildSpec.fromObject({
          phases: {
            install: {
              "runtime-versions": {
                nodejs: "14"
              }
            }
          }
        })
      },
      selfMutation: true,
      synth: new pipelines.ShellStep('Synth', {
        input: githubInput,
        primaryOutputDirectory: './cdk.out',
        commands: [
          'npm install -g npm@8',
          'npm ci --include=dev',
          'npx cdk synth'
        ],
      })
    });

    const sandboxWave = pipeline.addWave('sandbox');
    sandboxWave.addStage(new CollecpointIngressStage(this, 'sandbox-stage', {}))
  }
}


