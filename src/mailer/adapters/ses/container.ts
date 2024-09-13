import path from "node:path";
import { fileURLToPath } from "node:url";
import { GenericContainer } from "testcontainers";

export async function buildSESLocalContainer() {
	return await GenericContainer.fromDockerfile(
		path.dirname(fileURLToPath(import.meta.url)),
	).build("aws-ses-local:latest", { deleteOnExit: false });
}


export async function sesEmails(port: number) {
	const response = await fetch(`http://localhost:${port}/store`);
	return (await response.json()).emails;
}
