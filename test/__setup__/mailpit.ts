import dotenv from "dotenv";
import { GenericContainer } from "testcontainers";

export async function startMailPitContainer() {
	let config: Record<string, string> = {};
	dotenv.config({ path: ".env.test", processEnv: config });
	console.log(`axllent/mailpit:${config.MAILPIT_IMAGE_TAG}`);
	return await new GenericContainer(
		`axllent/mailpit:${config.MAILPIT_IMAGE_TAG}`,
	)
		.withExposedPorts({
			container: 8025,
			host: Number(config.MAILPIT_WEB_PORT),
		})
		.withExposedPorts({
			container: 1025,
			host: Number(config.MAILPIT_SMTP_PORT),
		})
		.start();
}

export async function mailpitMessages() {
	let config: Record<string, string> = {};
	dotenv.config({ path: ".env.test", processEnv: config });
	const response = await fetch(
		`http://localhost:${config.MAILPIT_WEB_PORT}/api/v1/messages`,
	);
	return await response.json();
}

export async function deleteMailpitMessages() {
	let config: Record<string, string> = {};
	dotenv.config({ path: ".env.test", processEnv: config });
	await fetch(`http://localhost:${config.MAILPIT_WEB_PORT}/api/v1/messages`, {
		method: "DELETE",
	});
}
