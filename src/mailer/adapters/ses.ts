import { SES } from "@aws-sdk/client-ses";
import { MailerAdapterBase } from "~/mailer/adapter.js";
import type { Message } from "~/mailer/mailer.js";

/**
 * SES `Mailer` implementation.
 *
 * Expects an environment variable to be set AWS_SES_REGION.
 *
 */

export class SESMailer extends MailerAdapterBase {
	constructor(mailerId: string) {
		super(mailerId);
	}

	async send(message: Message) {
		const ses = new SES({ region: process.env.AWS_SES_REGION });

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
}
