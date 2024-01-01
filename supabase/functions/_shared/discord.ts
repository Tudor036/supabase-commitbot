const executeWebhook = async (payload: Record<string, string>) => {
	const response = await fetch(Deno.env.get("DISCORD_WEBHOOK_URL")!, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (response.ok) return;

	const error = await response.json();
	console.log(error);
};

export const createDiscordClient = () => {
	if (!Deno.env.get("DISCORD_WEBHOOK_URL")) {
		throw new Error("Discord Webhook URL is missing!");
	}

	return {
		executeWebhook,
	};
};
