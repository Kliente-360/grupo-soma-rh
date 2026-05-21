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
//   admin_list_pending       → lista escalações pendentes (login admin required)
//   admin_list_trained       → lista respostas treinadas ativas
//   admin_list_feedback      → lista interações com rating
//   admin_save_trained       → salva resposta do RH (vira "treinada") e marca interaction resolved
//   admin_delete_trained     → soft-delete (active=false)
//   admin_delete_pending     → marca pendência como descartada (resolved_at=now())
//   admin_clear_feedback     → remove rating de uma interaction
//
// Env vars (Netlify → Site settings → Environment variables):
//   GEMINI_ZI_API_KEY      (ou GEMINI_API_KEY)        — Google AI Studio
//   SUPABASE_ZI_URL        (ou SUPABASE_URL)          — Project URL
//   SUPABASE_ZI_SECRET_KEY (ou SUPABASE_SECRET_KEY)   — sb_secret_... (bypassa RLS)

const MODEL_CHAT  = "gemini-2.5-flash";
const MODEL_EMBED = "gemini-embedding-001";
const EMBED_DIM   = 768;

// Credenciais — fricção, não segurança. Substituir por SSO em produção.
// Refletido no client (CREDENTIALS em index.html). Server é a fonte da verdade.
const CREDENTIALS = {
  admin: { password: "adminnv26", role: "admin" },
  user:  { password: "usernv26",  role: "user"  },
};

// ---------------- Env helper ----------------
function env(k) {
  try { if (typeof Netlify !== "undefined") return Netlify.env?.get(k) || ""; } catch { /* noop */ }
  try { if (typeof Deno    !== "undefined") return Deno.env?.get(k)    || ""; } catch { /* noop */ }
  return "";
}

// Aliases: *_ZI_* (preferido) com fallback pros nomes genéricos.
function geminiKey()   { return env("GEMINI_ZI_API_KEY")      || env("GEMINI_API_KEY"); }
function supabaseUrl() { return env("SUPABASE_ZI_URL")        || env("SUPABASE_URL"); }
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
  const key = geminiKey();
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

// ---------------- Query rewriter + decomposer (multi-query) ----------------
//
// Resolve dois problemas clássicos de RAG conversacional:
//
//   1. Follow-up: "qual o valor?" depende de histórico — embedding não vê.
//   2. Comparativo: "é igual para loja e corporativo?" cobre 2 aspectos
//      separados na KB — embedding único puxa só o lado mais saliente.
//
// Estratégia: reescreve a pergunta em UMA OU MAIS consultas autônomas.
// Pergunta simples → 1 query. Pergunta comparativa/multi-caso → 2-3 queries.
// Cada query vira retrieval separado; chunks são merged+deduped depois.
//
// Padrões: ConversationalRetrievalChain + MultiQueryRetriever (LangChain).

