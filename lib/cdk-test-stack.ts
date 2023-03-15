import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as codepipelineActions from "aws-cdk-lib/aws-codepipeline-actions";
import * as events from 'aws-cdk-lib/aws-events';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { CfnOutput } from 'aws-cdk-lib';
import * as path from 'path';
import * as fs from 'fs';
import * as pipelines from 'aws-cdk-lib/pipelines';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { BuildEnvironmentVariableType } from 'aws-cdk-lib/aws-codebuild';

export class CdkTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: 'your-pipeline-name'
    });

    const sourceStage = pipeline.addStage({ stageName: 'Source' });

    const sourceOutput = new codepipeline.Artifact();

    const sourceAction = new codepipeline_actions.GitHubSourceAction({
      actionName: 'GitHub_Source',
      owner: 'BogdanPopescu0209',
      repo: 'cdk-test',
      branch: 'main',
      oauthToken: cdk.SecretValue.secretsManager('github-token'),
      output: sourceOutput,
      trigger: codepipeline_actions.GitHubTrigger.WEBHOOK
    });

    const existingBucket = s3.Bucket.fromBucketArn(this, 'bucket', 'arn:aws:s3:::my-bucket-sandbox');
    const arnObjects = existingBucket.arnForObjects('*');

    new s3deploy.BucketDeployment(this, 'DeployFiles', {
      sources: [s3deploy.Source.asset('./icons')],
      destinationBucket: existingBucket,
    });
  
    // const sourceAction =
    //   new codepipelineActions.CodeStarConnectionsSourceAction({
    //     actionName: "github",
    //     output: sourceOutput,
    //     connectionArn:
    //       "arn:aws:codestar-connections:eu-west-1:452280938609:connection/bebcb069-0d3c-48d9-8fc4-750e94c5be20",
    //     owner: "BogdanPopescu0209",
    //     repo: "cdk-test",
    //     branch: "main",
    //     triggerOnPush: false,
    //   });

    // const githubInput = pipelines.CodePipelineSource.connection('BogdanPopescu0209', 'main', {
    //   connectionArn: 'arn:aws:codestar-connections:eu-west-1:452280938609:connection/bebcb069-0d3c-48d9-8fc4-750e94c5be20', 
    // })

    sourceStage.addAction(sourceAction);

    const buildStage = pipeline.addStage({ stageName: 'Build' });

    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'CodeBuild',
      project: new codebuild.Project(this, 'CodeBuildProject', {
        environmentVariables: {
          MY_BUCKET: {
            value: existingBucket.bucketName,
            type: BuildEnvironmentVariableType.PLAINTEXT
          },
          ARN_OBJECTS: {
            value: arnObjects,
            type: BuildEnvironmentVariableType.PLAINTEXT
          }
        },
        projectName: 'your-codebuild-project-name',
        environment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_4_0,
        },
        buildSpec: codebuild.BuildSpec.fromObject({
          version: '0.2',
          phases: {
            install: {
              commands: [
                'echo install',
                'echo test install',
                'echo $MY_BUCKET',
                'echo $ARN_OBJECTS'
              ],
            },
            build: {
              commands: [
                'echo build',
                'echo test build'
              ],
            },
          }
        }),
      }),
      input: sourceOutput
    });
    buildStage.addAction(buildAction);

    //const secretToken = 'test-secret-token'
/////
    // const wh = new codepipeline.CfnWebhook(this, "gh-webhook", {
    //   authentication: "GITHUB_HMAC",
    //   authenticationConfiguration: {
    //     secretToken
    //   },
    //   filters: [
    //     // {
    //     //   jsonPath: "$.repository.full_name",
    //     //   matchEquals: "BogdanPopescu0209/uuuuuuuuuuuu",
    //     // },
    //     {
    //       jsonPath: "$.ref",
    //       matchEquals: "refs/heads/main",
    //     }
    //   ],
    //   targetAction: sourceAction.actionProperties.actionName,
    //   targetPipeline: pipeline.pipelineName,
    //   targetPipelineVersion: 1,
    //   registerWithThirdParty: false,
    // });

    // pipeline.onStateChange('OnStateChange', {
    //   target: new targets.CodePipeline(pipeline),
    //   eventPattern: {
    //     source: [sourceAction.variables.connectionArn],
    //     detailType: ['GitHub Repository State Change'],
    //     detail: {
    //       referenceType: ['branch'],
    //       referenceName: ['main'],
    //       event: ['referenceUpdated'],
    //     }
    //   }
    // })

    // const rule = new events.Rule(this, 'GitHubEventRule', {
    //   description: 'Rule that triggers the CodePipeline when a commit is pushed to the main branch on GitHub',
    //   eventPattern: {
    //     source: ['aws.codecommit'],
    //     detailType: ['CodeCommit Repository State Change'],
    //     detail: {
    //       referenceType: ['branch'],
    //       referenceName: ['main'],
    //       event: ['referenceUpdated'],
    //     },
    //   },
    // });

    // rule.addTarget(new targets.CodePipeline(pipeline));
    //test
    // pipeline.onStateChange('OnStateChange', {
    //   target: new targets.CodePipeline(pipeline),
    //   eventPattern: {
    //     source: [sourceAction.variables.connectionArn],
    //     detailType: ['GitHub Repository State Change'],
    //     detail: {
    //       referenceType: ['branch'],
    //       referenceName: ['main'],
    //       event: ['referenceUpdated'],
    //     }
    //   }
    // })

    // const secretToken = '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';

    // new CfnOutput(this, "Github-Webhook-URL", {
    //   value: wh.attrUrl,
    // });

    // new CfnOutput(this, "Github-Webhook-Secret", {
    //   value: secretToken,
    // });
  }
}


