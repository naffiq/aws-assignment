
import { Handler, APIGatewayEvent, Context, Callback, DynamoDBStreamEvent } from 'aws-lambda';
import {v4 as uuid} from 'uuid';
import * as bot from './src/bot';
import storeMessage from './src/db/storeMessage';
import storeSentiment from './src/db/storeSentiment';
import { retrieveSentiment } from './src/db/retrieveSentiment';

export const processMessage: Handler = async (event: APIGatewayEvent, context: Context, cb: Callback) => {
  const successCB = () => {
    console.log('[Bot] — Execution complete');

    cb(null, {
      statusCode: 200,
      body: JSON.stringify({
        message: "Response sent",
        input: event
      })
    });
  };

  const body = JSON.parse(event.body);

  const { messaging } = body.entry[0];
  const { sender, message } = messaging[0];

  if (message) { 
    const item = {
      id: uuid(),
      senderId: sender.id,
      text: message.text,
      nlp: message.nlp
    };

    await storeMessage(item, successCB);
  } else {
    // Don't care about other response types
    console.log('[Bot] — Got different type of message, skip');
    successCB();
  }
}

export const webhookVerify: Handler = async (event: APIGatewayEvent, context: Context, cb: Callback) => {
  const verifyResponse = bot.verify(event);

  switch (verifyResponse.status) {
    case bot.WebhookVerificationStatus.VERIFIED:
      cb(null, {
        statusCode: 200,
        body: verifyResponse.challenge
      });
      
    case bot.WebhookVerificationStatus.FORBIDDEN:
    case bot.WebhookVerificationStatus.NO_NEED_TO_WORRY:
      cb(null, {
        statusCode: 403
      });
  }
}

export const evaluateSentiment: Handler = async (event: DynamoDBStreamEvent, context: Context, cb: Callback) => {
  console.log(JSON.stringify(event));
  if (event.Records) {
    const { NewImage } = event.Records[0].dynamodb;

    const senderId = NewImage.senderId.S;
    const nlp = NewImage.nlp.M.entities.M;

    if (nlp.sentiment) {
      const sentiment = nlp.sentiment.L[0].M;
      const confidence = parseFloat(sentiment.confidence.N);
      const value = sentiment.value.S;

      await storeSentiment({
        senderId,
        confidence,
        value
      }, cb)
    }
  }
}

export const getSentiment: Handler = async (event: APIGatewayEvent, context: Context, cb: Callback) => {
  const senderId = event.queryStringParameters ? event.queryStringParameters['senderId'] : null;

  cb(null, await retrieveSentiment(senderId))
}