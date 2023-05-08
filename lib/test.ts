import * as AWS from 'aws-sdk';

export async function getTables() {
    const dynamodb = new AWS.DynamoDB();

    const params = {
        TableName: 'my_special_table',
        Item: {
            'id': { S: '1234' },
            'address': { S: 'John Doe' }
        }
    };

    dynamodb.putItem()

    const thing = await new Promise((resolve, reject) => {
        dynamodb.listTables(function (err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })

    dynamodb.putItem(params, function (err, data) {
        if (err) {
            console.log('Error', err);
        } else {
            console.log('Item added successfully', data);
        }
    });

    return thing;
}