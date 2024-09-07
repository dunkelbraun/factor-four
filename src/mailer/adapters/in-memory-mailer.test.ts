import {
	afterEach,
	assert,
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from "vitest";
import { InMemoryMailer } from "./in-memory-mailer.js";

interface TestMailContext {
	logMessages: string[];
}

describe("in memory mailer adapter", () => {
	beforeEach<TestMailContext>((context) => {
		context.logMessages = [];
		vi.spyOn(process.stdout, "write").mockImplementation((data) => {
			context.logMessages.push(
				typeof data === "string" ? data : Buffer.from(data).toString(),
			);
			return true;
		});
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	test<TestMailContext>("prints emails to stdout", async (context) => {
		const mailer = new InMemoryMailer("test-mailer");
		await mailer.send({
			from: "sender@example.com",
			to: "recipient@example.com",
			subject: "Message",
			text: "I hope this message gets there!",
		});

		const log = context.logMessages.join("\n");
		assert.match(log, /From: sender@example.com/);
		assert.match(log, /To: recipient@example.com/);
		assert.match(log, /Subject: Message/);
		assert.match(log, /I hope this message gets there!/);
	});

	test<TestMailContext>("stores messages in memory", async (context) => {
		const mailer = new InMemoryMailer("test-mailer");
		await mailer.send({
			from: "sender@example.com",
			to: "recipient@example.com",
			subject: "Message",
			text: "I hope this message gets there!",
		});
		await mailer.send({
			from: "sender@example.com",
			to: "recipient@example.com",
			subject: "Another Message",
			text: "Another message!",
		});

		expect(mailer.messages.length).toBe(2);

		const firstMessage = mailer.messages[0];
		assert(firstMessage !== undefined);
		assert.match(firstMessage, /From: sender@example.com/);
		assert.match(firstMessage, /To: recipient@example.com/);
		assert.match(firstMessage, /Subject: Message/);
		assert.match(firstMessage, /I hope this message gets there!/);

		const secondMessage = mailer.messages[1];
		assert(secondMessage !== undefined);
		assert.match(secondMessage, /From: sender@example.com/);
		assert.match(secondMessage, /To: recipient@example\.com/);
		assert.match(secondMessage, /Subject: Another Message/);
		assert.match(secondMessage, /Another message!/);
	});
});
