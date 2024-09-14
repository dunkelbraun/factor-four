import path from "node:path";
import { fileURLToPath } from "node:url";
import { GenericContainer } from "testcontainers";

import getPort, { portNumbers } from "get-port";
import { type StartedTestContainer } from "testcontainers";

export interface SESContainerInfo {
	hostPort: number;
}

export class SESContainer {
	#startedTestContainer?: StartedTestContainer;

	async start() {
		const { container, hostPort } = await this.#container();
		const startedContainer = await container.start();

		if (this.#startedTestContainer === undefined) {
			this.#startedTestContainer = startedContainer;
		}
		process.env.SES_MAILER_PORT = String(hostPort);
		return { hostPort } as SESContainerInfo;
	}

	async stop() {
		this.#startedTestContainer !== undefined &&
			(await this.#startedTestContainer.stop());
	}

	async #container() {
		const container = await buildSESLocalContainer();
		const port = await getPort({ port: portNumbers(8005, 8100) });
		return {
			container: container
				.withEnvironment({
					AWS_SES_ACCOUNT: process.env.AWS_SES_ACCOUNT ?? "",
					SMTP_TRANSPORT: process.env.SMTP_TRANSPORT ?? "",
				})
				.withExposedPorts({
					host: port,
					container: 8005,
				}),
			hostPort: port,
		};
	}
}

async function buildSESLocalContainer() {
	return await GenericContainer.fromDockerfile(
		path.dirname(fileURLToPath(import.meta.url)),
	).build("aws-ses-local:latest", { deleteOnExit: false });
}
