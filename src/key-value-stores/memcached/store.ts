import { snakeCase } from "case-anything";
import dotenv from "dotenv";
import { MemcacheClient, type MemcacheClientOptions } from "memcache-client";
import { MemcachedContainer } from "~/key-value-stores/memcached/container.js";

export class MemcachedStore {
	id: string;

	#client?: MemcacheClient;

	container: MemcachedContainer;

	constructor(name: string, clientOptions?: MemcacheClientOptions) {
		this.id = name;
		this.container = new MemcachedContainer(this.credentialsEnvVar);
	}

	/**
	 * Returns the MemcacheClient for the MemcacheStore
	 */
	get client() {
		if (this.#client === undefined) {
			const envVar = this.credentialsEnvVar;
			let readEnv = {} as Record<string, string>;
			dotenv.config({ processEnv: readEnv });
			this.#client = new MemcacheClient({
				server: process.env[envVar] ?? "",
			});
		}
		return this.#client as MemcacheClient;
	}

	/**
	 * Returns the environment variable name that should contain the Memcached instance URL.
	 */
	get credentialsEnvVar() {
		return `MEMCACHED_${snakeCase(this.id).toUpperCase()}_URL`;
	}
}

export function defineMemcachedStore(id: string) {
	return new MemcachedStore(id);
}
