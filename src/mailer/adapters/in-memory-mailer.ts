import { randomUUID } from "node:crypto";
import { finished } from "node:stream/promises";
import MailComposer from "nodemailer/lib/mail-composer";
import { MailerAdapterBase } from "~/mailer/adapter.js";
import { messageToNodeMailerMessage } from "~/mailer/lib/message-to-nodemailer.js";
import type { Message } from "~/mailer/mailer.js";

/**
 * In-memory `Mailer` implementation.
 *
 * When sending, emails are also printed to `stdout`.
 */
export class InMemoryMailer extends MailerAdapterBase {
	/**
	 * Returns all sent messages.
	 */
	messages: string[] = [];

	private declare __id__: string;

	constructor(mailerId: string) {
		super(mailerId);
		this.__id__ = randomUUID();
	}

	async send(message: Message) {
		const msg = await messageToNodeMailerMessage(message);
		const mail = new MailComposer(msg);
		const stream = mail.compile().createReadStream();
		const messageParts: string[] = [];
		stream.on("data", (data) => {
			messageParts.push(`${data.toString()}`);
		});
		await finished(stream);
		const messageString = messageParts.join("\n");
		this.messages.push(messageString);
		process.stdout.write(messageString);
		return true;
	}
}
