import type { StartedSMTPContainer } from "~/mailers/smtp/container.js";

export async function allMessages(container: StartedSMTPContainer) {
	const response = await fetch(container.messagesApiURL);
	return await response.json();
}

export async function deleteAllMessages(container: StartedSMTPContainer) {
	await fetch(container.messagesApiURL, { method: "DELETE" });
}
