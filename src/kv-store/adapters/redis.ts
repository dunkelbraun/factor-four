import { remember } from "@epic-web/remember";
import { snakeCase } from "case-anything";
import dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import { createClient } from "redis";
import type { KeyValueStore } from "~/kv-store/kv-store.js";

/**
 * Redis `KeyValueStore` implementation.
 *
 * Expects an environment variable in the format `REDIS_${snakeCase(name).toUpperCase()}_URL`.
 */
export class RedisStore implements KeyValueStore {
	uuid: string;
	name: string;
	/**
	 * Returns a new `RedisStore`.
	 */
	constructor(name: string) {
		this.name = name;
		this.uuid = randomUUID();
	}

	async has(key: string) {
		const client = await this.#client();
		return (await client.exists(key)) === 1;
	}

	async set(key: string, value: unknown) {
		const client = await this.#client();
		await client.set(key, JSON.stringify(value));
	}

	async get<T = unknown>(key: string) {
		const client = await this.#client();
		const value = await client.get(key);
		if (value === null) {
			return null;
		}
		return JSON.parse(value) as T;
	}

	async remove(key: string) {
		const client = await this.#client();
		await client.del(key);
	}

	/**
	 * Returns the environment variable name that should contain the Redis instance URL.
	 */
	get connectionStringEnvVar() {
		return `REDIS_${snakeCase(this.name).toUpperCase()}_URL`;
	}

	async #client() {
		return await remember(`redis-${this.uuid}`, () =>
			createClient({
				url: this.#fetchConnectionStringFromEnvironment(),
			})
				.on("error", (err) => console.log("Redis Client Error", err))
				.connect(),
		);
	}

	#fetchConnectionStringFromEnvironment() {
		const envVar = this.connectionStringEnvVar;
		let readEnv = {} as Record<string, string>;
		dotenv.config({ processEnv: readEnv });
		return process.env[envVar] ?? readEnv[envVar] ?? "";
	}
}
