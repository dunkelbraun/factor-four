import { SES } from "@aws-sdk/client-ses";
import getPort, { portNumbers } from "get-port";
import { GenericContainer } from "testcontainers";
import { MailerAdapterBase } from "~/mailer/adapter.js";
import { buildSESLocalContainer } from "~/mailer/adapters/ses/container.js";
import type { TestContainer } from "~/mailer/lib/testcontainer.js";
import type { Message } from "~/mailer/mailer.js";
/**
 * SES `Mailer` implementation.
 *
 * Expects an environment variable to be set AWS_SES_REGION.
 *
 */

export class SESMailer
	extends MailerAdapterBase
	implements
		TestContainer<{
			container: GenericContainer;
			port: number;
		}>
{
	constructor(mailerId: string) {
		super(mailerId);
	}

	async send(message: Message) {
		const ses = new SES({
			...(process.env.F4_ENV === "local"
				? {
						endpoint: "http://localhost:8005",
						region: "aws-ses-v2-local",
						credentials: {
							accessKeyId: "ANY_STRING",
							secretAccessKey: "ANY_STRING",
						},
					}
				: { region: process.env.AWS_SES_REGION }),
		});

		const result = await ses.sendEmail({
			Source: message.from!,
			Destination: {
				ToAddresses: [message.to!],
			},
			ReplyToAddresses: [message.replyTo!],
			Message: {
				Body: {
					Text: {
						Charset: "UTF-8",
						Data: message.text!,
					},
				},
				Subject: {
					Charset: "UTF-8",
					Data: message.subject!,
				},
			},
		});
		if (result.MessageId === undefined) {
			return false;
		}
		return true;
	}

	// import getPort, { portNumbers } from "get-port";

	async localContainer() {
		const container = await buildSESLocalContainer();
		const port = await getPort({ port: portNumbers(8005, 8100) });
		return {
			container: container
				.withEnvironment({
					AWS_SES_ACCOUNT: process.env.AWS_SES_ACCOUNT ?? "",
					SMTP_TRANSPORT: process.env.SMTP_TRANSPORT ?? "",
				})
				.withExposedPorts({
					host: port,
					container: 8005,
				}),
			port,
		};
	}
}
