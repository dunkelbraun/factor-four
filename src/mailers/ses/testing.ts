export async function sesEmails(port: number) {
	const response = await fetch(`http://localhost:${port}/store`);
	return (await response.json()).emails;
}
