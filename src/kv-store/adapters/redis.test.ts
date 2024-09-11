import dotenv from "dotenv";
import { createClient, type RedisClientType } from "redis";
import { redisContainer } from "test/__setup__/redis.js";
import type { StartedTestContainer } from "testcontainers";
import { type Equal, type Expect } from "type-testing";
import {
	afterAll,
	afterEach,
	assert,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from "vitest";
import { RedisStore } from "~/kv-store/adapters/redis.js";

let container: StartedTestContainer;

beforeAll(async () => {
	container = await redisContainer().start();
});

afterAll(async () => {
	await container.stop();
});

interface RedisTestContext {
	client: RedisClientType;
	connectionURL: string;
}

beforeEach<RedisTestContext>(async (context) => {
	let config: Record<string, string> = {};
	dotenv.config({ path: ".env.test", processEnv: config });
	context.connectionURL = `redis://localhost:${config.REDIS_PORT}`;
	console.log(context.connectionURL);
	process.env.REDIS_TEST_REDIS_URL = context.connectionURL;
	context.client = createClient({
		url: context.connectionURL,
	});
	context.client.on("error", (err) => console.log("Redis Client Error", err));
	context.client.connect();
});

afterEach<RedisTestContext>(async (context) => {
	await context.client.FLUSHDB();
	context.client.disconnect();
});

describe("Redis store", { sequential: true, concurrent: false }, async () => {
	test<RedisTestContext>("set", async (context) => {
		process.env.REDIS_TEST_REDIS_SET_URL = context.connectionURL;
		let storage = new RedisStore("test-redis-set");

		assert.notOk(await context.client.exists("hello"));

		await storage.set("hello", "World!");

		assert.ok(await context.client.exists("hello"));
	});

	test<RedisTestContext>("get", async (context) => {
		process.env.REDIS_TEST_REDIS_GET_URL = context.connectionURL;
		let storage = new RedisStore("test-redis-get");

		assert.notOk(await context.client.exists("hello"));
		await context.client.set("hello", JSON.stringify("World!"));

		let retrieved = await storage.get("hello");

		assert(retrieved !== null);

		assert.strictEqual(retrieved, "World!");
	});

	test<RedisTestContext>("get with type", async (context) => {
		process.env.REDIS_TEST_REDIS_GET_URL = context.connectionURL;
		let storage = new RedisStore("test-redis-get");

		assert.notOk(await context.client.exists("hello"));
		type Foo = { foo: string };
		await context.client.set("hello", JSON.stringify({ foo: "bar" }));

		let retrieved = await storage.get<Foo>("hello");

		assert(retrieved !== null);

		type OutputType = typeof retrieved;
		type ExpectedOutputType = { foo: string };
		const isEqualOutput: Expect<Equal<OutputType, ExpectedOutputType>> = true;

		expect(isEqualOutput).toBe(true);

		assert.strictEqual(retrieved.foo, "bar");
	});

	test<RedisTestContext>("remove", async (context) => {
		process.env.REDIS_TEST_REDIS_REMOVE_URL = context.connectionURL;
		let storage = new RedisStore("test-redis-remove");

		assert.notOk(await context.client.exists("hello"));
		await context.client.set("hello", JSON.stringify("World!"));
		assert.ok(await context.client.exists("hello"));

		await storage.remove("hello");

		// assert.notOk(await storage.has("hello"));
		assert.isNull(await context.client.get("hello"));
	});

	test<RedisTestContext>("has", async (context) => {
		process.env.REDIS_TEST_REDIS_HAS_URL = context.connectionURL;
		let storage = new RedisStore("test-redis-has");

		assert.notOk(await context.client.exists("hello"));

		await storage.set("hello", "World!");

		assert.ok(await storage.has("hello"));
	});
});
