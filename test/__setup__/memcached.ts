import dotenv from "dotenv";
import { GenericContainer } from "testcontainers";

export function memcachedContainer() {
	let config: Record<string, string> = {};
	dotenv.config({ path: ".env.test", processEnv: config });
	return new GenericContainer(
		`memcached:${config.MEMCACHED_IMAGE_TAG}`,
	).withExposedPorts({
		container: 11211,
		host: Number(config.MEMCACHED_PORT),
	});
}
