import * as AWS from 'aws-sdk';
import { AwsCustomResource } from 'aws-cdk-lib/custom-resources';
import * as cfn from 'aws-cdk-lib/custom-resources';

export async function getTables(scope: any) {
    //const dynamodb = new AWS.DynamoDB({ region: 'eu-west-1' });

    // const params = {
    //     TableName: 'my_special_table',
    //     Item: {
    //         'id': { S: '1234' },
    //         'address': { S: 'John Doe' }
    //     }
    // };

    // dynamodb.putItem()

    // const thing = await new Promise((resolve, reject) => {
    //     dynamodb.listTables(function (err, data) {
    //         if (err) {
    //             reject(err)
    //         } else {
    //             resolve(data)
    //         }
    //     })
    // })

    // dynamodb.putItem(params, function (err, data) {
    //     if (err) {
    //         console.log('Error', err);
    //     } else {
    //         console.log('Item added successfully', data);
    //     }
    // });

    return '';
}