import { APIGatewayEvent } from "aws-lambda";

const { VERIFY_TOKEN } = process.env;

export enum WebhookVerificationStatus {
  VERIFIED,
  FORBIDDEN,
  // I couldn't come up with a better name considering time limitation, although I found some time to write this comment.
  NO_NEED_TO_WORRY 
};

interface VerificationResponse {
  status: WebhookVerificationStatus;
  challenge?: string;
}


export default (event: APIGatewayEvent): VerificationResponse => {
  if (!event.queryStringParameters) {
    return {
      status: WebhookVerificationStatus.NO_NEED_TO_WORRY
    };
  }

  const mode = event.queryStringParameters['hub.mode'];
  const token = event.queryStringParameters['hub.verify_token'];
  const challenge = event.queryStringParameters['hub.challenge'];
    
  // Check if webhook needs to be verified
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.info('[Webhook] — Verified successfully');
      // Responds with the challenge token from the request
      return {
        status: WebhookVerificationStatus.VERIFIED,
        challenge: challenge
      };
    } else {
      console.error('[Webhook] — Token mismatch')
      // Responds with '403 Forbidden' if verify tokens do not match
      return {
        status: WebhookVerificationStatus.FORBIDDEN
      };
    }
  }

  return {
    status: WebhookVerificationStatus.NO_NEED_TO_WORRY
  };
}