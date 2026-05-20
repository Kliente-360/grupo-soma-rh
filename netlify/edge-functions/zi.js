// Edge function da Zi — endpoint único /api/zi com dispatch por `action` no body.
//
// Ações suportadas (POST):
//   chat                     → embed da pergunta → match_kb_chunks → Gemini stream
//                              (retorna stream SSE; X-Interaction-Id no header)
//   save_answer              → completa zi_interactions.answer após o stream
//   feedback                 → grava rating 👍 / 👎 no interaction
//   escalate                 → marca interaction como escalada (+ nome/email)
//   pending_count            → contagem pública de escalações pendentes (pro badge)
//
//   admin_list_pending       → lista escalações pendentes (PIN required)
//   admin_list_trained       → lista respostas treinadas ativas
//   admin_list_feedback      → lista interações com rating
//   admin_save_trained       → salva resposta do RH (vira "treinada") e marca interaction resolved
//   admin_delete_trained     → soft-delete (active=false)
//   admin_delete_pending     → marca pendência como descartada (resolved_at=now())
//   admin_clear_feedback     → remove rating de uma interaction
//
// Env vars (Netlify → Site settings → Environment variables):
//   GEMINI_API_KEY                                   — Google AI Studio
//   SUPABASE_ZI_URL       (ou SUPABASE_URL)          — Project URL
//   SUPABASE_ZI_SECRET_KEY (ou SUPABASE_SECRET_KEY)  — sb_secret_... (bypassa RLS)

const MODEL_CHAT  = "gemini-2.5-flash";
const MODEL_EMBED = "gemini-embedding-001";
const EMBED_DIM   = 768;
const ADMIN_PIN   = "NVRH2026";

// ---------------- Env helper ----------------
function env(k) {
  try { if (typeof Netlify !== "undefined") return Netlify.env?.get(k) || ""; } catch { /* noop */ }
  try { if (typeof Deno    !== "undefined") return Deno.env?.get(k)    || ""; } catch { /* noop */ }
  return "";
}

// Aliases: SUPABASE_ZI_* (preferido) com fallback pros nomes genéricos.
function supabaseUrl() { return env("SUPABASE_ZI_URL") || env("SUPABASE_URL"); }
function supabaseKey() { return env("SUPABASE_ZI_SECRET_KEY") || env("SUPABASE_SECRET_KEY"); }

// ---------------- HTTP helpers ----------------
const json = (obj, init = {}) => new Response(JSON.stringify(obj), {
  status: init.status || 200,
  headers: { "Content-Type": "application/json", ...(init.headers || {}) },
});

const err = (status, message, extra = {}) =>
  json({ error: { message, ...extra } }, { status });

