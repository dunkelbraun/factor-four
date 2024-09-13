import getPort, { portNumbers } from "get-port";
import {
	deleteMailpitMessages,
	mailpitMessages,
} from "test/__setup__/mailpit.js";
import { type StartedTestContainer } from "testcontainers";
import { afterEach, assert, beforeEach, test } from "vitest";
import { SMTPMailer } from "~/mailer/adapters/smtp/smtp.js";

interface SMTPMailerTextContext {
	container?: StartedTestContainer;
	port: number;
	webPort?: number;
}

beforeEach<SMTPMailerTextContext>(async (context) => {
	context.port = await getPort({ port: portNumbers(1025, 1100) });
});

afterEach<SMTPMailerTextContext>(async (context) => {
	if (context.webPort !== undefined) {
		await deleteMailpitMessages(context.webPort);
	}
	if (context.container !== undefined) {
		await context.container.stop();
	}
});

test("mailerId", async (context) => {
	const nodeMailer = new SMTPMailer("test-mailer", {});
	assert.equal(nodeMailer.id, "test-mailer");
});

test<SMTPMailerTextContext>("send emails through smtp server", async (context) => {
	const nodeMailer = new SMTPMailer("test-mailer", {
		host: "localhost",
		port: context.port,
		auth: {
			user: "username",
			pass: "password",
		},
	});

	const { container, hostPorts } = await nodeMailer.container();
	context.webPort = hostPorts.web;
	context.container = await container.start();

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

	const messages = (await mailpitMessages(hostPorts.web)).messages;
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
