import dotenv from "dotenv";
import { GenericContainer } from "testcontainers";

export function redisContainer() {
	let config: Record<string, string> = {};
	dotenv.config({ path: ".env.test", processEnv: config });
	return new GenericContainer(
		`redis:${config.REDIS_IMAGE_TAG}`,
	).withExposedPorts({
		container: 6379,
		host: Number(config.REDIS_PORT),
	});
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
