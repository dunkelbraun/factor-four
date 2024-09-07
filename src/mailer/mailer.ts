/**
 * Interface for a backing resource that sends emails.
 */
export interface Mailer {
	/**
	 * Sends an email messsage.
	 */
	send(message: Message): Promise<boolean>;
}

export interface Message {
	/**
	 * E-Mail address of the sender fhat will appear on the From: field.
	 * */
	from?: string;
	/**
	 * Comma separated list e-mail addresses that will appear on the To: field.
	 */
	to?: string;
	/**
	 *  Comma separated list of recipients e-mail addresses that will appear on the Cc: field.
	 */
	cc?: string;
	/**
	 * Comma separated list of recipients e-mail addresses that will appear on the Bcc: field.
	 */
	bcc?: string;
	/**
	 * Comma separated list of e-mail addresses that will appear on the Reply-To: field.
	 */
	replyTo?: string;
	/**
	 * Subject of the e-mail.
	 */
	subject?: string;
	/**
	 * Plaintext version of the message as an Unicode string.
	 */
	text?: string;
	/**
	 * HTML version of the message as an Unicode string.
	 */
	html?: string;
	/**
	 * Additional Headers
	 */
	headers?: Headers | undefined;
	/**
	 * Array of `File`s to attach.
	 */
	attachments?: File[] | undefined;
}
