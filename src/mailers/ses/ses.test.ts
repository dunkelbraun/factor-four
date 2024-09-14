import { afterAll, assert, beforeAll, test } from "vitest";
import type { SESContainerInfo } from "~/mailers/ses/container.js";
import { defineSESMailer, type SESMailer } from "~/mailers/ses/ses.js";
import { sesEmails } from "~/mailers/ses/testing.js";

let sesMailer: SESMailer;
let sesContainerInfo: SESContainerInfo;

beforeAll(async () => {
	process.env.F4_ENV = "local";
	const ses = defineSESMailer("test-ses");
	sesMailer = ses;
	sesContainerInfo = await ses.container.start();
});

afterAll(async () => {
	await sesMailer.container.stop();
});

test("send emails", async () => {
	await sesMailer.client.sendEmail({
		Source: "sender@example.com",
		Destination: {
			ToAddresses: ["recipient@example.com"],
		},
		ReplyToAddresses: [],
		Message: {
			Body: {
				Text: {
					Charset: "UTF-8",
					Data: "I hope this message gets there!",
				},
			},
			Subject: {
				Charset: "UTF-8",
				Data: "Message",
			},
		},
	});

	const emails = await sesEmails(sesContainerInfo.hostPort);
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
