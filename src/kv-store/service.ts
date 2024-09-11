import { remember } from "@epic-web/remember";
import { kebabCase } from "case-anything";
import { hashValue } from "~/_lib/hash-value.js";
import type { KeyValueStore as KeyValueStoreInterface } from "~/kv-store/kv-store.js";

/**
 * Backing service for key value stores.
 */
export class KeyValueStore<
	TAdapter extends KeyValueStoreInterface,
	TLocalAdapter extends KeyValueStoreInterface = TAdapter,
> implements KeyValueStoreInterface
{
	readonly name: string;
	readonly adapter: TAdapter;
	readonly localAdapter: TLocalAdapter | TAdapter;

	/**
	 * Returns a `KeyValueStore`.
	 *
	 * If not supplied, the `localAdapter` will be the same as the adapter.
	 */
	constructor(public options: KeyValueStoreOptions<TAdapter, TLocalAdapter>) {
		this.name = options.name;
		const kebabName = kebabCase(this.name);
		this.adapter = remember(
			hashValue(`kv-store-adapter-${kebabName}`),
			() => new options.adapter(options.name),
		);
		this.localAdapter = remember(
			hashValue(`kv-store-local-adapter${kebabName}`),
			() =>
				options.localAdapter !== undefined
					? (new options.localAdapter(options.name) as unknown as TLocalAdapter)
					: this.adapter,
		);
	}

	async has(key: string) {
		return await this.currentAdapter.has(key);
	}

	async set(key: string, value: unknown) {
		return await this.currentAdapter.set(key, value);
	}

	async get<T = unknown>(key: string) {
		return await this.currentAdapter.get<T>(key);
	}

	async remove(key: string) {
		return await this.currentAdapter.remove(key);
	}

	/**
	 * Returns the adapter for the current environment
	 *
	 * When the `F4_ENV` environment variable is set to "local" the current
	 * adapter is `localAdapter`. Otherwise it's `adapter`.
	 */
	get currentAdapter() {
		switch (process.env.F4_ENV) {
			case "local":
				return this.localAdapter;
			default:
				return this.adapter;
		}
	}
}

export interface KeyValueStoreOptions<
	TAdapter extends KeyValueStoreInterface,
	TLocalAdapter extends KeyValueStoreInterface = TAdapter,
> {
	/**
	 * Mailer name.
	 */
	name: string;
	/**
	 * Adapter to use in production environments.
	 */
	adapter: new (name: string) => TAdapter;
	/**
	 * Adapter to use in local environments.
	 *
	 * @default adapter
	 */
	localAdapter?: new (name: string) => TLocalAdapter;
}