// ---------------- Supabase REST helper ----------------
async function supabaseFetch(path, init = {}) {
  const url = supabaseUrl().replace(/\/$/, "") + path;
  const key = supabaseKey();
  return fetch(url, {
    ...init,
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
}

// ---------------- Gemini helpers ----------------
async function embed(text) {
  const key = env("GEMINI_API_KEY");
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_EMBED}:embedContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${MODEL_EMBED}`,
        content: { parts: [{ text }] },
        outputDimensionality: EMBED_DIM,
      }),
    },
  );
  if (!r.ok) throw new Error(`embed failed: HTTP ${r.status} — ${await r.text()}`);
  const data = await r.json();
  return data.embedding.values;
}

async function matchChunks(queryEmbedding, matchCount = 3) {
  const r = await supabaseFetch("/rest/v1/rpc/match_kb_chunks", {
    method: "POST",
    body: JSON.stringify({
      query_embedding: queryEmbedding,
      match_count: matchCount,
      filter_audience: null,
      filter_category: null,
    }),
  });
  if (!r.ok) throw new Error(`match_kb_chunks failed: HTTP ${r.status} — ${await r.text()}`);
  return r.json();
}

async function getActiveTrained(limit = 20) {
  const r = await supabaseFetch(
    `/rest/v1/zi_trained_answers?active=eq.true&order=created_at.desc&limit=${limit}&select=question,answer`,
  );
  if (!r.ok) return [];
  return r.json();
}

// ---------------- Interaction helpers ----------------
async function insertInteraction(sessionId, question) {
  const r = await supabaseFetch("/rest/v1/zi_interactions", {
    method: "POST",
    headers: { "Prefer": "return=representation" },
    body: JSON.stringify({ session_id: sessionId, question }),
  });
  if (!r.ok) throw new Error(`insert interaction failed: HTTP ${r.status} — ${await r.text()}`);
  const rows = await r.json();
  return rows[0]?.id;
}

async function patchInteraction(id, patch) {
  return supabaseFetch(`/rest/v1/zi_interactions?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

// ---------------- System prompt builder ----------------
function buildSystemPrompt(chunks, trained) {
  const kb = chunks.map(c =>
    `--- ${c.section_title} (fonte: ${c.source_file}) ---\n${c.content}`
  ).join("\n\n");

  const trainedBlock = trained.length > 0
    ? `\n\n# RESPOSTAS APROVADAS PELO RH (treinamento contínuo)\n${trained.map((t, i) =>
        `**Pergunta ${i + 1}**: ${t.question}\n**Resposta oficial**: ${t.answer}`
      ).join("\n\n")}`
    : "";

  return `Você é a Zi, assistente virtual de RH da NV. Tira dúvidas dos colaboradores com clareza e leveza.

# COMO VOCÊ FALA
- Tom amigável e descontraído, próximo de uma conversa entre colegas
- Direto ao ponto: respostas curtas, conclusivas, sem floreio
- Use "você" e evite jargão jurídico desnecessário
- Pode usar emojis com moderação (1 por mensagem no máximo)
- Várias etapas: listas numeradas curtas

# REGRA DE OURO
Responde APENAS com base na BASE DE CONHECIMENTO abaixo. Não invente, não use conhecimento geral, não chute.

Se a pergunta não puder ser respondida com clareza pela base, sua resposta deve ser EXATAMENTE este token e nada mais:
[NAO_ENCONTREI]

Use [NAO_ENCONTREI] quando:
- A informação não está na base
- A informação está incompleta ou ambígua para resposta conclusiva
- A pergunta é sobre caso muito específico que pediria avaliação humana

Não use [NAO_ENCONTREI] como muleta. Se está na base, responde confiante.

# BASE DE CONHECIMENTO

${kb}${trainedBlock}

# FORMATAÇÃO
- Sem cabeçalhos markdown (###)
- Pode usar **negrito** pra prazos, valores, nomes de portais
- Listas numeradas só com 3+ passos
- Encerre respostas longas com "Se precisar de mais detalhe, é só falar 👋" ou similar`;
}

// ---------------- Action handlers ----------------

async function handleChat(body) {
  const messages = Array.isArray(body.messages) ? body.messages : null;
  if (!messages || messages.length === 0) return err(400, "missing messages");

  const last = messages[messages.length - 1];
  if (last?.role !== "user" || !String(last.content || "").trim()) {
    return err(400, "last message must be from user");
  }
  const currentQuestion = String(last.content).trim();
  const sessionId = body.session_id || null;

  // 1) Embed + retrieval (paralelo com fetch trained)
  const queryEmbedding = await embed(currentQuestion);
  const [chunks, trained] = await Promise.all([
    matchChunks(queryEmbedding, 3),
    getActiveTrained(),
  ]);

  // 2) Pre-insert da interaction (id volta no header pra o client guardar)
  const interactionId = await insertInteraction(sessionId, currentQuestion);

  // 3) Monta contents pra Gemini
  const contents = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: String(m.content || "") }],
  }));

  const payload = {
    contents,
    systemInstruction: { parts: [{ text: buildSystemPrompt(chunks, trained) }] },
    generationConfig: { temperature: 0.4, maxOutputTokens: 1024, topP: 0.95 },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  };

  const upstreamUrl =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_CHAT}` +
    `:streamGenerateContent?alt=sse&key=${env("GEMINI_API_KEY")}`;

  const upstream = await fetch(upstreamUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Stream transparente; cliente parseia SSE igual antes.
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") || "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
      "X-Interaction-Id": String(interactionId),
      "Access-Control-Expose-Headers": "X-Interaction-Id",
    },
  });
}

async function handleSaveAnswer(body) {
  const { interactionId, answer } = body;
  if (!interactionId) return err(400, "missing interactionId");
  const r = await patchInteraction(interactionId, { answer: answer ?? null });
  if (!r.ok) return err(500, "save_answer failed", { detail: await r.text() });
  return json({ ok: true });
}

async function handleFeedback(body) {
  const { interactionId, rating, comment } = body;
  if (!interactionId) return err(400, "missing interactionId");
  if (rating !== 1 && rating !== -1) return err(400, "rating must be 1 or -1");
  const r = await patchInteraction(interactionId, {
    rating,
    rating_at: new Date().toISOString(),
    rating_comment: comment || null,
  });
  if (!r.ok) return err(500, "feedback failed", { detail: await r.text() });
  return json({ ok: true });
}

async function handleEscalate(body) {
  const { interactionId, name, email } = body;
  if (!interactionId) return err(400, "missing interactionId");
  const r = await patchInteraction(interactionId, {
    escalated: true,
    user_name: name || null,
    user_email: email || null,
  });
  if (!r.ok) return err(500, "escalate failed", { detail: await r.text() });
  return json({ ok: true });
}

async function handlePendingCount() {
  // count=exact via Content-Range — não precisa baixar as linhas
  const r = await supabaseFetch(
    "/rest/v1/zi_interactions?escalated=eq.true&resolved_at=is.null&select=id",
    { method: "HEAD", headers: { "Prefer": "count=exact" } },
  );
  const range = r.headers.get("Content-Range") || "*/0";
  const count = parseInt((range.split("/")[1] || "0"), 10);
  return json({ count });
}

// ---------------- Admin (PIN) ----------------
function checkPin(body) {
  if ((body.pin || "") !== ADMIN_PIN) return err(401, "invalid pin");
  return null;
}

async function handleAdminListPending(body) {
  const denied = checkPin(body); if (denied) return denied;
  const r = await supabaseFetch(
    "/rest/v1/zi_interactions?escalated=eq.true&resolved_at=is.null" +
    "&order=created_at.desc&select=id,question,user_name,user_email,created_at",
  );
  if (!r.ok) return err(500, "list failed", { detail: await r.text() });
  return json(await r.json());
}

async function handleAdminListTrained(body) {
  const denied = checkPin(body); if (denied) return denied;
  const r = await supabaseFetch(
    "/rest/v1/zi_trained_answers?active=eq.true&order=created_at.desc" +
    "&select=id,question,answer,created_at,trained_by",
  );
  if (!r.ok) return err(500, "list failed", { detail: await r.text() });
  return json(await r.json());
}

async function handleAdminListFeedback(body) {
  const denied = checkPin(body); if (denied) return denied;
  const r = await supabaseFetch(
    "/rest/v1/zi_interactions?rating=not.is.null&order=rating_at.desc&limit=200" +
    "&select=id,question,answer,rating,rating_comment,rating_at",
  );
  if (!r.ok) return err(500, "list failed", { detail: await r.text() });
  return json(await r.json());
}

async function handleAdminSaveTrained(body) {
  const denied = checkPin(body); if (denied) return denied;
  const { interactionId, answer } = body;
  if (!interactionId || !String(answer || "").trim()) {
    return err(400, "missing interactionId or answer");
  }

  // pega a pergunta
  const r1 = await supabaseFetch(
    `/rest/v1/zi_interactions?id=eq.${encodeURIComponent(interactionId)}&select=question`,
  );
  if (!r1.ok) return err(500, "fetch interaction failed", { detail: await r1.text() });
  const rows = await r1.json();
  if (!rows[0]) return err(404, "interaction not found");

  // insere em zi_trained_answers
  const r2 = await supabaseFetch("/rest/v1/zi_trained_answers", {
    method: "POST",
    body: JSON.stringify({
      question: rows[0].question,
      answer,
      source_question_id: interactionId,
      trained_by: "admin",
    }),
  });
  if (!r2.ok) return err(500, "insert trained failed", { detail: await r2.text() });

  // marca interaction como resolvida
  await patchInteraction(interactionId, { resolved_at: new Date().toISOString() });

  return json({ ok: true });
}

async function handleAdminDeleteTrained(body) {
  const denied = checkPin(body); if (denied) return denied;
  const { trainedId } = body;
  if (!trainedId) return err(400, "missing trainedId");
  const r = await supabaseFetch(
    `/rest/v1/zi_trained_answers?id=eq.${encodeURIComponent(trainedId)}`,
    { method: "PATCH", body: JSON.stringify({ active: false }) },
  );
  if (!r.ok) return err(500, "delete trained failed", { detail: await r.text() });
  return json({ ok: true });
}

async function handleAdminDeletePending(body) {
  const denied = checkPin(body); if (denied) return denied;
  const { interactionId } = body;
  if (!interactionId) return err(400, "missing interactionId");
  // marca como resolvida (descartada) — preserva o registro pra telemetria
  const r = await patchInteraction(interactionId, { resolved_at: new Date().toISOString() });
  if (!r.ok) return err(500, "delete pending failed", { detail: await r.text() });
  return json({ ok: true });
}

async function handleAdminClearFeedback(body) {
  const denied = checkPin(body); if (denied) return denied;
  const { interactionId } = body;
  if (!interactionId) return err(400, "missing interactionId");
  const r = await patchInteraction(interactionId, {
    rating: null,
    rating_at: null,
    rating_comment: null,
  });
  if (!r.ok) return err(500, "clear feedback failed", { detail: await r.text() });
  return json({ ok: true });
}

// ---------------- Main handler ----------------
export default async (req) => {
  if (req.method === "GET") {
    const u = new URL(req.url);
    if (u.searchParams.get("debug") === "1") {
      return json({
        ok: true,
        env: {
          hasGeminiKey:   !!env("GEMINI_API_KEY"),
          hasSupabaseUrl: !!supabaseUrl(),
          hasSupabaseKey: !!supabaseKey(),
          supabaseUrlVar: env("SUPABASE_ZI_URL")        ? "SUPABASE_ZI_URL"        : (env("SUPABASE_URL")        ? "SUPABASE_URL"        : null),
          supabaseKeyVar: env("SUPABASE_ZI_SECRET_KEY") ? "SUPABASE_ZI_SECRET_KEY" : (env("SUPABASE_SECRET_KEY") ? "SUPABASE_SECRET_KEY" : null),
        },
        model: { chat: MODEL_CHAT, embed: MODEL_EMBED, embedDim: EMBED_DIM },
      });
    }
    return new Response("Zi proxy OK", { status: 200 });
  }

  if (req.method !== "POST") return err(405, "method not allowed");

  const missingEnv = [];
  if (!env("GEMINI_API_KEY")) missingEnv.push("GEMINI_API_KEY");
  if (!supabaseUrl())         missingEnv.push("SUPABASE_ZI_URL (ou SUPABASE_URL)");
  if (!supabaseKey())         missingEnv.push("SUPABASE_ZI_SECRET_KEY (ou SUPABASE_SECRET_KEY)");
  if (missingEnv.length > 0) {
    return err(500, `env vars não configuradas no Netlify: ${missingEnv.join(", ")}`);
  }

  let body;
  try { body = await req.json(); }
  catch { return err(400, "invalid json"); }

  const action = body.action || "chat";

  try {
    switch (action) {
      case "chat":                 return await handleChat(body);
      case "save_answer":          return await handleSaveAnswer(body);
      case "feedback":             return await handleFeedback(body);
      case "escalate":             return await handleEscalate(body);
      case "pending_count":        return await handlePendingCount();
      case "admin_list_pending":   return await handleAdminListPending(body);
      case "admin_list_trained":   return await handleAdminListTrained(body);
      case "admin_list_feedback":  return await handleAdminListFeedback(body);
      case "admin_save_trained":   return await handleAdminSaveTrained(body);
      case "admin_delete_trained": return await handleAdminDeleteTrained(body);
      case "admin_delete_pending": return await handleAdminDeletePending(body);
      case "admin_clear_feedback": return await handleAdminClearFeedback(body);
      default:                     return err(400, `unknown action: ${action}`);
    }
  } catch (e) {
    return err(500, "internal error", { detail: String(e?.message || e) });
  }
};

export const config = {
  path: "/api/zi",
};
