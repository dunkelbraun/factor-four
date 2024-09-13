import { assert, describe, expect, test } from "vitest";
import { MemcachedStore } from "~/kv-store/adapters/memcached.js";
import { RedisStore } from "~/kv-store/adapters/redis.js";
import { defineKeyValueStore, KeyValueStore } from "~/kv-store/service.js";

describe("Key Value Store service", () => {
	test("service name", () => {
		const mailer = new KeyValueStore({
			name: "test-kv",
			adapter: new RedisStore("test-store"),
		});
		assert.strictEqual(mailer.name, "test-kv");
	});

	test("adapter class", async () => {
		const store = new KeyValueStore({
			name: "test-kv-5",
			adapter: new RedisStore("test-store"),
		});

		expect(store.adapter).toBeInstanceOf(RedisStore);
	});

	test("defineKeyValueStore", () => {
		const memcachedStore = defineKeyValueStore("test-memcached-store", {
			kind: "memcached",
		});
		expect(memcachedStore.adapter).toBeInstanceOf(MemcachedStore);

		const redisStore = defineKeyValueStore("test-redis-store", {
			kind: "redis",
		});
		expect(redisStore.adapter).toBeInstanceOf(RedisStore);
	});
});
