import { assert, beforeAll, test } from "vitest";
import {
	buildSESLocalContainer,
	sesEmails,
} from "~/mailer/adapters/ses/container.js";
import { SESMailer } from "~/mailer/adapters/ses/ses.js";

beforeAll(async () => {
	await buildSESLocalContainer();
});

test("send emails", async () => {
	process.env.F4_ENV = "local";
	const mailer = new SESMailer("test-ses");

	const { container, port } = await mailer.container();
	await container.start();

	await mailer.send({
		from: "sender@example.com",
		to: "recipient@example.com",
		subject: "Message",
		text: "I hope this message gets there!",
	});

	const emails = await sesEmails(port);
	assert.strictEqual(emails.length, 1);

	const email = emails.at(0);
	assert.strictEqual(email.from, "sender@example.com");
	assert.deepStrictEqual(email.destination, {
		to: ["recipient@example.com"],
		cc: [],
		bcc: [],
	});
	assert.strictEqual(email.subject, "Message");
	assert.deepStrictEqual(email.body, {
		text: "I hope this message gets there!",
	});
});
