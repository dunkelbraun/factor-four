import { camelCase } from "case-anything";
import { Resend } from "resend";
import { MailerAdapterBase } from "~/mailer/adapter.js";
import type { Message } from "~/mailer/mailer.js";

/**
 * Resend `Mailer` implementation.
 *
 * Will fecth the Resend API Key from the environment.
 *
 * Expects an environment variable in the format `RESEND_API_${snakeCase(mailerId).toUpperCase()}_KEY`.
 */

export class ResendMailer extends MailerAdapterBase {
	#resend: Resend;

	constructor(mailerId: string) {
		super(mailerId),
			(this.#resend = new Resend(
				process.env[`RESEND_API_${camelCase(mailerId).toUpperCase()}_KEY`],
			));
	}

	async send(message: Message) {
		const result = await this.#resend.emails.send({
			from: message.from!,
			replyTo: message.replyTo!,
			to: message.to!,
			subject: message.subject!,
			text: message.text!,
		});
		if (result.error) {
			return false;
		}
		return true;
	}
}
