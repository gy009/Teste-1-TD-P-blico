-- Já aplicado no banco "pixel-defenders-partidas". Guardado aqui para referência.
CREATE TABLE IF NOT EXISTS partidas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recebido_em TEXT NOT NULL DEFAULT (datetime('now')),
  canal TEXT NOT NULL DEFAULT 'teste',   -- 'teste' (versões de teste) | 'loja' (jogo lançado)
  versao TEXT, jogador_id TEXT, apelido TEXT, plataforma TEXT,
  nivel INTEGER, dificuldade TEXT, vitoria INTEGER, estrelas INTEGER,
  coracoes_perdidos INTEGER, coracoes_total INTEGER, ondas_iniciadas INTEGER, ondas_total INTEGER,
  tempo_s REAL,
  dados TEXT NOT NULL                    -- registro completo da partida (JSON), igual ao arquivo registro_nivelXX
);
CREATE INDEX IF NOT EXISTS idx_partidas_nivel ON partidas(nivel, versao);
CREATE INDEX IF NOT EXISTS idx_partidas_jogador ON partidas(jogador_id);
CREATE INDEX IF NOT EXISTS idx_partidas_quando ON partidas(recebido_em);
