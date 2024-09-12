import dotenv from "dotenv";
import { MemcacheClient, type StatsCommandResponse } from "memcache-client";
import { memcachedContainer } from "test/__setup__/memcached.js";
import type { StartedTestContainer } from "testcontainers";
import type { Equal, Expect } from "type-testing";
import {
	afterAll,
	afterEach,
	assert,
	beforeAll,
	beforeEach,
	describe,
	test,
} from "vitest";
import { MemcachedStore } from "~/kv-store/adapters/memcached.js";

let container: StartedTestContainer;

beforeAll(async () => {
	container = await memcachedContainer().start();
});

afterAll(async () => {
	await container.stop();
});

interface MemcachedTestContext {
	client: MemcacheClient;
	connectionURL: string;
}

beforeEach<MemcachedTestContext>(async (context) => {
	let config: Record<string, string> = {};
	dotenv.config({ path: ".env.test", processEnv: config });
	context.connectionURL = `localhost:${config.MEMCACHED_PORT}`;
	process.env.MEMCACHED_TEST_URL = context.connectionURL;
	context.client = new MemcacheClient({
		server: context.connectionURL,
	});
});

afterEach<MemcachedTestContext>(async (context) => {
	await context.client.cmd<StatsCommandResponse>("flush_all");
	context.client.shutdown();
});

describe(
	"Memcached store",
	{ sequential: true, concurrent: false },
	async () => {
		test<MemcachedTestContext>("set", async (context) => {
			process.env.MEMCACHED_TEST_MEMCACHED_SET_URL = context.connectionURL;
			let storage = new MemcachedStore("test-memcached-set");

			assert.isUndefined(await context.client.get<string>("hello"));

			await storage.set("hello", "World!");

			const response = await context.client.get<string>("hello");
			assert(response !== undefined);
			assert.strictEqual(response.value, JSON.stringify("World!"));
		});

		test<MemcachedTestContext>("get", async (context) => {
			process.env.MEMCACHED_TEST_MEMCACHED_GET_URL = context.connectionURL;
			let storage = new MemcachedStore("test-memcached-get");

			assert.isUndefined(await context.client.get<string>("hello"));

			await context.client.set("hello", JSON.stringify("World!"));

			let retrieved = await storage.get("hello");

			assert(retrieved !== null);

			assert.strictEqual(retrieved, "World!");
		});

		test<MemcachedTestContext>("get with type", async (context) => {
			process.env.MEMCACHED_TEST_MEMCACHED_GET_TYPE_URL = context.connectionURL;
			let storage = new MemcachedStore("test-memcached-get-type");

			assert.isUndefined(await context.client.get<string>("hello"));

			type Foo = { foo: string };
			await context.client.set("hello", JSON.stringify({ foo: "bar" }));

			let retrieved = await storage.get<Foo>("hello");

			assert(retrieved !== null);

			type OutputType = typeof retrieved;
			type ExpectedOutputType = { foo: string };
			const isEqualOutput: Expect<Equal<OutputType, ExpectedOutputType>> = true;

			assert.ok(isEqualOutput);

			assert.strictEqual(retrieved.foo, "bar");
		});

		test<MemcachedTestContext>("remove", async (context) => {
			process.env.MEMCACHED_TEST_MEMCACHED_REMOVE_URL = context.connectionURL;
			let storage = new MemcachedStore("test-memcached-remove");

			assert.isUndefined(await context.client.get<string>("hello"));

			await context.client.set("hello", JSON.stringify("World!"));

			const response = await context.client.get<string>("hello");
			assert(response !== undefined);

			await storage.remove("hello");

			assert.isUndefined(await context.client.get("hello"));
		});

		test<MemcachedTestContext>("has", async (context) => {
			process.env.MEMCACHED_TEST_MEMCACHED_HAS_URL = context.connectionURL;
			let storage = new MemcachedStore("test-memcached-has");

			assert.isUndefined(await context.client.get<string>("hello"));

			await storage.set("hello", "World!");

			assert.ok(await storage.has("hello"));
		});
	},
);
