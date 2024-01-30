"use strict";

const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies
const Joi = require("joi");
const logger = require("../utils/logger");
const awsHelper = require("../utils/awsHelper");

const bodySchema = Joi.object({
	destination: Joi
		.string()
		.allow(["firstQueue", "secondQueue", "lambdaFunction"])
		.description("The destination you want to forward the payload to")
		.required(),
	payload: Joi
		.object()
		.default({})
		.description("The message payload to forward to"),
});

async function handler(event) {
	let body;

	try {
		console.log("Action", event.body)
		const { error, value } = Joi.validate(
			event.body,
			bodySchema,
			{ abortEarly: false },
		);
		if (error) throw error;
		body = value;

		const sns = new AWS.SNS({
			endpoint: process.env.NODE_ENV === "production" ? undefined : "http://127.0.0.1:4002",
			config: {
				region: "ap-southeast-1",
			}
		});
		console.log("Action", body)

		await sns.publish({
			Message: JSON.stringify(body),
			TopicArn: awsHelper.SNS.getArn(body.destination),
		}).promise();

		return {};
	} catch (error) {
		logger.debug(error);
		return { statusCode: 400, body: error.message };
	}
}

module.exports.handler = handler;
