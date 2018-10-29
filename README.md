# AWS Test Assignment

This project connects to facebook Messenger bot provided in environmental credentials and stores all the input messages in DynamoDB (but never replies). 
Bot provides `process-message` handler with NLP data, that is used later.

After that another lambda function evaluates total sentiment from `senderId` and stores that in different DynamoDB table.