async function rewriteToQueries(messages) {
  const current = String(messages[messages.length - 1]?.content || "").trim();

  const priorTurns = messages.slice(0, -1).filter(m =>
    (m.role === "user" || m.role === "assistant") && String(m.content || "").trim()
  );

  // Triggers comparativos — força reescrita mesmo se a pergunta tem entidade da KB
  const comparativeRegex = /\b(igual|diferen[çc]a|diferente|comparad|vs\b|versus|ou (corporativo|loja|admin|comercial)|loja e corporativo|corporativo e loja|antes e depois|cada (caso|tipo))/i;
  const isComparative = comparativeRegex.test(current);

  // Sem histórico e não-comparativa → usa a pergunta direto
  if (priorTurns.length === 0 && !isComparative) return [current];

  // Bypass de heurística pra perguntas claramente autônomas e não-comparativas
  const looksStandalone =
    !isComparative && (
      current.length > 80 ||
      /vale[-\s]?(refei[çc][ãa]o|transporte)|f[ée]rias|licen[çc]a|plano de sa[úu]de|odontol[óo]gico|day off|wellz|sesc|admiss[ãa]o|desligamento|paternidade|maternidade|pgsi|seguran[çc]a da informa[çc][ãa]o|gnd[i]?|sulam[ée]rica|hapvida|cesta b[áa]sica|seguro de vida|cr[ée]dito de natal/i.test(current)
    );
  if (looksStandalone && priorTurns.length === 0) return [current];

  const recent = priorTurns.slice(-6).map(m =>
    `${m.role === "user" ? "Usuário" : "Zi"}: ${m.content}`
  ).join("\n") || "(sem histórico)";

  const prompt = `Você reescreve perguntas de chat em consultas autônomas pra busca nos documentos internos de RH.

Recebe histórico recente e a pergunta atual. Devolve UMA ou MAIS consultas — uma por linha — que cubram o que o usuário quer saber.

Regras:
1. Se a pergunta atual já é autônoma e cobre UM tema, devolve 1 linha.
2. Se contém referência implícita (pronomes, "isso", "o valor", "quanto", "quando"), incorpora o assunto do histórico.
3. Se a pergunta COMPARA, DIFERENCIA ou cobre MÚLTIPLOS casos (ex: "loja e corporativo", "PJ e CLT", "antes e depois"), devolve uma consulta POR CASO — uma por linha.
4. Limite máximo: 3 linhas.
5. NÃO invente contexto fora do histórico.
6. Devolve SÓ as consultas, uma por linha — sem aspas, sem prefixos, sem numeração, sem explicações.

Exemplos:

Histórico:
Usuário: Como funciona o vale-refeição?
Zi: É um cartão Flash...
Pergunta atual: qual o valor?
Reescrita:
Qual o valor do vale-refeição?

Histórico:
Usuário: Como funciona o vale-refeição?
Zi: ...R$ 620,00...
Pergunta atual: é igual para loja e corporativo?
Reescrita:
Vale-refeição para colaboradores de loja
Vale-refeição para colaboradores corporativos

Histórico:
Usuário: Como solicito férias?
Zi: 45 dias de antecedência...
Pergunta atual: e quanto recebo?
Reescrita:
Quanto recebo durante as férias?

Histórico:
(sem histórico)
Pergunta atual: qual a diferença do plano de saúde para loja e corporativo?
Reescrita:
Plano de saúde para colaboradores de loja
Plano de saúde para colaboradores corporativos

---

Histórico recente:
${recent}

Pergunta atual: ${current}

Reescrita:`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_CHAT}:generateContent?key=${geminiKey()}`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 200,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });
    if (!r.ok) return [current];
    const data = await r.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    const queries = raw
      .split(/\n+/)
      .map(line => line
        .replace(/^[\s\-•*0-9.)]+/, "")                       // tira bullets/números
        .replace(/^["'`]+|["'`]+$/g, "")                       // tira aspas
        .replace(/^(Reescrita|Pergunta reescrita|Query):\s*/i, "")
        .trim()
      )
      .filter(q => q.length >= 3 && q.length <= 300)
      .slice(0, 3);                                            // hard cap

    return queries.length > 0 ? queries : [current];
  } catch {
    return [current];
  }
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
  // Chunks já têm `## Section` no início, então não adiciono delimitadores
  // que possam confundir o modelo (ex: "--- (fonte: arquivo.md) ---").
  const kb = chunks.map(c => c.content).join("\n\n---\n\n");

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

# COMO USAR AS INFORMAÇÕES DO RH

As informações abaixo vêm em **múltiplos trechos** (separados por "---"). Cada
trecho cobre um tópico. Pra responder bem, você às vezes precisa **combinar
informação de trechos diferentes**.

NÃO mencione "base de conhecimento", "chunk", "trecho", "documento", "fonte"
ou qualquer termo técnico/interno na resposta — fale com o usuário como se
você simplesmente soubesse das coisas do RH.

Pergunta comparativa ("é igual para X e Y?", "qual a diferença?"):
→ procure informação sobre **X em um trecho** e sobre **Y em outro**.
   Se achar os dois (mesmo separados), **responda comparando** sem dizer
   "achei isso aqui e aquilo ali". Apenas compare.

