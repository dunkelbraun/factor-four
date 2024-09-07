import { randomUUID } from "node:crypto";
import { assert, describe, test } from "vitest";
import type { Message } from "~/mailer/mailer.js";
import { Mailer } from "~/mailer/service.js";

describe("Mailer service", { sequential: true, concurrent: false }, () => {
	test("service name", () => {
		const mailer = new Mailer({
			name: "test-mailer",
			adapter: TestAdapter,
		});
		assert.strictEqual(mailer.name, "test-mailer");
	});

	test("custom local adapter", () => {
		const mailer = new Mailer({
			name: "test-mailer",
			adapter: TestAdapter,
			localAdapter: TestAdapter,
		});

		assert.notStrictEqual(
			(mailer.adapter as TestAdapter).uuid,
			(mailer.localAdapter as TestAdapter).uuid,
		);
	});

	test("same as adapter when not defined", () => {
		const mailer = new Mailer({
			name: "test-mailer",
			adapter: TestAdapter,
		});

		assert.strictEqual(
			(mailer.adapter as TestAdapter).uuid,
			(mailer.localAdapter as TestAdapter).uuid,
		);
	});

	test("sends emails through the adapter by default", async () => {
		process.env.F4_ENV = undefined;
		const mailer = new Mailer({
			name: "test-mailer",
			adapter: TestAdapter,
			localAdapter: TestAdapter,
		});

		const message = {
			from: "sender@example.com",
			to: "recipient@example.com",
			subject: "Message",
			text: "I hope this message gets there!",
		};

		await mailer.send(message);

		assert.equal((mailer.adapter as any).messages.length, 1);
		assert.equal((mailer.localAdapter as any).messages.length, 0);
	});

	test("sends emails through the local adapter when F4_ENV is local", async () => {
		process.env.F4_ENV = "local";
		const mailer = new Mailer({
			name: "test-mailer",
			adapter: TestAdapter,
			localAdapter: TestAdapter,
		});

		const message = {
			from: "sender@example.com",
			to: "recipient@example.com",
			subject: "Message",
			text: "I hope this message gets there!",
		};

		await mailer.send(message);

		assert.equal((mailer.localAdapter as any).messages.length, 1);
		assert.equal((mailer.adapter as any).messages.length, 0);
	});
});

class TestAdapter {
	mailerId: string;
	uuid: string;
	messages: Message[] = [];

	constructor(mailerId: string) {
		this.mailerId = mailerId;
		this.uuid = randomUUID();
	}
	send(message: Message) {
		this.messages.push(message);
		return new Promise<boolean>((resolve) => resolve(true));
	}
}
