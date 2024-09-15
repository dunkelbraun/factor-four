import { kebabCase, snakeCase } from "case-anything";
import path from "node:path";
import { Container } from "~/_lib/container.js";
import { StartedServerContainerWithWebUI } from "~/_lib/started-container.js";

const SMTP_IMAGE_NAME = "axllent/mailpit";
const SMTP_IMAGE_TAG = "latest";
const SMTP_SERVER_PORT = 1025;
const SMTP_WEB_PORT = 8025;

export interface SMTPContainerOptions {
	resourceId: string;
	imageTag?: string;
	connectionStringEnvVarName?: string;
}

export class SMTPContainer extends Container {
	#connectionStringEnvVarName?: string;

	constructor(options: SMTPContainerOptions) {
		const name = snakeCase(`smtp_${options.resourceId}`);
		const image = {
			name: SMTP_IMAGE_NAME,
			tag: options.imageTag ?? SMTP_IMAGE_TAG,
		};
		const portsToExpose = [SMTP_SERVER_PORT, SMTP_WEB_PORT];
		const persistenceVolumes = [
			{
				source: path.join("/tmp", kebabCase(`${options.resourceId}-data`)),
				target: "/data",
			},
		];
		super({ name, image, portsToExpose, persistenceVolumes });

		if (options.connectionStringEnvVarName) {
			this.#connectionStringEnvVarName = options.connectionStringEnvVarName;
		}
	}

	override async start(): Promise<StartedSMTPContainer> {
		return new StartedSMTPContainer(await super.start(), (container) =>
			this.#addConnectionStringToEnvironment(container),
		);
	}

	async startPersisted(): Promise<StartedSMTPContainer> {
		this.#addDatabaseEnvVar();
		return new StartedSMTPContainer(
			await super.startWithVolumes(),
			(container) => this.#addConnectionStringToEnvironment(container),
		);
	}

	#addDatabaseEnvVar() {
		this.withEnvironment({
			MP_DATABASE: "/data/database.db",
		});
	}

	#addConnectionStringToEnvironment(container: StartedSMTPContainer) {
		if (this.#connectionStringEnvVarName) {
			process.env[this.#connectionStringEnvVarName] = container.connectionURL;
		}
	}
}

export class StartedSMTPContainer extends StartedServerContainerWithWebUI<StartedSMTPContainer> {
	get serverPort() {
		return this.getMappedPort(SMTP_SERVER_PORT);
	}

	get webUIPort() {
		return this.getMappedPort(SMTP_WEB_PORT);
	}

	get connectionURL() {
		const url = new URL("", "smtp://");
		url.hostname = this.getHost();
		url.port = this.serverPort.toString();
		url.username = "username";
		url.password = "password";
		return url.toString();
	}

	get webURL() {
		const url = new URL("", "http://base.com");
		url.hostname = this.getHost();
		url.port = this.webUIPort.toString();
		return url.toString();
	}

	get messagesApiURL() {
		const url = new URL(this.webURL);
		url.pathname = "api/v1/messages";
		return url.toString();
	}
}
