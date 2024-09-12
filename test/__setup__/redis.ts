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
