import fs from "node:fs/promises";
import path from "node:path";
import { Container } from "~/_lib/container.js";
import { PostgreSQLDatabase } from "~/databases/postgresql/postgresql.js";
import { MemcachedStore } from "~/key-value-stores/memcached/store.js";
import { RedisStore } from "~/key-value-stores/redis/store.js";
import { SESMailer } from "~/mailers/ses/ses.js";
import { SMTPMailer } from "~/mailers/smtp/smtp.js";

export async function startResources(folderPath: string) {
	const resources = await importResources(folderPath);
	if (resources !== undefined) {
		for (const resource of resources) {
			if (isSMTPMailer(resource)) {
				await resource.container.startPersisted();
			}
			if (isSESMailer(resource)) {
				await resource.container.startPersisted();
			}
			if (isRedisStore(resource)) {
				await resource.container.startPersisted();
			}
			if (isMemcachedStore(resource)) {
				await resource.container.startPersisted();
			}
			if (isPostgreSQLDatabase(resource)) {
				await resource.container.startPersisted();
			}
		}
	}
}

export async function stopResources(folderPath: string) {
	const resources = await importResources(folderPath);
	if (resources !== undefined) {
		for (const resource of resources) {
			if (isSMTPMailer(resource)) {
				await Container.stop(resource.container);
			}
			if (isSESMailer(resource)) {
				await Container.stop(resource.container);
			}
			if (isRedisStore(resource)) {
				await Container.stop(resource.container);
			}
			if (isMemcachedStore(resource)) {
				await Container.stop(resource.container);
			}
			if (isPostgreSQLDatabase(resource)) {
				await Container.stop(resource.container);
			}
		}
	}
}

export async function importResources(folderPath: string) {
	const files = await fs.readdir(folderPath, { recursive: true });

	for (const fileName of files) {
		if (
			(fileName.endsWith(".ts") && !fileName.endsWith(".d.ts")) ||
			(fileName.endsWith(".mts") && !fileName.endsWith(".d.mts"))
		) {
			const fileExports = await import(path.join(folderPath, fileName));
			return Object.values(fileExports);
		}
	}
}

function isSMTPMailer(obj: unknown): obj is SMTPMailer {
	return (obj as any).constructor?.name === "SMTPMailer";
}

function isSESMailer(obj: unknown): obj is SESMailer {
	return (obj as any).constructor?.name === "SESMailer";
}

function isRedisStore(obj: unknown): obj is RedisStore {
	return (obj as any).constructor?.name === "RedisStore";
}

function isMemcachedStore(obj: unknown): obj is MemcachedStore {
	return (obj as any).constructor?.name === "MemcachedStore";
}

function isPostgreSQLDatabase(obj: unknown): obj is PostgreSQLDatabase {
	return (obj as any).constructor?.name === "PostgreSQLDatabase";
}
