import { assert, describe, expect, test } from "vitest";
import { RedisStore } from "~/kv-store/adapters/redis.js";
import { KeyValueStore } from "~/kv-store/service.js";

describe("Key Value Store service", () => {
	test("service name", () => {
		const mailer = new KeyValueStore({
			name: "test-kv",
			adapter: RedisStore,
		});
		assert.strictEqual(mailer.name, "test-kv");
	});

	test("adapter class", async () => {
		const store = new KeyValueStore({
			name: "test-kv-5",
			adapter: RedisStore,
		});

		expect(store.adapter).toBeInstanceOf(RedisStore);
	});
});
