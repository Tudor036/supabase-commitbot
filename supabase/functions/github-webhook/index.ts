import { createEdgeFunction } from "../_shared/functions.ts";
import { createDiscordClient } from "../_shared/discord.ts";
import { createGithubClient } from "../_shared/github.ts";
import { corsHeaders } from "../_shared/headers.ts";

const handler = createEdgeFunction(async (req) => {
	const body = await req.json();

	const isValid = createGithubClient().verifySignature(
		req.headers.get("X-Hub-Signature-256") ?? "",
		JSON.stringify(body)
	);

	if (!isValid) {
		return new Response("Restricted Access", {
			headers: {
				...corsHeaders,
				"Content-Type": "text/plain",
			},
			status: 401,
		});
	}

	if (body.commits.length === 0) {
		return new Response("ok");
	}

	const payload = createGithubClient().parsePayload(body);
	const discord = createDiscordClient();
	await discord.executeWebhook(payload);

	return new Response("ok");
});

Deno.serve(handler);
