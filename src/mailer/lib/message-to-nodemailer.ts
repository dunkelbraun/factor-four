import type {
	Attachment,
	Headers as NodeMailerHeaders,
} from "nodemailer/lib/mailer/index.js";
import type { Message } from "~/mailer/mailer.js";

export async function messageToNodeMailerMessage(message: Message) {
	const attachments = [] as Attachment[];
	for (const file of message.attachments ?? ([] as File[])) {
		attachments.push({
			filename: file.name,
			contentType: file.type,
			contentDisposition: "attachment",
			raw: Buffer.from(await file.arrayBuffer()),
		});
	}
	const nodemailerMessage: NodeMailerMessage = {
		...message,
		headers: Object.entries(message.headers ?? new Headers()).reduce(
			(acc, [key, value]) => {
				acc[key] = value;
				return acc;
			},
			{} as Record<string, any>,
		),
		attachments: attachments,
	};
	return nodemailerMessage;
}

export interface NodeMailerMessage
	extends Omit<Message, "headers" | "attachments"> {
	/**
	 * An object or array of additional header fields
	 */
	headers?: NodeMailerHeaders | undefined;
	/**
	 * Array of `File` to attach.
	 */
	attachments?: Attachment[] | undefined;
}
