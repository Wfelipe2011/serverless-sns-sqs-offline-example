"use strict";

const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies
const awsHelper = require("../utils/awsHelper");
const logger = require("../utils/logger");

async function handler(event) {
	console.log("lambdaEnqueuer", JSON.stringify(event, null, 4));

	const sqs = new AWS.SQS({
		endpoint: process.env.NODE_ENV === "production" ? undefined : "http://127.0.0.1:4002",
			region: "ap-southeast-1",
	});

	try {
		const body = JSON.parse(event.Records[0].Sns.Message);

		await sqs.sendMessage({
			MessageBody: JSON.stringify(body.payload),
			QueueUrl: awsHelper.SQS.getUrl(body.destination),
		}).promise();
	} catch (error) {
		logger.error("lambdaEnqueuer " + error);
	}
}

module.exports.handler = handler;
