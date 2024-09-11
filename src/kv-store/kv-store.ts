/**
 * A key/value interface for a key value store.
 */
export interface KeyValueStore {
	/**
	 * Returns `true` if a key exists in the store, `false` otherwise.
	 */
	has(key: string): Promise<boolean>;
	/**
	 * Puts a value at the given key in the store.
	 */
	set(key: string, value: unknown): Promise<void>;
	/**
	 * Returns the value with the given key from the store, or `null` if no such key exists.
	 */
	get<T = unknown>(key: string): Promise<T | null>;
	/**
	 * Removes the given key from the store.
	 */
	remove(key: string): Promise<void>;
}
