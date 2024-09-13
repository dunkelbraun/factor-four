import { randomUUID } from "node:crypto";
import { assert, describe, expect, test } from "vitest";
import type { Message } from "~/mailer/mailer.js";
import { Mailer } from "~/mailer/service.js";

describe("Mailer service", { sequential: true, concurrent: false }, () => {
	test("service name", () => {
		const mailer = new Mailer({
			name: "test-mailer",
			adapter: new TestAdapter(),
		});
		assert.strictEqual(mailer.name, "test-mailer");
	});

	test("sends emails through the adapter", async () => {
		const mailer = new Mailer({
			name: "test-mailer",
			adapter: new TestAdapter(),
		});

		const message = {
			from: "sender@example.com",
			to: "recipient@example.com",
			subject: "Message",
			text: "I hope this message gets there!",
		};

		await mailer.send(message);

		assert.equal(mailer.adapter.messages.length, 1);
	});

	test("adapter class", async () => {
		const mailer = new Mailer({
			name: "test-mailer",
			adapter: new TestAdapter(),
		});

		expect(mailer.adapter).toBeInstanceOf(TestAdapter);
	});
});

class TestAdapter {
	uuid: string;
	messages: Message[] = [];

	constructor() {
		this.uuid = randomUUID();
	}
	send(message: Message) {
		this.messages.push(message);
		return new Promise<boolean>((resolve) => resolve(true));
	}
}
