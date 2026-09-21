// AUD-02-040 (audit fonctionnel 2026-09-21) — chatSendCurrent() (17-messaging.js)
// vidait le champ de saisie AVANT l'envoi, y compris quand le message était
// bloqué par le filtre : l'enfant devait tout retaper de mémoire, sans savoir
// quel mot avait posé problème (toast générique). _chatSend() indique
// désormais le mot bloqué et signale (valeur de retour `true`) à
// chatSendCurrent() de ne PAS vider le champ.
//
// Note sur le harnais : le chemin réseau (chatMsgSend -> _chatApi -> fetch)
// utilise `new AbortController()` hors d'un try/catch, non stubbé dans ce
// sandbox minimal (même limite déjà documentée pour d'autres fonctions
// réseau) — seul le chemin BLOQUÉ (qui retourne avant tout appel réseau) est
// donc testable ici bout-en-bout ; c'est justement celui que corrige ce lot.
import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '17-messaging.js'];

function setupConv(api) {
  api.setMsgConv({ id: 'AMI1', name: 'Ami', avatar: null, lastId: 0 });
}

describe('_chatFindBlockedWord() — identifie le mot bloqué (pas juste un booléen)', () => {
  it('renvoie le mot interdit effectivement trouvé', () => {
    const api = loadGame(FILES);
    expect(api._chatFindBlockedWord('sale con va')).toBe('con');
  });
  it('renvoie null si rien n\'est bloqué', () => {
    const api = loadGame(FILES);
    expect(api._chatFindBlockedWord('salut comment ça va')).toBeNull();
  });
});

describe('_chatSend() — un message bloqué renvoie true (signal "ne pas vider le champ")', () => {
  it('renvoie true et n\'appelle pas le réseau pour un message bloqué', async () => {
    const api = loadGame(FILES);
    setupConv(api);
    const result = await api._chatSend('espèce de con');
    expect(result).toBe(true);
  });

  it('le toast mentionne le mot bloqué précis', async () => {
    const api = loadGame(FILES);
    setupConv(api);
    await api._chatSend('sale con');
    expect(api._domEl('toast').innerText).toContain('con');
  });

  it('journalise un signalement pour le parent (chatFlags)', async () => {
    const api = loadGame(FILES);
    setupConv(api);
    api.setP({ name: 'Test', chatFlags: [] });
    await api._chatSend('sale con');
    expect(api.getP().chatFlags.length).toBe(1);
    expect(api.getP().chatFlags[0].kind).toBe('blocked_word');
  });
});

describe('chatSendCurrent() — ne vide plus le champ de saisie quand le message est bloqué', () => {
  it('le texte reste dans le champ après un blocage', async () => {
    const api = loadGame(FILES);
    setupConv(api);
    const inp = api._domEl('msg-input');
    inp.value = 'sale con va';
    await api.chatSendCurrent();
    expect(inp.value).toBe('sale con va'); // pas effacé
    expect(inp.disabled).toBe(false); // ré-activé pour permettre la correction
  });
});

describe('AUD-02-041 — source : route et fonctions d\'annulation de demande d\'ami présentes', () => {
  it('chatFriendCancel() est bien câblée sur /friend/cancel', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '17-messaging.js'), 'utf8');
    expect(src).toContain("chatFriendCancel(prof, to){ return _chatApi('/friend/cancel'");
    expect(src).toContain('async function chatCancelContact(to)');
    expect(src).toContain("data.outgoing"); // demandes envoyées désormais lues et affichées
  });
  it('le Worker expose bien /friend/cancel', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'worker', 'odyssee-chat.js'), 'utf8');
    expect(src).toContain("case '/friend/cancel':");
    expect(src).toContain('async function friendCancel(env, b, CORS)');
  });
});
