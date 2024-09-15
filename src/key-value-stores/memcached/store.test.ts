import type { StatsCommandResponse } from "memcache-client";
import {
	afterAll,
	afterEach,
	assert,
	beforeAll,
	beforeEach,
	describe,
	test,
} from "vitest";
import type { StartedMemcachedContainer } from "~/key-value-stores/memcached/container.js";
import {
	type MemcachedStore,
	defineMemcachedStore,
} from "~/key-value-stores/memcached/store.js";

interface MemcachedTestContext {
	store: MemcachedStore;
}

describe(
	"Memcached store",
	{ sequential: true, concurrent: false },
	async () => {
		let memcachedStore: MemcachedStore;
		let startedContainer: StartedMemcachedContainer;

		beforeAll(async () => {
			const store = defineMemcachedStore("test-memcached-set");
			memcachedStore = store;
			await store.container.start();
		});

		afterAll(async () => {
			if (memcachedStore) {
				memcachedStore.client.shutdown();
			}
			if (startedContainer) {
				await startedContainer.stop();
			}
		});

		beforeEach<MemcachedTestContext>(async (context) => {
			context.store = memcachedStore;
		});

		afterEach<MemcachedTestContext>(async (context) => {
			await context.store.client.cmd<StatsCommandResponse>("flush_all");
		});

		test<MemcachedTestContext>("client operations", async (context) => {
			assert.isUndefined(await context.store.client.get<string>("hello"));

			await context.store.client.set("hello", "World!");

			const response = await context.store.client.get<string>("hello");
			assert(response !== undefined);
			assert.strictEqual(response.value, "World!");

			await context.store.client.delete("hello");
			assert.isUndefined(await context.store.client.get("hello"));
		});
	},
);
