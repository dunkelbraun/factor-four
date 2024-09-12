import { remember } from "@epic-web/remember";
import { snakeCase } from "case-anything";
import dotenv from "dotenv";
import { MemcacheClient } from "memcache-client";
import { randomUUID } from "node:crypto";
import type { KeyValueStore } from "~/kv-store/kv-store.js";
/**
 * Redis `KeyValueStore` implementation.
 *
 * Expects an environment variable in the format `MEMCACHED_${snakeCase(name).toUpperCase()}_URL`.
 */
export class MemcachedStore implements KeyValueStore {
	uuid: string;
	name: string;
	/**
	 * Returns a new `MemcachedStore`.
	 */
	constructor(name: string) {
		this.name = name;
		this.uuid = randomUUID();
	}

	async has(key: string) {
		const response = await this.#client.get<string>(key);
		return response !== undefined;
	}

	async set(key: string, value: unknown) {
		await this.#client.set(key, JSON.stringify(value));
	}

	async get<T = unknown>(key: string) {
		const value = await this.#client.get<string>(key);
		if (value === null) {
			return null;
		}
		return JSON.parse(value.value) as T;
	}

	async remove(key: string) {
		await this.#client.delete(key);
	}

	/**
	 * Returns the environment variable name that should contain the Redis instance URL.
	 */
	get connectionStringEnvVar() {
		return `MEMCACHED_${snakeCase(this.name).toUpperCase()}_URL`;
	}

	get #client() {
		return remember(
			`memcached-${this.uuid}`,
			() =>
				new MemcacheClient({
					server: this.#fetchConnectionStringFromEnvironment(),
				}),
		);
	}

	#fetchConnectionStringFromEnvironment() {
		const envVar = this.connectionStringEnvVar;
		let readEnv = {} as Record<string, string>;
		dotenv.config({ processEnv: readEnv });
		return process.env[envVar] ?? readEnv[envVar] ?? "";
	}
}
