import {
	afterAll,
	afterEach,
	assert,
	beforeAll,
	beforeEach,
	describe,
	test,
} from "vitest";
import {
	RedisStore,
	defineRedisStore,
} from "~/key-value-stores/redis/store.js";

interface RedisTestContext {
	store: RedisStore;
}

describe("Redis store", { sequential: true, concurrent: false }, async () => {
	let redisStore: RedisStore;

	beforeAll(async () => {
		const store = defineRedisStore("test-redis");
		redisStore = store;
		await store.container.start();
		await store.client.connect();
	});

	afterAll(async () => {
		if (redisStore) {
			redisStore.client.disconnect();
			await redisStore.container.stop();
		}
	});

	beforeEach<RedisTestContext>(async (context) => {
		context.store = redisStore;
	});

	afterEach<RedisTestContext>(async (context) => {
		await context.store.client.FLUSHDB();
	});

	test<RedisTestContext>("client commands", async (context) => {
		assert.notOk(await context.store.client.exists("hello"));

		await context.store.client.set("hello", "World!");

		assert.ok(await context.store.client.exists("hello"));

		let retrieved = await context.store.client.get("hello");

		assert(retrieved !== null);

		assert.strictEqual(retrieved, "World!");

		await context.store.client.del("hello");

		assert.isNull(await context.store.client.get("hello"));
	});
});
