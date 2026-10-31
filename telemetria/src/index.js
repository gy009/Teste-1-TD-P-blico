// Receptor dos registros de partida do Pixel Defenders.
// POST /v1/partida  { jogador_id, apelido, canal, plataforma, registro: {...} }  ->  201 {ok:true}
// Não existe rota de leitura: os dados são lidos direto do banco D1 (painel da Cloudflare / Claude).

// Sites que podem enviar (navegador). Apps nativos (Android/iOS) não mandam Origin e são aceitos.
const ORIGENS = ["https://gy009.github.io"];
const MAX_BYTES = 300_000;

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": ORIGENS.includes(origin) ? origin : ORIGENS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

const json = (obj, status, headers) =>
  new Response(JSON.stringify(obj), { status, headers: { ...headers, "Content-Type": "application/json" } });

const int = (v, lo, hi) => (Number.isInteger(v) && v >= lo && v <= hi ? v : null);
const str = (v, max) => (typeof v === "string" ? v.slice(0, max) : null);

export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const h = cors(origin);
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
    if (req.method === "GET" && url.pathname === "/") return new Response("pixel-defenders-dados ok", { headers: h });
    if (req.method !== "POST" || url.pathname !== "/v1/partida") return json({ erro: "rota" }, 404, h);
    if (origin && !ORIGENS.includes(origin)) return json({ erro: "origem" }, 403, h);

    const txt = await req.text();
    if (txt.length > MAX_BYTES) return json({ erro: "grande demais" }, 413, h);
    let p;
    try { p = JSON.parse(txt); } catch { return json({ erro: "json" }, 400, h); }
    const r = p && typeof p.registro === "object" && p.registro ? p.registro : null;
    const nivel = r ? int(r.nivel, 1, 500) : null;
    if (!r || nivel === null) return json({ erro: "registro" }, 400, h);

    const canal = p.canal === "loja" ? "loja" : "teste";
    await env.DB.prepare(
      `INSERT INTO partidas (canal, versao, jogador_id, apelido, plataforma, nivel, dificuldade, vitoria, estrelas,
         coracoes_perdidos, coracoes_total, ondas_iniciadas, ondas_total, tempo_s, dados)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)`
    ).bind(
      canal, str(r.versao, 60), str(p.jogador_id, 40), str(p.apelido, 24), str(p.plataforma, 40),
      nivel, str(r.dificuldade, 20), r.vitoria === true ? 1 : 0, int(r.estrelas, 0, 3),
      int(r.coracoes_perdidos, 0, 10000), int(r.coracoes_total, 0, 10000),
      int(r.ondas_iniciadas, 0, 1000), int(r.ondas_total, 0, 1000),
      typeof r.tempo_s === "number" ? r.tempo_s : null, txt
    ).run();
    return json({ ok: true }, 201, h);
  },
};
