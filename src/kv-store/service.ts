import { remember } from "@epic-web/remember";
import { kebabCase } from "case-anything";
import { hashValue } from "~/_lib/hash-value.js";
import type { KeyValueStore as KeyValueStoreInterface } from "~/kv-store/kv-store.js";

/**
 * Backing service for key value stores.
 */
export class KeyValueStore<TAdapter extends KeyValueStoreInterface>
	implements KeyValueStoreInterface
{
	readonly name: string;
	readonly adapter: TAdapter;

	/**
	 * Returns a `KeyValueStore`.
	 */
	constructor(public options: KeyValueStoreOptions<TAdapter>) {
		this.name = options.name;
		const kebabName = kebabCase(this.name);
		this.adapter = remember(
			hashValue(`kv-store-adapter-${kebabName}`),
			() => options.adapter,
		);
	}

	async has(key: string) {
		return await this.adapter.has(key);
	}

	async set(key: string, value: unknown) {
		return await this.adapter.set(key, value);
	}

	async get<T = unknown>(key: string) {
		return await this.adapter.get<T>(key);
	}

	async remove(key: string) {
		return await this.adapter.remove(key);
	}
}

export interface KeyValueStoreOptions<TAdapter extends KeyValueStoreInterface> {
	/**
	 * Mailer name.
	 */
	name: string;
	/**
	 * Adapter to use.
	 */
	adapter: TAdapter;
}
