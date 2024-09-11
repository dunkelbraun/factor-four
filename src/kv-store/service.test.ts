import { afterEach, assert, describe, test } from "vitest";
import { RedisStore } from "~/kv-store/adapters/redis.js";
import { KeyValueStore } from "~/kv-store/service.js";

describe("Key Value Store service", () => {
	afterEach(() => {
		delete process.env.F4_ENV;
	});

	test("service name", () => {
		const mailer = new KeyValueStore({
			name: "test-kv",
			adapter: RedisStore,
		});
		assert.strictEqual(mailer.name, "test-kv");
	});

	test("custom local adapter", () => {
		const mailer = new KeyValueStore({
			name: "test-kv-2",
			adapter: RedisStore,
			localAdapter: RedisStore,
		});

		assert.notStrictEqual(mailer.adapter.uuid, mailer.localAdapter.uuid);
	});

	test("same as adapter when not defined", () => {
		const mailer = new KeyValueStore({
			name: "test-kv-3",
			adapter: RedisStore,
		});

		assert.strictEqual(mailer.adapter.uuid, mailer.localAdapter.uuid);
	});

	test("current adapter is adapter by default", () => {
		const mailer = new KeyValueStore({
			name: "test-kv-4",
			adapter: RedisStore,
			localAdapter: RedisStore,
		});

		assert.strictEqual(mailer.adapter.uuid, mailer.currentAdapter.uuid);
	});

	test("current adapter is local adapter when F4_ENV is local", () => {
		process.env.F4_ENV = "local";
		const mailer = new KeyValueStore({
			name: "test-kv-5",
			adapter: RedisStore,
			localAdapter: RedisStore,
		});

		assert.strictEqual(mailer.localAdapter.uuid, mailer.currentAdapter.uuid);
	});
});