Pergunta de follow-up ("qual o valor?", "e quando?"):
→ use o histórico da conversa pra entender o sujeito implícito.

Pergunta com cobertura parcial:
→ responda o que sabe + reconheça naturalmente o que falta.
   Exemplo: "Pra time corporativo é R$ X. Pra loja, varia conforme o
   sindicato da praça — não tenho um valor único pra te passar aqui."

# REGRA DE OURO

Responde direto e confiante quando as informações cobrem o assunto, mesmo
que em pedaços. Não fique reticente, não peça pra confirmar.

Só retorne EXATAMENTE este token (e nada mais) quando **NENHUM** trecho
toca o assunto da pergunta:
[NAO_ENCONTREI]

[NAO_ENCONTREI] NÃO é pra:
- Pergunta comparativa onde X está num trecho e Y em outro → AGREGUE
- Pergunta com informação parcial → RESPONDA com o que tem
- Pergunta onde há caso semelhante coberto → GENERALIZE razoavelmente

# INFORMAÇÕES DO RH

${kb}${trainedBlock}

# FORMATAÇÃO
- Sem cabeçalhos markdown (###)
- Pode usar **negrito** pra prazos, valores, nomes de portais
- Listas numeradas só com 3+ passos
- Encerre respostas longas com "Se precisar de mais detalhe, é só falar 👋" ou similar`;
}

// ---------------- Debug: introspects rewriter + retrieval sem chamar Gemini ----------------
async function handleDebugRetrieval(body) {
  const messages = Array.isArray(body.messages) ? body.messages : null;
  if (!messages || messages.length === 0) return err(400, "missing messages");
  const queries = await rewriteToQueries(messages);
  const embeddings = await Promise.all(queries.map(embed));
  const perQuery = 8;
  const chunkResults = await Promise.all(
    embeddings.map(e => matchChunks(e, perQuery))
  );
  const seen = new Set();
  const merged = [];
  const maxLen = Math.max(...chunkResults.map(s => s.length));
  for (let i = 0; i < maxLen && merged.length < 10; i++) {
    for (const set of chunkResults) {
      const c = set[i];
      if (c && !seen.has(c.id)) { seen.add(c.id); merged.push(c); }
      if (merged.length >= 10) break;
    }
  }
  return json({
    queries,
    perQueryResults: chunkResults.map(set =>
      set.map(c => ({ id: c.id, sim: Number(c.similarity.toFixed(3)), title: c.section_title, source: c.source_file }))
    ),
    finalChunks: merged.map(c => ({ id: c.id, sim: Number(c.similarity.toFixed(3)), title: c.section_title, source: c.source_file })),
  });
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

  // 1) Reescreve em 1+ consultas autônomas (multi-query pra perguntas comparativas).
  const queries = await rewriteToQueries(messages);

  // 2) Embed de cada query + insert interaction + fetch trained, tudo em paralelo
  const [embeddings, interactionId, trained] = await Promise.all([
    Promise.all(queries.map(embed)),
    insertInteraction(sessionId, currentQuestion),
    getActiveTrained(),
  ]);

  // 3) Retrieval por query → merge ponderado por rank (round-robin dos top-N).
  //    Round-robin garante que cada query contribui chunks de alta similaridade
  //    em vez de uma query monopolizar os melhores slots. Sem isso, queries
  //    semanticamente próximas devolvem chunks parecidos e cortam o lado oposto
  //    de uma pergunta comparativa.
  //    - 1 query: 8 chunks finais
  //    - 2+ queries: top-8 cada → round-robin → dedup → cap 10
  const perQuery = queries.length === 1 ? 8 : 8;
  const chunkResults = await Promise.all(
    embeddings.map(e => matchChunks(e, perQuery))
  );

  const seen = new Set();
  const merged = [];
  // Round-robin: pega o i-ésimo elemento de cada query em rodadas
  const maxLen = Math.max(...chunkResults.map(s => s.length));
  for (let i = 0; i < maxLen && merged.length < 10; i++) {
    for (const set of chunkResults) {
      const c = set[i];
      if (c && !seen.has(c.id)) { seen.add(c.id); merged.push(c); }
      if (merged.length >= 10) break;
    }
  }
  const chunks = merged;

  // 3) Monta contents pra Gemini
  const contents = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: String(m.content || "") }],
  }));

  const payload = {
    contents,
    systemInstruction: { parts: [{ text: buildSystemPrompt(chunks, trained) }] },
    generationConfig: {
      temperature: 0.2,                           // determinismo > criatividade
      maxOutputTokens: 1024,
      topP: 0.95,
      thinkingConfig: { thinkingBudget: 0 },      // desliga "thinking" — tarefa é só retrieval
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  };

  const upstreamUrl =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_CHAT}` +
    `:streamGenerateContent?alt=sse&key=${geminiKey()}`;

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
// Validação de credenciais. requiredRole = "admin" exige role admin;
// "user" aceita qualquer login válido.
function checkAuth(body, requiredRole = "admin") {
  const a = body.auth || {};
  const cred = CREDENTIALS[String(a.username || "").trim().toLowerCase()];
  if (!cred || cred.password !== a.password) return err(401, "credenciais inválidas");
  if (requiredRole === "admin" && cred.role !== "admin") return err(403, "acesso restrito ao admin");
  return null;
}

async function handleAdminListPending(body) {
  const denied = checkAuth(body, "admin"); if (denied) return denied;
  const r = await supabaseFetch(
    "/rest/v1/zi_interactions?escalated=eq.true&resolved_at=is.null" +
    "&order=created_at.desc&select=id,question,user_name,user_email,created_at",
  );
  if (!r.ok) return err(500, "list failed", { detail: await r.text() });
  return json(await r.json());
}

async function handleAdminListTrained(body) {
  const denied = checkAuth(body, "admin"); if (denied) return denied;
  const r = await supabaseFetch(
    "/rest/v1/zi_trained_answers?active=eq.true&order=created_at.desc" +
    "&select=id,question,answer,created_at,trained_by",
  );
  if (!r.ok) return err(500, "list failed", { detail: await r.text() });
  return json(await r.json());
}

async function handleAdminListFeedback(body) {
  const denied = checkAuth(body, "admin"); if (denied) return denied;
  const r = await supabaseFetch(
    "/rest/v1/zi_interactions?rating=not.is.null&order=rating_at.desc&limit=200" +
    "&select=id,question,answer,rating,rating_comment,rating_at",
  );
  if (!r.ok) return err(500, "list failed", { detail: await r.text() });
  return json(await r.json());
}

async function handleAdminSaveTrained(body) {
  const denied = checkAuth(body, "admin"); if (denied) return denied;
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
  const denied = checkAuth(body, "admin"); if (denied) return denied;
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
  const denied = checkAuth(body, "admin"); if (denied) return denied;
  const { interactionId } = body;
  if (!interactionId) return err(400, "missing interactionId");
  // marca como resolvida (descartada) — preserva o registro pra telemetria
  const r = await patchInteraction(interactionId, { resolved_at: new Date().toISOString() });
  if (!r.ok) return err(500, "delete pending failed", { detail: await r.text() });
  return json({ ok: true });
}

async function handleAdminClearFeedback(body) {
  const denied = checkAuth(body, "admin"); if (denied) return denied;
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

// ---------------- Admin: métricas (BI dashboard) ----------------
//
// Agregação server-side. Filtro opcional por session_ids (array).
// Considera 30 dias por padrão pras métricas temporais.
//
// Returns:
// {
//   filter: { sessions: [...] | null },
//   session_options: [{session_id, label, messages, email, last_at}],
//   kpis: {weekly_users, messages_today, messages_yesterday, autonomous_rate, like_ratio,
//          targets: {autonomous: 0.8, likes: 0.8}},
//   messages_by_day: [{date, count}],   // últimos 14 dias
//   responded_vs_escalated: {responded, escalated_resolved, escalated_pending},
//   feedback: {up, down, none},
//   top_escalations: [{id, question, user_email, created_at, resolved_at}],
//   sla: {avg_resolution_minutes, freed_hours_estimate, autonomous_count_30d},
//   total_interactions: N
// }

async function handleAdminMetrics(body) {
  const denied = checkAuth(body, "admin"); if (denied) return denied;

  const filterSessions = Array.isArray(body.filter?.sessions) ? body.filter.sessions : null;

  // Pega todas as interactions (volume baixo na fase de prototipagem)
  // Em produção, paginar ou usar queries SQL via RPC.
  const r = await supabaseFetch(
    "/rest/v1/zi_interactions?select=id,session_id,question,answer,rating,rating_at,escalated,resolved_at,user_name,user_email,created_at&order=created_at.desc&limit=5000",
  );
  if (!r.ok) return err(500, "list interactions failed", { detail: await r.text() });
  const allInteractions = await r.json();

  // ---------- Sessões disponíveis (pra o filtro) — sempre da população completa ----------
  const sessionMap = new Map();
  for (const i of allInteractions) {
    const sid = i.session_id || "anônima";
    const cur = sessionMap.get(sid) || { session_id: sid, messages: 0, email: null, name: null, last_at: null };
    cur.messages += 1;
    if (i.user_email && !cur.email) cur.email = i.user_email;
    if (i.user_name  && !cur.name)  cur.name  = i.user_name;
    if (!cur.last_at || (i.created_at && i.created_at > cur.last_at)) cur.last_at = i.created_at;
    sessionMap.set(sid, cur);
  }
  const sessionOptions = Array.from(sessionMap.values())
    .sort((a, b) => (b.last_at || "").localeCompare(a.last_at || ""))
    .map(s => {
      const idShort = String(s.session_id).slice(0, 8);
      const who = s.email || s.name || "anônima";
      return { ...s, label: `${who} · ${s.messages} msg${s.messages !== 1 ? "s" : ""} · ${idShort}` };
    });

  // ---------- Aplica filtro ----------
  const interactions = filterSessions && filterSessions.length > 0
    ? allInteractions.filter(i => filterSessions.includes(i.session_id))
    : allInteractions;

  // ---------- Helpers ----------
  const NAO_TOKEN = "[NAO_ENCONTREI]";
  const isAnswered = (i) => i.answer && i.answer.trim() && !i.answer.includes(NAO_TOKEN);
  const isEscalated = (i) => !!i.escalated;
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  const today = startOfDay(now);
  const yesterday = new Date(today.getTime() - dayMs);
  const weekAgo = new Date(today.getTime() - 7 * dayMs);
  const fourteenAgo = new Date(today.getTime() - 13 * dayMs);
  const thirtyAgo = new Date(today.getTime() - 30 * dayMs);

  const within = (i, from, to) => {
    const d = new Date(i.created_at);
    return d >= from && (!to || d < to);
  };

  // ---------- KPIs ----------
  const weekInteractions = interactions.filter(i => within(i, weekAgo, null));
  const weeklyUsers = new Set(weekInteractions.map(i => i.session_id || "anônima")).size;

  const messagesToday = interactions.filter(i => within(i, today, null)).length;
  const messagesYesterday = interactions.filter(i => within(i, yesterday, today)).length;

  const last30 = interactions.filter(i => within(i, thirtyAgo, null));
  const last30Total = last30.length;
  const last30Autonomous = last30.filter(isAnswered).length;
  const autonomousRate = last30Total > 0 ? last30Autonomous / last30Total : 0;

  const rated = interactions.filter(i => i.rating === 1 || i.rating === -1);
  const ups = rated.filter(i => i.rating === 1).length;
  const downs = rated.filter(i => i.rating === -1).length;
  const likeRatio = (ups + downs) > 0 ? ups / (ups + downs) : 0;

  // ---------- Messages by day (14 dias) ----------
  const messagesByDay = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today.getTime() - i * dayMs);
    const next = new Date(d.getTime() + dayMs);
    const count = interactions.filter(it => within(it, d, next)).length;
    messagesByDay.push({ date: d.toISOString().slice(0, 10), count });
  }

  // ---------- Respondidas vs escaladas (período 30 dias) ----------
  const responded = last30.filter(i => isAnswered(i) && !isEscalated(i)).length;
  const escalatedResolved = last30.filter(i => isEscalated(i) && i.resolved_at).length;
  const escalatedPending  = last30.filter(i => isEscalated(i) && !i.resolved_at).length;

  // ---------- Feedback (totais) ----------
  const noRating = interactions.filter(i => i.rating !== 1 && i.rating !== -1 && isAnswered(i)).length;
  const feedback = { up: ups, down: downs, none: noRating };

  // ---------- Top escalações (recentes — gaps na KB) ----------
  const topEscalations = interactions
    .filter(isEscalated)
    .slice(0, 10)
    .map(i => ({
      id: i.id,
      question: i.question,
      user_email: i.user_email || null,
      user_name: i.user_name || null,
      created_at: i.created_at,
      resolved_at: i.resolved_at || null,
    }));

  // ---------- SLA: tempo médio de resolução das escalações ----------
  const resolved = interactions.filter(i => isEscalated(i) && i.resolved_at);
  let avgResolutionMin = null;
  if (resolved.length > 0) {
    const totalMin = resolved.reduce((sum, i) => {
      const dt = (new Date(i.resolved_at) - new Date(i.created_at)) / 60000;
      return sum + Math.max(0, dt);
    }, 0);
    avgResolutionMin = Math.round(totalMin / resolved.length);
  }

  // ---------- Horas liberadas estimadas (30 dias × 5 min/ticket) ----------
  const MIN_PER_TICKET = 5;
  const freedHoursEstimate = +(last30Autonomous * MIN_PER_TICKET / 60).toFixed(1);

  return json({
    filter: { sessions: filterSessions },
    session_options: sessionOptions,
    kpis: {
      weekly_users: weeklyUsers,
      messages_today: messagesToday,
      messages_yesterday: messagesYesterday,
      autonomous_rate: +autonomousRate.toFixed(3),
      like_ratio: +likeRatio.toFixed(3),
      targets: { autonomous: 0.8, likes: 0.8 },
    },
    messages_by_day: messagesByDay,
    responded_vs_escalated: { responded, escalated_resolved: escalatedResolved, escalated_pending: escalatedPending },
    feedback,
    top_escalations: topEscalations,
    sla: {
      avg_resolution_minutes: avgResolutionMin,
      freed_hours_estimate: freedHoursEstimate,
      autonomous_count_30d: last30Autonomous,
      min_per_ticket: MIN_PER_TICKET,
    },
    total_interactions: interactions.length,
  });
}

