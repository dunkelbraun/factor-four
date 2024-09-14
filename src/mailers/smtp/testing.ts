export async function mailpitMessages(port: number) {
	const response = await fetch(`http://localhost:${port}/api/v1/messages`);
	return await response.json();
}

export async function deleteMailpitMessages(port: number) {
	await fetch(`http://localhost:${port}/api/v1/messages`, {
		method: "DELETE",
	});
}
