const WEBHOOK_SECRET = Deno.env.get("GITHUB_WEBHOOK_SECRET") ?? "";

const encoder = new TextEncoder();

async function verifySignature(header: string, payload: string) {
	const parts = header.split("=");
	const sigHex = parts[1];

	const algorithm = { name: "HMAC", hash: { name: "SHA-256" } };

	const keyBytes = encoder.encode(WEBHOOK_SECRET);
	const extractable = false;
	const key = await crypto.subtle.importKey(
		"raw",
		keyBytes,
		algorithm,
		extractable,
		["sign", "verify"]
	);

	const sigBytes = hexToBytes(sigHex);
	const dataBytes = encoder.encode(payload);
	const equal = await crypto.subtle.verify(
		algorithm.name,
		key,
		sigBytes,
		dataBytes
	);

	return equal;
}

function hexToBytes(hex: any) {
	const len = hex.length / 2;
	const bytes = new Uint8Array(len);

	let index = 0;
	for (let i = 0; i < hex.length; i += 2) {
		const c = hex.slice(i, i + 2);
		const b = parseInt(c, 16);
		bytes[index] = b;
		index += 1;
	}

	return bytes;
}

const parsePayload = (body: Record<string, any>) => {
	const { repository, sender, commits, ref } = body;

	const commitsNumber = (commits as Array<any>).length;
	const branchName = (ref as string).split("/")[
		(ref as string).split("/").length - 1
	];

	return {
		content: `${commitsNumber} Commit${
			commitsNumber > 1 ? "s" : ""
		} was added to ${repository.name} (${branchName}) by ${sender.login}`,
	};
};

export const createGithubClient = () => {
	if (!WEBHOOK_SECRET) {
		throw new Error("Github Webhook Secret is missing!");
	}

	return {
		parsePayload,
		verifySignature,
	};
};
