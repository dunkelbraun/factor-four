import dotenv from "dotenv";

export async function mailpitMessages() {
	let config: Record<string, string> = {};
	dotenv.config({ path: ".env.test", processEnv: config });
	const response = await fetch(
		`http://localhost:${config.MAILPIT_WEB_PORT}/api/v1/messages`,
	);
	return await response.json();
}

export async function deleteMailpitMessages() {
	let config: Record<string, string> = {};
	dotenv.config({ path: ".env.test", processEnv: config });
	await fetch(`http://localhost:${config.MAILPIT_WEB_PORT}/api/v1/messages`, {
		method: "DELETE",
	});
}
