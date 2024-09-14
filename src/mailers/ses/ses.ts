import { SES } from "@aws-sdk/client-ses";
import { SESContainer } from "~/mailers/ses/container.js";

/**
 * SES `Mailer`.
 *
 * Expects an environment variable to be set AWS_SES_REGION.
 *
 */
export class SESMailer {
	container: SESContainer;
	constructor(public id: string) {
		this.container = new SESContainer();
	}

	#client?: SES;

	get client() {
		if (this.#client === undefined) {
			this.#client = new SES({
				...(process.env.F4_ENV === "local"
					? {
							endpoint: `http://localhost:${process.env["SES_MAILER_PORT"]}`,
							region: "aws-ses-v2-local",
							credentials: {
								accessKeyId: "ANY_STRING",
								secretAccessKey: "ANY_STRING",
							},
						}
					: { region: process.env.AWS_SES_REGION }),
			});
		}
		return this.#client;
	}
}

export function defineSESMailer(id: string) {
	return new SESMailer(id);
}
