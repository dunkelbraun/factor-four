import { snakeCase } from "case-anything";
import nodemailer from "nodemailer";
import { GenericContainer } from "testcontainers";
import { MailerAdapterBase } from "~/mailer/adapter.js";
import { messageToNodeMailerMessage } from "~/mailer/lib/message-to-nodemailer.js";
import type { TestContainer } from "~/mailer/lib/testcontainer.js";
import type { Message } from "~/mailer/mailer.js";

/**
 * SMTP `Mailer` implementation.
 *
 * Expects an environment variable in the format `NODE_SMTP_MAILER_${snakeCase(mailerId).toUpperCase()}_URL` with
 * the SMTP server connection string.
 */
export class SMTPMailer
	extends MailerAdapterBase
	implements TestContainer<typeof SMTPMailer>
{
	async send(message: Message) {
		const msg = await messageToNodeMailerMessage(message);
		const transport = nodemailer.createTransport(this.#nodeMailerURL);
		await transport.sendMail(msg);
		return true;
	}

	get #nodeMailerURL() {
		const envVar = `NODE_SMTP_MAILER_${snakeCase(this.id).toUpperCase()}_URL`;
		const urlFromEnv = process.env[envVar];
		if (urlFromEnv === undefined) {
			throw new Error(`missing ${envVar}`);
		}
		return urlFromEnv;
	}

	static testContainer(options?: SMTPTestContainerOptions) {
		return new GenericContainer(
			`${options?.image?.name ?? "axllent/mailpit"}:${options?.image?.tag ?? "latest"}`,
		)
			.withExposedPorts({
				container: 1025,
				host: options?.smtpPort ?? 1025,
			})
			.withExposedPorts({
				container: 8025,
				host: options?.webPort ?? 8025,
			});
	}
}

interface SMTPTestContainerOptions {
	/**
	 * Docker image to use.
	 *
	 */
	image?: {
		/**
		 * Image name.
		 *
		 * @default axllent/mailpit
		 */
		name?: string;
		/**
		 * Image tag.
		 *
		 * @default latest
		 */
		tag?: string;
	};
	smtpPort?: number;
	webPort?: number;
}
