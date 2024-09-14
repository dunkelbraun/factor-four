import getPort, { portNumbers } from "get-port";
import { GenericContainer, type StartedTestContainer } from "testcontainers";

export class RedisContainer {
	#envVarName: string;
	#testContainerImage: string = "redis";
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
		const hostPort = await getPort({ port: portNumbers(6379, 6389) });
		const connectionString = `redis://localhost:${hostPort}`;
		const container = new GenericContainer(
			`${this.#testContainerImage}:${this.#testContainerImageTag}`,
		).withExposedPorts({ container: 6379, host: hostPort });
		return { container, hostPort, connectionString };
	}
}
