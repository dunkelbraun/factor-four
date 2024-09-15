import { snakeCase } from "case-anything";
import { Container } from "~/_lib/container.js";
import { StartedServerContainer } from "~/_lib/started-container.js";

const MEMCACHED_IMAGE_NAME = "memcached";
const MEMCACHED_IMAGE_TAG = "alpine";
const MEMCACHED_SERVER_PORT = 11211;

export interface MemcachedContainerOptions {
	resourceId: string;
	imageTag?: string;
	connectionStringEnvVarName?: string;
}

export class MemcachedContainer extends Container {
	#connectionStringEnvVarName?: string;

	constructor(options: MemcachedContainerOptions) {
		const name = snakeCase(`smtp_${options.resourceId}`);
		const image = {
			name: MEMCACHED_IMAGE_NAME,
			tag: options.imageTag ?? MEMCACHED_IMAGE_TAG,
		};
		const portsToExpose = [MEMCACHED_SERVER_PORT];
		super({ name, image, portsToExpose, persistenceVolumes: [] });

		if (options.connectionStringEnvVarName) {
			this.#connectionStringEnvVarName = options.connectionStringEnvVarName;
		}
	}

	override async start(): Promise<StartedMemcachedContainer> {
		return new StartedMemcachedContainer(await super.start(), (container) =>
			this.#addConnectionStringToEnvironment(container),
		);
	}

	async startPersisted(): Promise<StartedMemcachedContainer> {
		return new StartedMemcachedContainer(
			await super.startWithVolumes(),
			(container) => this.#addConnectionStringToEnvironment(container),
		);
	}

	#addConnectionStringToEnvironment(container: StartedMemcachedContainer) {
		if (this.#connectionStringEnvVarName) {
			process.env[this.#connectionStringEnvVarName] = container.connectionURL;
		}
	}
}

export class StartedMemcachedContainer extends StartedServerContainer<StartedMemcachedContainer> {
	get serverPort() {
		return this.getMappedPort(MEMCACHED_SERVER_PORT);
	}

	get connectionURL() {
		return `${this.getHost()}:${this.serverPort}`;
	}
}
