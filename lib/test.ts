import * as AWS from 'aws-sdk';

export async function getTables() {
    const dynamodb = new AWS.DynamoDB();

    const thing = await new Promise((resolve, reject) => {
        dynamodb.listTables(function (err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(data.TableNames)
            }
        })
    })

    return thing;
}