import { snakeCase } from "case-anything";
import nodemailer, { type Transporter } from "nodemailer";
import { SMTPContainer } from "~/mailers/smtp/container.js";

/**
 * SMTP Mailer.
 *
 */
export class SMTPMailer {
	#transporter?: Transporter;
	container: SMTPContainer;

	constructor(public id: string) {
		this.container = new SMTPContainer(this.credentialsEnvVar);
	}

	get transporter() {
		if (this.#transporter === undefined) {
			this.#transporter = nodemailer.createTransport(
				process.env[this.credentialsEnvVar],
			);
		}
		return this.#transporter;
	}

	/**
	 * Returns the environment variable name that should contain the STMP connection URL.
	 */
	get credentialsEnvVar() {
		return `SMTP_MAILER_${snakeCase(this.id).toUpperCase()}_URL`;
	}
}

export function defineSMTPMailer(id: string) {
	const mailer = new SMTPMailer(id);
	return {
		mailer,
		container: mailer.container,
	};
}
