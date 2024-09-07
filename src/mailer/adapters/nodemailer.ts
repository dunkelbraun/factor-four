import { snakeCase } from "case-anything";
import nodemailer from "nodemailer";
import { MailerAdapterBase } from "~/mailer/adapter.js";
import { messageToNodeMailerMessage } from "~/mailer/lib/message-to-nodemailer.js";
import type { Message } from "~/mailer/mailer.js";

/**
 * Nodemailer `Mailer` implementation.
 *
 * Expects an environment variable in the format `NODE_MAILER_${snakeCase(mailerId).toUpperCase()}_URL` with
 * the SMTP server connection string.
 */
export class NodeMailer extends MailerAdapterBase {
	constructor(mailerId: string) {
		super(mailerId);
	}

	async send(message: Message) {
		const msg = await messageToNodeMailerMessage(message);
		const transport = nodemailer.createTransport(this.#nodeMailerURL);
		await transport.sendMail(msg);
		return true;
	}

	get #nodeMailerURL() {
		const envVar = `NODE_MAILER_${snakeCase(this.mailerId).toUpperCase()}_URL`;
		const urlFromEnv = process.env[envVar];
		if (urlFromEnv === undefined) {
			throw new Error(`missing ${envVar}`);
		}
		return urlFromEnv;
	}
}
