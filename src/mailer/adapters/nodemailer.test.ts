import dotenv from "dotenv";
import {
	deleteMailpitMessages,
	mailpitMessages,
} from "test/__setup__/mailpit.js";
import { type StartedTestContainer } from "testcontainers";
import {
	afterAll,
	afterEach,
	assert,
	beforeAll,
	beforeEach,
	expect,
	test,
} from "vitest";
import { NodeMailer } from "~/mailer/adapters/nodemailer.js";

let container: StartedTestContainer;

beforeAll(async () => {
	container = await NodeMailer.testContainer({
		image: { tag: "v1.20" },
		webPort: 8026,
		smtpPort: 1026,
	}).start();
});

afterAll(async () => {
	await container.stop();
});

beforeEach(() => {
	let config: Record<string, string> = {};
	dotenv.config({ path: ".env.test", processEnv: config });
	process.env.NODE_MAILER_TEST_MAILER_URL = `smtp://username:password@127.0.0.1:${config.MAILPIT_SMTP_PORT}`;
});

afterEach(async (context) => {
	await deleteMailpitMessages();
});

test("mailerId", async (context) => {
	const nodeMailer = new NodeMailer("test-mailer");
	assert.equal(nodeMailer.mailerId, "test-mailer");
});

test("send emails through smtp server", async (context) => {
	const nodeMailer = new NodeMailer("test-mailer");

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

test("raises an error on undefined connection string URL", async (context) => {
	const nodeMailer = new NodeMailer("test-mailer");
	delete process.env.NODE_MAILER_TEST_MAILER_URL;
	expect(
		async () =>
			await nodeMailer.send({
				from: "sender@example.com",
				to: "recipient@example.com",
				subject: "Message",
				text: "I hope this message gets there!",
			}),
	).rejects.toThrowError("missing NODE_MAILER_TEST_MAILER_URL");
});
