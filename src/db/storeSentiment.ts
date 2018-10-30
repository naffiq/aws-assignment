
const { DYNAMODB_SENTIMENT_TABLE } = process.env;

import { DynamoDB } from 'aws-sdk';
import { isNumber } from 'util';

interface ISentiment {
  senderId: string;
  confidence: number;
  value: string;
}

const storeSentiment = async (sentiment: ISentiment, cb) => {
  console.log('[Sentimator] — Store sentiment initiated to table ', DYNAMODB_SENTIMENT_TABLE, sentiment);
  
  try {
    const documentClient = new DynamoDB.DocumentClient();
    const senderData = await documentClient.query({
      TableName: DYNAMODB_SENTIMENT_TABLE,
      KeyConditionExpression: "senderId = :v1", 
      ExpressionAttributeValues: {
        ":v1": sentiment.senderId
      }, 
    }).promise();
    console.log('[Sentimator] — senderData fetched', JSON.stringify(senderData));
    const {Items} = senderData;

    if (Items.length > 0) {
      const newSentimentConfidence = Items[0][sentiment.value] && isNumber(Items[0][sentiment.value])
        ? parseFloat(Items[0][sentiment.value]) + sentiment.confidence 
        : sentiment.confidence;

      await documentClient.update({
        TableName: DYNAMODB_SENTIMENT_TABLE,
        Key: {
          senderId: sentiment.senderId
        },
        ExpressionAttributeNames: {
          "#SV": sentiment.value, 
        }, 
        ExpressionAttributeValues: {
          ":sc": newSentimentConfidence
        }, 
        UpdateExpression: "SET #SV = :sc"
      }).promise();
    } else {
      await documentClient.put({
        TableName: DYNAMODB_SENTIMENT_TABLE,
        Item: {
          senderId: sentiment.senderId,
          negative: 0,
          positive: 0,
          neutral: 0,
          [sentiment.value]: sentiment.confidence
        }
      }).promise();
    }


    console.log('[Sentimator] — Store sentiment executed');
  } catch (err) {
    console.log('[Sentimator] — Store failed', err);
  }

  cb();
}

export default storeSentiment;
