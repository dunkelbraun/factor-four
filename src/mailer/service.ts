import type { Mailer as MailerInterface, Message } from "~/mailer/mailer.js";

/**
 * Backing service for sending emails.
 */
export class Mailer<
	TAdapter extends MailerInterface,
	TLocalAdapter extends MailerInterface = TAdapter,
> implements MailerInterface
{
	readonly name: string;
	readonly adapter: TAdapter;
	readonly localAdapter: TLocalAdapter;

	/**
	 * Returns a `Mailer`.
	 *
	 * If not supplied, the `localAdapter` will be the same as the adapter.
	 */
	constructor(public options: MailerOptions<TAdapter, TLocalAdapter>) {
		this.name = options.name;
		this.adapter = new options.adapter(this.name);
		this.localAdapter =
			options.localAdapter !== undefined
				? new options.localAdapter(this.name)
				: (this.adapter as unknown as TLocalAdapter);
	}

	async send(message: Message) {
		let adapter: MailerInterface;
		switch (process.env.F4_ENV) {
			case "local":
				adapter = this.localAdapter;
				break;
			default:
				adapter = this.adapter;
		}
		await adapter.send(message);
		return true;
	}
}

export interface MailerOptions<
	TAdapter extends MailerInterface,
	TLocalAdapter extends MailerInterface = TAdapter,
> {
	/**
	 * Mailer name.
	 */
	name: string;
	/**
	 * Adapter to use in production environments.
	 */
	adapter: new (name: string) => TAdapter;
	/**
	 * Adapter to use in local environments.
	 *
	 * @default adapter
	 */
	localAdapter?: new (name: string) => TLocalAdapter;
}
