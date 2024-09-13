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
