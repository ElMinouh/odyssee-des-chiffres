-- Migration : crée la table conv_summary + backfill depuis messages (audit
-- performances AUD-07-010, 2026-09-26) — sans danger à rejouer sur la base
-- réelle : CREATE TABLE/INDEX IF NOT EXISTS et le backfill ignore les conv déjà
-- présentes (ON CONFLICT DO NOTHING).
--
-- À FAIRE AVANT de déployer la nouvelle version d'odyssee-chat.js (msgLatest()
-- lit cette table au lieu de scanner messages). Avant d'exécuter ce script :
-- sauvegarder la base (wrangler d1 export odyssee-chat-db --output backup-avant-migration.sql).

CREATE TABLE IF NOT EXISTS conv_summary (
  conv          TEXT PRIMARY KEY,
  participant_a TEXT NOT NULL,
  participant_b TEXT NOT NULL,
  last_id       INTEGER,
  last_ts       INTEGER
);
CREATE INDEX IF NOT EXISTS idx_convsum_a ON conv_summary (participant_a);
CREATE INDEX IF NOT EXISTS idx_convsum_b ON conv_summary (participant_b);

-- Backfill : une ligne de résumé par conversation déjà existante dans messages.
-- La clé conv est "id1|id2" (triés, voir convKey() côté Worker) — substr/instr
-- isolent les deux participants à partir du premier '|'.
INSERT INTO conv_summary (conv, participant_a, participant_b, last_id, last_ts)
SELECT
  conv,
  substr(conv, 1, instr(conv, '|') - 1)  AS participant_a,
  substr(conv, instr(conv, '|') + 1)     AS participant_b,
  MAX(id),
  MAX(ts)
FROM messages
GROUP BY conv
ON CONFLICT(conv) DO NOTHING;
