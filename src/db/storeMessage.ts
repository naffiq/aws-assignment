
const { DYNAMODB_MESSAGES_TABLE } = process.env;

import { DynamoDB } from 'aws-sdk';

interface IMessage {
  id: string;
  senderId: string;
  text: string;
  nlp: object;
}

const storeMessage = async (message: IMessage, cb) => {
  console.log('[Bot] — Store message initiated to table ', DYNAMODB_MESSAGES_TABLE, message);
  
  const documentClient = new DynamoDB.DocumentClient();

  try {
    await documentClient.put({
      TableName: DYNAMODB_MESSAGES_TABLE,
      Item: message
    }).promise();

    console.log('[Bot] — Store message executed, waiting for result');
  } catch (err) {
    console.log('[Bot] — Store failed', err)
  }

  cb();
}

export default storeMessage;
