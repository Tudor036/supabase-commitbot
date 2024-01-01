import { corsHeaders } from "./headers.ts";

type EdgeFunctionHandler = (req: Request) => Promise<Response>;

export const createEdgeFunction =
	(fn: EdgeFunctionHandler): Deno.ServeHandler =>
	(req: Request) => {
		if (req.method === "OPTIONS") {
			return new Response("ok", { headers: corsHeaders });
		}

		return fn(req).catch((error) => {
			return new Response(JSON.stringify({ error: error.message }), {
				headers: { ...corsHeaders, "Content-Type": "application/json" },
				status: 400,
			});
		});
	};
