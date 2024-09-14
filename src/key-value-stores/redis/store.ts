import { snakeCase } from "case-anything";
import dotenv from "dotenv";
import {
	createClient,
	RedisClientType,
	type RedisFunctions,
	type RedisModules,
	type RedisScripts,
} from "redis"; // Adjust based on your Redis library version and imports
import { RedisContainer } from "~/key-value-stores/redis/container.js";

export class RedisStore {
	id: string;

	#client?: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;

	container: RedisContainer;

	constructor(name: string) {
		this.id = name;
		this.container = new RedisContainer(this.credentialsEnvVar);
	}

	/**
	 * Returns the Redis client for the RedisStore
	 */
	get client() {
		if (this.#client === undefined) {
			const envVar = this.credentialsEnvVar;
			let readEnv = {} as Record<string, string>;
			dotenv.config({ processEnv: readEnv });
			this.#client = createClient({
				url: process.env[envVar],
			}).on("error", (err) => console.error("Redis Client Error", err));
		}
		return this.#client;
	}

	/**
	 * Returns the environment variable name that should contain the Memcached instance URL.
	 */
	get credentialsEnvVar() {
		return `REDIS_${snakeCase(this.id).toUpperCase()}_URL`;
	}
}

export function defineRedisStore(id: string) {
	const store = new RedisStore(id);
	return { store, client: store.client, container: store.container };
}
