import { afterAll, afterEach, assert, beforeAll, test } from "vitest";
import type {
	SMTPContainer,
	SMTPContainerInfo,
} from "~/mailers/smtp/container.js";
import { defineSMTPMailer, SMTPMailer } from "~/mailers/smtp/smtp.js";
import {
	deleteMailpitMessages,
	mailpitMessages,
} from "~/mailers/smtp/testing.js";

let testMailer: SMTPMailer;
let testContainer: SMTPContainer;
let containerInfo: SMTPContainerInfo;

beforeAll(async () => {
	const { mailer, container } = defineSMTPMailer("test-mailer");
	testMailer = mailer;
	testContainer = container;
	containerInfo = await testContainer.start();
});

afterAll(async () => {
	await testContainer.stop();
});

afterEach(async () => {
	await deleteMailpitMessages(containerInfo.hostPorts.web);
});

test("mailerId", async (context) => {
	assert.equal(testMailer.id, "test-mailer");
});

test("send emails through smtp server", async () => {
	await testMailer.transporter.sendMail({
		from: "sender@example.com",
		to: "recipient@example.com",
		subject: "Message",
		text: "I hope this message gets there!",
	});

	await testMailer.transporter.sendMail({
		from: "anothersender@example.com",
		to: "anotherrecipient@example.com",
		subject: "Another Message",
		text: "Another message!",
	});

	const messages = (await mailpitMessages(containerInfo.hostPorts.web))
		.messages;
	assert.equal(messages.length, 2);

	const firstMessage = messages.at(-1);

	assert.deepStrictEqual(firstMessage.From, {
		Name: "",
		Address: "sender@example.com",
	});
	assert.deepStrictEqual(firstMessage.To, [
		{
			Name: "",
			Address: "recipient@example.com",
		},
	]);

	assert.strictEqual(firstMessage.Subject, "Message");
	assert.strictEqual(firstMessage.Snippet, "I hope this message gets there!");

	const secondMessage = messages.at(0);

	assert.deepStrictEqual(secondMessage.From, {
		Name: "",
		Address: "anothersender@example.com",
	});
	assert.deepStrictEqual(secondMessage.To, [
		{
			Name: "",
			Address: "anotherrecipient@example.com",
		},
	]);

	assert.strictEqual(secondMessage.Subject, "Another Message");
	assert.strictEqual(secondMessage.Snippet, "Another message!");
});
