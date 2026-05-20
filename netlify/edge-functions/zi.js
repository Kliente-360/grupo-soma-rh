// Proxy do Gemini para o protótipo Zi.
//
// O browser chama POST /api/zi com o mesmo payload que iria pro Gemini.
// Esta edge function lê GEMINI_API_KEY do env do Netlify (jamais committada)
// e repassa pro streamGenerateContent. A resposta SSE volta como stream
// transparente — o cliente nem percebe que tem um proxy no meio.
//
// Configurar no Netlify: Site settings → Environment variables →
// adicionar GEMINI_API_KEY com a chave de produção.

const MODEL = "gemini-2.5-flash";

// Lê GEMINI_API_KEY de qualquer API disponível no runtime.
function readApiKey() {
  let v;
  try { v = (typeof Netlify !== "undefined") && Netlify.env?.get("GEMINI_API_KEY"); } catch { /* noop */ }
  if (!v) {
    try { v = (typeof Deno !== "undefined") && Deno.env.get("GEMINI_API_KEY"); } catch { /* noop */ }
  }
  return v || "";
}

export default async (req) => {
  if (req.method === "GET") {
    const url = new URL(req.url);
    if (url.searchParams.get("debug") === "1") {
      // Diagnóstico sem vazar valor: só comprimento e qual API enxergou.
      let netlifyLen = 0, denoLen = 0;
      try { netlifyLen = ((typeof Netlify !== "undefined") && Netlify.env?.get("GEMINI_API_KEY") || "").length; } catch {}
      try { denoLen = ((typeof Deno !== "undefined") && Deno.env.get("GEMINI_API_KEY") || "").length; } catch {}
      return new Response(JSON.stringify({
        netlifyApiSeesKey: netlifyLen > 0,
        denoApiSeesKey: denoLen > 0,
        netlifyKeyLen: netlifyLen,
        denoKeyLen: denoLen,
      }, null, 2), { headers: { "Content-Type": "application/json" } });
    }
    return new Response("Zi proxy OK", { status: 200 });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = readApiKey();
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: {
          code: 500,
          message:
            "GEMINI_API_KEY não configurada no Netlify (Site settings → Environment variables → scope 'All scopes' ou inclua 'Runtime').",
        },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const upstreamUrl =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}` +
    `:streamGenerateContent?alt=sse&key=${apiKey}`;

  const body = await req.text();

  const upstream = await fetch(upstreamUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  // Repassa status e stream. Cliente continua parseando SSE como antes.
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("Content-Type") || "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
};

export const config = {
  path: "/api/zi",
};
