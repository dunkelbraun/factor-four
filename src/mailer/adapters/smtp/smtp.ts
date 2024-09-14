import getPort, { portNumbers } from "get-port";
import nodemailer from "nodemailer";
import { GenericContainer } from "testcontainers";
import { MailerAdapterBase } from "~/mailer/adapter.js";
import { messageToNodeMailerMessage } from "~/mailer/lib/message-to-nodemailer.js";
import type { TestContainer } from "~/mailer/lib/testcontainer.js";
import type { Message } from "~/mailer/mailer.js";

/**
 * SMTP `Mailer` adapter.
 *
 */
export class SMTPMailer
	extends MailerAdapterBase
	implements
		TestContainer<{
			container: GenericContainer;
			hostPorts: { smtp: number; web: number };
		}>
{
	#options: SMTPOptions = {};
	#testContainerImage: string = "axllent/mailpit";
	#testContainerImageTag: string = "latest";

	constructor(id: string, options: SMTPOptions) {
		super(id);
		if (options !== undefined) {
			this.#options = options;
		}
	}

	async send(message: Message) {
		const msg = await messageToNodeMailerMessage(message);
		const transport = nodemailer.createTransport(this.#options);
		await transport.sendMail(msg);
		return true;
	}

	async container() {
		const hostPorts = {
			smtp: this.#options.port
				? this.#options.port
				: await getPort({ port: portNumbers(1025, 1100) }),
			web: await getPort({ port: portNumbers(8025, 8100) }),
		};
		const container = new GenericContainer(
			`${this.#testContainerImage}:${this.#testContainerImageTag}`,
		)
			.withExposedPorts({ container: 1025, host: hostPorts.smtp })
			.withExposedPorts({ container: 8025, host: hostPorts.web });
		return { container, hostPorts };
	}
}

// Based on NodeMailer SMTPOptions.
export interface SMTPOptions {
	/** the hostname or IP address to connect to (defaults to ‘localhost’) */
	host?: string | undefined;
	/** the port to connect to (defaults to 25 or 465) */
	port?: number | undefined;
	/** defines authentication data */
	auth?: {
		/** the username */
		user: string;
		/** then password */
		pass: string;
	};
	/** defines if the connection should use SSL (if true) or not (if false) */
	secure?: boolean | undefined;
	/** turns off STARTTLS support if true */
	ignoreTLS?: boolean | undefined;
	/** forces the client to use STARTTLS. Returns an error if upgrading the connection is not possible or fails. */
	requireTLS?: boolean | undefined;
	/** tries to use STARTTLS and continues normally if it fails */
	opportunisticTLS?: boolean | undefined;
	/** optional hostname of the client, used for identifying to the server */
	name?: string | undefined;
	/** the local interface to bind to for network connections */
	localAddress?: string | undefined;
	/** how many milliseconds to wait for the connection to establish */
	connectionTimeout?: number | undefined;
	/** how many milliseconds to wait for the greeting after connection is established */
	greetingTimeout?: number | undefined;
	/** how many milliseconds of inactivity to allow */
	socketTimeout?: number | undefined;
	/** how many milliseconds to wait for the DNS requests to be resolved */
	dnsTimeout?: number | undefined;
	/** if set to true, then logs SMTP traffic without message content */
	transactionLog?: boolean | undefined;
	/** if set to true, then logs SMTP traffic and message content, otherwise logs only transaction events */
	debug?: boolean | undefined;
}
