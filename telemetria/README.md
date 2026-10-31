# Receptor de partidas (Cloudflare Worker + D1)

O jogo (`scripts/autoload/telemetria.gd`) envia cada partida para `POST /v1/partida`.
O banco `pixel-defenders-partidas` (D1) já existe com a tabela `partidas` (ver `schema.sql`).

## Publicar (uma vez; de novo só se este código mudar)

```
cd telemetria
npx wrangler login        # só se ainda não estiver logado
npx wrangler deploy
```

O deploy mostra o endereço (`https://pixel-defenders-dados.<sua-conta>.workers.dev`). Ele vai em
`data/telemetria.json` do jogo (`"url"`).

## Lançamento
- Trocar `"canal"` para `"loja"` em `data/telemetria.json` (separa jogadores reais dos testes).
- Apps nativos não mandam `Origin` e já são aceitos. Se o jogo web for para outro domínio, incluir em `ORIGENS`.
- Antes da loja: política de privacidade mencionando o envio de dados de jogo anônimos e opção de desligar.
