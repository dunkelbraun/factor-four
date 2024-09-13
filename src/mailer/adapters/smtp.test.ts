import dotenv from "dotenv";
import {
	deleteMailpitMessages,
	mailpitMessages,
} from "test/__setup__/mailpit.js";
import { type StartedTestContainer } from "testcontainers";
import { afterAll, afterEach, assert, beforeAll, test } from "vitest";
import { SMTPMailer } from "~/mailer/adapters/smtp.js";

let container: StartedTestContainer;

beforeAll(async () => {
	let config: Record<string, string> = {};
	dotenv.config({ path: ".env.test", processEnv: config });
	container = await SMTPMailer.testContainer({
		image: { tag: "v1.20" },
		webPort: 8026,
		smtpPort: Number(config.MAILPIT_SMTP_PORT),
	}).start();
});

afterAll(async () => {
	await container.stop();
});

afterEach(async (context) => {
	await deleteMailpitMessages();
});

test("mailerId", async (context) => {
	const nodeMailer = new SMTPMailer("test-mailer", {});
	assert.equal(nodeMailer.id, "test-mailer");
});

test("send emails through smtp server", async (context) => {
	let config: Record<string, string> = {};
	dotenv.config({ path: ".env.test", processEnv: config });
	const port = config.MAILPIT_SMTP_PORT;
	assert(port);

	const nodeMailer = new SMTPMailer("test-mailer", {
		host: "localhost",
		port: Number(port),
		auth: {
			user: "username",
			pass: "password",
		},
	});

	await nodeMailer.send({
		from: "sender@example.com",
		to: "recipient@example.com",
		subject: "Message",
		text: "I hope this message gets there!",
	});

	await nodeMailer.send({
		from: "anothersender@example.com",
		to: "anotherrecipient@example.com",
		subject: "Another Message",
		text: "Another message!",
	});

	const messages = (await mailpitMessages()).messages;
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
