import { assert, test } from "vitest";
import { MailerAdapterBase } from "~/mailer/adapter.js";
import type { Message } from "~/mailer/mailer.js";

test("mailer adapter", () => {
	const mailer = new TestAdapter("test-mailer");
	assert.strictEqual(mailer.mailerId, "test-mailer");
});

class TestAdapter extends MailerAdapterBase {
	constructor(mailerId: string) {
		super(mailerId);
	}

	send(message: Message) {
		return new Promise<boolean>((resolve) => resolve(true));
	}
}
