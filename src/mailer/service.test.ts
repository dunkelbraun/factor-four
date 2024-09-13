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

	test("custom local adapter", () => {
		const mailer = new Mailer({
			name: "test-mailer",
			adapter: new TestAdapter(),
			localAdapter: new TestAdapter(),
		});

		assert.notStrictEqual(mailer.adapter.uuid, mailer.localAdapter.uuid);
	});

	test("same as adapter when not defined", () => {
		const mailer = new Mailer({
			name: "test-mailer",
			adapter: new TestAdapter(),
		});

		assert.strictEqual(mailer.adapter.uuid, mailer.localAdapter.uuid);
	});

	test("sends emails through the adapter by default", async () => {
		process.env.F4_ENV = undefined;
		const mailer = new Mailer({
			name: "test-mailer",
			adapter: new TestAdapter(),
			localAdapter: new TestAdapter(),
		});

		const message = {
			from: "sender@example.com",
			to: "recipient@example.com",
			subject: "Message",
			text: "I hope this message gets there!",
		};

		await mailer.send(message);

		assert.equal(mailer.adapter.messages.length, 1);
		assert.equal(mailer.localAdapter.messages.length, 0);
	});

	test("sends emails through the local adapter when F4_ENV is local", async () => {
		process.env.F4_ENV = "local";
		const mailer = new Mailer({
			name: "test-mailer",
			adapter: new TestAdapter(),
			localAdapter: new TestAdapter(),
		});

		const message = {
			from: "sender@example.com",
			to: "recipient@example.com",
			subject: "Message",
			text: "I hope this message gets there!",
		};

		await mailer.send(message);

		assert.equal(mailer.localAdapter.messages.length, 1);
		assert.equal(mailer.adapter.messages.length, 0);
	});

	test("adapter and local adapter class", async () => {
		const mailer = new Mailer({
			name: "test-mailer",
			adapter: new TestAdapter(),
			localAdapter: new TestAdapterTwo(),
		});

		expect(mailer.adapter).toBeInstanceOf(TestAdapter);
		expect(mailer.localAdapter).toBeInstanceOf(TestAdapterTwo);
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

class TestAdapterTwo extends TestAdapter {}