// ---------------- Main handler ----------------
export default async (req) => {
  if (req.method === "GET") {
    const u = new URL(req.url);
    if (u.searchParams.get("debug") === "1") {
      return json({
        ok: true,
        env: {
          hasGeminiKey:   !!geminiKey(),
          hasSupabaseUrl: !!supabaseUrl(),
          hasSupabaseKey: !!supabaseKey(),
          geminiKeyVar:   env("GEMINI_ZI_API_KEY")      ? "GEMINI_ZI_API_KEY"      : (env("GEMINI_API_KEY")      ? "GEMINI_API_KEY"      : null),
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
  if (!geminiKey())   missingEnv.push("GEMINI_ZI_API_KEY (ou GEMINI_API_KEY)");
  if (!supabaseUrl()) missingEnv.push("SUPABASE_ZI_URL (ou SUPABASE_URL)");
  if (!supabaseKey()) missingEnv.push("SUPABASE_ZI_SECRET_KEY (ou SUPABASE_SECRET_KEY)");
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
      case "debug_retrieval":      return await handleDebugRetrieval(body);
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
      case "admin_metrics":        return await handleAdminMetrics(body);
      default:                     return err(400, `unknown action: ${action}`);
    }
  } catch (e) {
    return err(500, "internal error", { detail: String(e?.message || e) });
  }
};

export const config = {
  path: "/api/zi",
};
