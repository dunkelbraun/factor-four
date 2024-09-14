import { SESMailer } from "~/mailer/adapters/ses/ses.js";
import { SMTPMailer, type SMTPOptions } from "~/mailer/adapters/smtp/smtp.js";
import type { Mailer as MailerInterface, Message } from "~/mailer/mailer.js";

/**
 * Backing service for sending emails.
 */
export class Mailer<TAdapter extends MailerInterface>
	implements MailerInterface
{
	readonly name: string;
	readonly adapter: TAdapter;

	/**
	 * Returns a `Mailer`.
	 */
	constructor(public options: MailerOptions<TAdapter>) {
		this.name = options.name;
		this.adapter = options.adapter;
	}

	async send(message: Message) {
		await this.adapter.send(message);
		return true;
	}
}

export interface MailerOptions<TAdapter extends MailerInterface> {
	/**
	 * Mailer name.
	 */
	name: string;
	/**
	 * Adapter to use.
	 */
	adapter: TAdapter;
}

export type MailerKind = "smtp" | "ses";

type DefineOptions<K> = {
	kind: K;
	options?: K extends "smtp" ? SMTPOptions : never;
};

type MailerType<K> = K extends "smtp"
	? SMTPMailer
	: K extends "ses"
		? SESMailer
		: never;

export function defineMailer<K extends MailerKind>(
	id: string,
	options: DefineOptions<K>,
): Mailer<MailerType<K>> {
	switch (options.kind) {
		case "smtp":
			return new Mailer({
				name: id,
				adapter: new SMTPMailer(id, options.options ?? {}),
			}) as Mailer<MailerType<K>>;
		case "ses":
			return new Mailer({
				name: id,
				adapter: new SESMailer(id),
			}) as Mailer<MailerType<K>>;
		default:
			throw new Error(`Unsupported mailer kind: ${options.kind}`);
	}
}
