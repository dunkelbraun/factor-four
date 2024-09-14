import getPort, { portNumbers } from "get-port";
import { GenericContainer, type StartedTestContainer } from "testcontainers";

export class MemcachedContainer {
	#envVarName: string;
	#testContainerImage: string = "memcached";
	#testContainerImageTag: string = "alpine";
	#startedTestContainer?: StartedTestContainer;

	constructor(envVarName: string) {
		this.#envVarName = envVarName;
	}

	async start() {
		const { container, hostPort, connectionString } = await this.#container();
		const startedContainer = await container.start();

		if (this.#startedTestContainer === undefined) {
			this.#startedTestContainer = startedContainer;
		}
		process.env[this.#envVarName] = connectionString;
		return { hostPort, connectionString };
	}

	async stop() {
		this.#startedTestContainer !== undefined &&
			(await this.#startedTestContainer.stop());
	}

	async #container() {
		const hostPort = await getPort({ port: portNumbers(11211, 11230) });
		const connectionString = `localhost:${hostPort}`;
		const container = new GenericContainer(
			`${this.#testContainerImage}:${this.#testContainerImageTag}`,
		).withExposedPorts({ container: 11211, host: hostPort });
		return { container, hostPort, connectionString };
	}
}
