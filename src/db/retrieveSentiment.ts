const { DYNAMODB_SENTIMENT_TABLE } = process.env;
import { DynamoDB } from 'aws-sdk';

export const retrieveSentiment = async (senderId) => {
  const documentClient = new DynamoDB.DocumentClient();

  const queryData = {
    TableName: DYNAMODB_SENTIMENT_TABLE
  }

  const senderData = await documentClient.query({
    ...queryData,
    ...(senderId ? {
      KeyConditionExpression: "senderId = :v1", 
      ExpressionAttributeValues: {
        ":v1": senderId
      }, 
    } : {})
  }).promise();
  console.log('[Sentimapi] — senderData fetched', JSON.stringify(senderData));
  return senderData.Items;
};

