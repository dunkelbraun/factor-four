import { kebabCase, snakeCase } from "case-anything";
import path from "node:path";
import { Container } from "~/_lib/container.js";
import { StartedServerContainer } from "~/_lib/started-container.js";

const POSTGRESQL_ = "postgres";
const POSTGRESQL_IMAGE_TAG = "16.4-alpine";
const POSTGRESQL_SERVER_PORT = 5432;

export interface PostgreSQLContainerOptions {
	resourceId: string;
	imageTag?: string;
	connectionStringEnvVarNames?: string[];
}

export class PostgreSQLContainer extends Container {
	#connectionStringEnvVarNames?: string[];

	constructor(options: PostgreSQLContainerOptions) {
		const name = snakeCase(`postgresql_${options.resourceId}`);
		const image = {
			name: POSTGRESQL_,
			tag: options.imageTag ?? POSTGRESQL_IMAGE_TAG,
		};
		const portsToExpose = [POSTGRESQL_SERVER_PORT];
		const persistenceVolumes = [
			{
				source: path.join("/tmp", kebabCase(`${options.resourceId}-data`)),
				target: "/var/lib/postgresql/data",
			},
		];
		super({ name, image, portsToExpose, persistenceVolumes });

		if (options.connectionStringEnvVarNames) {
			this.#connectionStringEnvVarNames = options.connectionStringEnvVarNames;
		}
		this.withEnvironment({
			POSTGRES_PASSWORD: "postgres",
			POSTGRES_DB: "postgres",
		});
	}

	override async start(): Promise<StartedPostgreSQLContainer> {
		return new StartedPostgreSQLContainer(await super.start(), (container) =>
			this.#addConnectionStringToEnvironment(container),
		);
	}

	async startPersisted(): Promise<StartedPostgreSQLContainer> {
		this.#addDatabaseEnvVar();
		return new StartedPostgreSQLContainer(
			await super.startWithVolumes(),
			(container) => this.#addConnectionStringToEnvironment(container),
		);
	}

	#addDatabaseEnvVar() {
		this.withEnvironment({
			MP_DATABASE: "/data/database.db",
		});
	}

	#addConnectionStringToEnvironment(container: StartedPostgreSQLContainer) {
		for (const envVarName of this.#connectionStringEnvVarNames ?? []) {
			process.env[envVarName] = container.connectionURL;
		}
	}
}

export class StartedPostgreSQLContainer extends StartedServerContainer<StartedPostgreSQLContainer> {
	get serverPort() {
		return this.getMappedPort(POSTGRESQL_SERVER_PORT);
	}

	get connectionURL() {
		const url = new URL("", "postgres://");
		url.hostname = this.getHost();
		url.port = this.serverPort.toString();
		url.username = "postgres";
		url.password = "postgres";
		return url.toString();
	}
}
