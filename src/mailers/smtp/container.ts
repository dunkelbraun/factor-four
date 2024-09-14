import getPort, { portNumbers } from "get-port";
import { GenericContainer, type StartedTestContainer } from "testcontainers";

export interface SMTPContainerInfo {
	hostPorts: {
		smtp: number;
		web: number;
	};
	connectionString: string;
}

export class SMTPContainer {
	#envVarName: string;
	#testContainerImage: string = "axllent/mailpit";
	#testContainerImageTag: string = "latest";
	#startedTestContainer?: StartedTestContainer;

	constructor(envVarName: string) {
		this.#envVarName = envVarName;
	}

	async start() {
		const { container, hostPorts, connectionString } = await this.#container();
		const startedContainer = await container.start();

		if (this.#startedTestContainer === undefined) {
			this.#startedTestContainer = startedContainer;
		}
		process.env[this.#envVarName] = connectionString;
		return { hostPorts, connectionString } as SMTPContainerInfo;
	}

	async stop() {
		this.#startedTestContainer !== undefined &&
			(await this.#startedTestContainer.stop());
	}

	async #container() {
		const hostPorts = {
			smtp: await getPort({ port: portNumbers(1025, 1100) }),
			web: await getPort({ port: portNumbers(8025, 8100) }),
		};
		const connectionString = `smtp://username:password@localhost:${hostPorts.smtp}`;
		const container = new GenericContainer(
			`${this.#testContainerImage}:${this.#testContainerImageTag}`,
		)
			.withExposedPorts({ container: 1025, host: hostPorts.smtp })
			.withExposedPorts({ container: 8025, host: hostPorts.web });

		return { container, hostPorts, connectionString };
	}
}
