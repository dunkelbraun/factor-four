import type { Mailer, Message } from "~/mailer/mailer.js";

export interface MailerAdapter {
	new (mailerId: string): Mailer;
}

/**
 * Abstract Mailer adapter.
 *
 * Adapter implementations need to extend `MailerAdapterBase`.
 */
export abstract class MailerAdapterBase implements Mailer {
	/**
	 * ID of the mailer.
	 */
	id: string;

	constructor(id: string) {
		this.id = id;
	}

	abstract send(message: Message): Promise<boolean>;
}
