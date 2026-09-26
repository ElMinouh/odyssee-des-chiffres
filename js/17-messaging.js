// 17-messaging.js — L'Odyssée des Chiffres
// Messagerie fermée (contacts validés des deux côtés), branchée sur le Worker odyssee-chat.
// IMPORTANT : l'identité + l'état d'activation sont stockés dans une zone SÉPARÉE
// (localStorage 'chatProfiles'), indépendante du profil de jeu — donc insensible à la
// synchronisation cloud (qui réécrit user_<nom>).
'use strict';

const CHAT_API = 'https://odyssee-chat.air7841.workers.dev';

// ═══════════════════════════════════════════════════════
// STOCKAGE SÉPARÉ (identité, activation, non-lus) par nom de profil
// ═══════════════════════════════════════════════════════
function _chatStore(){ try{ return JSON.parse(localStorage.getItem('chatProfiles') || '{}'); }catch(e){ return {}; } }
function _chatSaveStore(s){ try{ localStorage.setItem('chatProfiles', JSON.stringify(s)); }catch(e){} }
function _chatLoad(name){
 const s = _chatStore(); const e = s[name] || {};
 return { name, chatId:e.id||null, chatSecret:e.secret||null, chatEnabled:!!e.enabled, chatRegistered:!!e.registered, chatSeen:e.seen||{}, ts:e.ts||0 };
}
function _chatPersist(prof){
 if(!prof || !prof.name) return;
 const s = _chatStore();
 s[prof.name] = { id:prof.chatId||null, secret:prof.chatSecret||null, enabled:!!prof.chatEnabled, registered:!!prof.chatRegistered, seen:prof.chatSeen||{}, ts:prof.ts||0 };
 _chatSaveStore(s);
}

// ═══════════════════════════════════════════════════════
// IDENTITÉ (code ami public + secret privé)
// ═══════════════════════════════════════════════════════
const _CHAT_IDCHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans 0/O/I/1
function _chatRand(n, chars){
 chars = chars || _CHAT_IDCHARS;
 if(typeof crypto !== 'undefined' && crypto.getRandomValues){
  const a = new Uint8Array(n); crypto.getRandomValues(a);
  let s=''; for(const b of a) s += chars[b % chars.length]; return s;
 }
 let s=''; for(let i=0;i<n;i++) s += chars[Math.floor(Math.random()*chars.length)]; return s;
}
function _chatGenId(){ return _chatRand(4) + '-' + _chatRand(4); }            // ex: 7K2P-9QXM
function _chatGenSecret(){ return _chatRand(28, 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'); }
function ensureChatIdentity(prof){
 if(!prof) return prof;
 let changed=false;
 if(!prof.chatId){ prof.chatId = _chatGenId(); changed=true; }
 if(!prof.chatSecret){ prof.chatSecret = _chatGenSecret(); changed=true; }
 if(!prof.chatSeen){ prof.chatSeen = {}; }
 if(changed) _chatPersist(prof);
 return prof;
}

// ═══════════════════════════════════════════════════════
// CLIENT API (Worker)
// ═══════════════════════════════════════════════════════
// Audit performances #7 : timeout explicite (AbortController), sur le même
// modèle que _cloudFetch (12-cloud.js) — sans lui, un appel sur un réseau
// dégradé (pas coupé, juste lent) peut rester en attente très longtemps, et
// avec un polling toutes les 4 à 25s, plusieurs appels lents peuvent
// s'empiler avant que le premier ne réponde.
const CHAT_REQUEST_TIMEOUT_MS = 5000;
async function _chatApi(path, body){
 const ctrl = new AbortController();
 const tid = setTimeout(() => ctrl.abort(), CHAT_REQUEST_TIMEOUT_MS);
 try{
  const r = await fetch(CHAT_API + path, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body), signal:ctrl.signal });
  return await r.json();
 }catch(e){ return { error:'network' }; }
 finally{ clearTimeout(tid); }
}
function _chatAuth(prof){ return { id: prof.chatId, secret: prof.chatSecret }; }
function _chatProfileAvatar(name){ try{ const gp=(typeof P!=='undefined' && P && P.name===name) ? P : (typeof _readProfile==='function' ? _readProfile(name) : null); return (gp && gp.avatar) || '\uD83E\uDDD9'; }catch(e){ return '\uD83E\uDDD9'; } }
async function chatRegister(prof){ ensureChatIdentity(prof); return _chatApi('/register', { id:prof.chatId, secret:prof.chatSecret, name:prof.name, avatar:_chatProfileAvatar(prof.name) }); }
async function chatFriendRequest(prof, code){ return _chatApi('/friend/request', Object.assign(_chatAuth(prof), { code })); }
async function chatFriendList(prof){ return _chatApi('/friend/list', _chatAuth(prof)); }
async function chatFriendAccept(prof, from){ return _chatApi('/friend/accept', Object.assign(_chatAuth(prof), { from })); }
async function chatFriendDecline(prof, from){ return _chatApi('/friend/decline', Object.assign(_chatAuth(prof), { from })); }
// AUD-02-041 (audit fonctionnel 2026-09-21) : annule une demande d'ami ENVOYÉE
// par ce profil, tant qu'elle est encore en attente — symétrique de
// chatFriendDecline() ci-dessus (côté destinataire).
async function chatFriendCancel(prof, to){ return _chatApi('/friend/cancel', Object.assign(_chatAuth(prof), { to })); }
async function chatFriendRemove(prof, other){ return _chatApi('/friend/remove', Object.assign(_chatAuth(prof), { other })); }
// AUD-06-003 (audit sécurité 2026-09-25) : supprime le compte de messagerie
// côté serveur (users/messages/contacts/blocks) — appelée par
// _pmConfirmDelete() (09-parent.js) AVANT la purge locale (_purgeChildData()
// efface l'entrée 'chatProfiles' correspondante, donc l'identité ne serait
// plus lisible après). Best-effort : ne bloque jamais la suppression locale.
async function _chatDeleteAccountForProfile(name){
 const p = _chatLoad(name);
 if(!p.chatId || !p.chatSecret) return { ok:true, skipped:true };
 return _chatApi('/account/delete', _chatAuth(p));
}
async function chatFriendBlock(prof, other){ return _chatApi('/friend/block', Object.assign(_chatAuth(prof), { other })); }
async function chatFriendUnblock(prof, other){ return _chatApi('/friend/unblock', Object.assign(_chatAuth(prof), { other })); }
// v2 (audit performances AUD-07-006) : `tmpId` optionnel, transmis au Worker
// pour qu'il puisse détecter un renvoi automatique d'un message déjà inséré
// avec succès (réponse perdue après un timeout client) — sans clé, le Worker
// ne peut pas distinguer un vrai nouveau message d'un doublon de retry.
async function chatMsgSend(prof, to, txt, tmpId){ return _chatApi('/msg/send', Object.assign(_chatAuth(prof), { to, body:txt, tmpId })); }
async function chatMsgFetch(prof, withId, since){ return _chatApi('/msg/fetch', Object.assign(_chatAuth(prof), { with:withId, since:since||0 })); }
async function chatMsgLatest(prof){ return _chatApi('/msg/latest', _chatAuth(prof)); }
// #16 (accusé de lecture) : signale au Worker que j'ai lu la conversation
// avec `withId` jusqu'à l'id `upto`. Fire-and-forget côté appelant.
async function chatMsgMarkRead(prof, withId, upto){ return _chatApi('/msg/markread', Object.assign(_chatAuth(prof), { with:withId, upto })); }

// ═══════════════════════════════════════════════════════
// ACTIVATION (parental) — désactivée par défaut
// ═══════════════════════════════════════════════════════
function chatIsEnabledByName(name){ return name ? _chatLoad(name).chatEnabled : false; }

async function chatEnableForProfile(name){
 if(!name) return { error:'no_profile' };
 const prof = _chatLoad(name);
 ensureChatIdentity(prof);
 prof.chatEnabled = true; prof.ts = Date.now(); _chatPersist(prof);     // état LOCAL d'abord (jamais annulé sur échec réseau)
 let res = await chatRegister(prof);
 if(res && res.error === 'taken'){ prof.chatId = _chatGenId(); _chatPersist(prof); res = await chatRegister(prof); }
 if(res && res.ok){ prof.chatRegistered = true; _chatPersist(prof); }
 // AUD-02-044 (audit fonctionnel 2026-09-21) : signale la (ré)activation au
 // serveur (colonne users.disabled), symétrique de chatDisableForProfile()
 // ci-dessous — sans quoi les amis de ce profil ne verraient jamais la
 // réactivation et le considéreraient "injoignable" à tort.
 if(prof.chatId && prof.chatSecret){ try{ await _chatApi('/account/setenabled', Object.assign(_chatAuth(prof), { enabled:true })); }catch(e){} }
 if(typeof scheduleCloudSync==='function'){ try{ scheduleCloudSync(); }catch(e){} } // fait voyager l'identité via le cloud
 return res || { error:'network' };
}
// AUD-02-047 (audit fonctionnel 2026-09-21) : compteur d'activité sociale
// pour le résumé hebdomadaire parent (09-parent.js, renderWeeklySummary()) —
// nombre d'amis, nouveaux amis cette semaine, demandes en attente, volume de
// messages échangés cette semaine. Renvoie null si la messagerie n'est pas
// active pour ce profil (rien à afficher) ou en cas d'échec réseau.
async function _weeklySocialStats(name, weekStartMs){
 const prof=_chatLoad(name);
 if(!prof.chatEnabled || !prof.chatId) return null;
 let fl=null, ml=null;
 try{ fl=await chatFriendList(prof); }catch(e){}
 if(!fl || !fl.ok) return null;
 try{ ml=await _chatApi('/msg/latest', Object.assign(_chatAuth(prof), { since: weekStartMs })); }catch(e){}
 const contacts=fl.contacts||[];
 return {
  friendsTotal: contacts.length,
  newFriends: contacts.filter(c => c.created && c.created>=weekStartMs).length,
  incoming: (fl.incoming||[]).length,
  msgCount: (ml && ml.ok && typeof ml.weekCount==='number') ? ml.weekCount : null,
 };
}
// AUD-02-047 : remplit #wreport-social (09-parent.js, renderWeeklySummary())
// une fois les statistiques réseau disponibles — séparée de
// _weeklySocialStats() pour rester testable indépendamment du DOM.
async function _fillWeeklySocialStats(name, weekStartMs){
 const box=document.getElementById('wreport-social'); if(!box) return;
 const stats=await _weeklySocialStats(name, weekStartMs);
 if(!stats){ box.innerHTML=''; return; }
 const parts=[`👥 ${stats.friendsTotal} ami${stats.friendsTotal>1?'s':''}`];
 if(stats.newFriends>0) parts.push(`✨ ${stats.newFriends} nouvel${stats.newFriends>1?'s':''} ami${stats.newFriends>1?'s':''} cette semaine`);
 if(stats.incoming>0) parts.push(`📨 ${stats.incoming} demande${stats.incoming>1?'s':''} en attente`);
 if(typeof stats.msgCount==='number') parts.push(`💬 ${stats.msgCount} message${stats.msgCount>1?'s':''} échangé${stats.msgCount>1?'s':''} cette semaine`);
 box.innerHTML=parts.join(' · ');
}
async function chatDisableForProfile(name){
 if(!name) return;
 const prof = _chatLoad(name); prof.chatEnabled = false; prof.ts = Date.now(); _chatPersist(prof);
 if(typeof chatRefreshBadges==='function') chatRefreshBadges();
 // AUD-02-044 : jusqu'ici purement local — jamais communiqué au serveur, un
 // ami restait "accepted" indéfiniment sans savoir que ses messages ne
 // seraient jamais lus. Fire-and-forget : l'état local (déjà appliqué
 // ci-dessus) ne dépend jamais du succès de cet appel réseau.
 if(prof.chatId && prof.chatSecret){ try{ await _chatApi('/account/setenabled', Object.assign(_chatAuth(prof), { enabled:false })); }catch(e){} }
}

// ═══════════════════════════════════════════════════════
// NON LUS
// ═══════════════════════════════════════════════════════
function _chatSeen(prof){ return prof.chatSeen || (prof.chatSeen = {}); }
function _chatMarkSeen(prof, contactId, msgId){ if(!prof||!contactId) return; const s=_chatSeen(prof); if((msgId||0) > (s[contactId]||0)){ s[contactId]=msgId; _chatPersist(prof); } }
function chatUnreadCount(prof, latestMap){
 if(!prof || !latestMap) return 0;
 const seen = _chatSeen(prof); let n=0;
 for(const cid in latestMap){ if((latestMap[cid]||0) > (seen[cid]||0)) n++; }
 return n;
}

// ═══════════════════════════════════════════════════════
// ÉTAT UI + OUVERTURE
// ═══════════════════════════════════════════════════════
// AUD-06 ménage lint : _msgProf/_msgReadOnly restent en `var` volontairement —
// tests/helpers/loadGame.js (setMsgProf()) les réassigne depuis l'extérieur du
// bac à sable vm via `globalThis._msgProf = ...` ; ça ne fonctionne qu'avec
// `var` (qui crée une propriété sur l'objet global du contexte vm), pas avec
// `let`/`const` (liaison lexicale séparée, invisible à cette écriture externe
// — testé, ça casse silencieusement 6 tests avec `let`).
var _msgProf = null;       // objet messagerie (identité + état) du profil consulté
var _msgReadOnly = false;  // mode lecture seule (visualisation parentale)
let _msgConv = null;       // {id, name, lastId}
let _msgConvTimer = null;
let _msgBadgePoll = null;

function _e(s){ return (typeof esc==='function') ? esc(s) : String(s==null?'':s); }
// _jsAttr est désormais mutualisée dans 01-core.js (v11.1.10) — plus de définition locale ici.
function _msgEl(){ return document.getElementById('msg-overlay'); }
function _curName(){ return (typeof P!=='undefined' && P) ? P.name : null; }

async function openMessaging(readOnlyName){
 const name = readOnlyName || _curName();
 const ro = !!readOnlyName;
 if(!name){ if(typeof toast==='function') toast('Aucun profil.',2000); return; }
 if(!ro){ try{ await chatSyncIdentityFromCloud(name); }catch(e){} } // adopte l'identité du cloud si elle existe
 const prof = _chatLoad(name);
 if(!prof.chatEnabled && !ro){ if(typeof toast==='function') toast('La messagerie est désactivée. Un parent peut l\u2019activer dans Vue Parent → Options.',3200); return; }
 ensureChatIdentity(prof);
 _msgProf = prof; _msgReadOnly = ro; _msgConv = null;
 const ov = _msgEl(); if(ov) ov.classList.remove('hidden');
 if(typeof _msgFabUpdate==='function') _msgFabUpdate();
 if(!ro){
  if(!prof.chatRegistered){ const r = await chatRegister(prof); if(r && r.ok){ prof.chatRegistered = true; _chatPersist(prof); } }
  else { try{ chatRegister(prof).catch(function(){}); }catch(e){} } // rafraîchit prénom+avatar en arrière-plan
 }
 renderContactsScreen();
 if(typeof trapFocus==='function' && ov) ov._releaseTrap=trapFocus(ov);
}
function closeMessaging(){
 _stopConvPoll(); _msgConv = null;
 const ov = _msgEl();
 if(ov){
  if(ov._releaseTrap){ov._releaseTrap();delete ov._releaseTrap;}
  ov.classList.add('hidden');
 }
 if(typeof chatRefreshBadges==='function') chatRefreshBadges();
}

// ═══════════════════════════════════════════════════════
// ÉCRAN CONTACTS
// ═══════════════════════════════════════════════════════
async function renderContactsScreen(){
 _stopConvPoll();
 const body = document.getElementById('msg-body'); if(!body) return;
 const prof = _msgProf;
 const myCode = prof.chatId || '(—)';
 body.innerHTML = '<p style="text-align:center;color:#bdc3c7;font-size:.9em;margin:20px;">Chargement\u2026</p>';
 const data = await chatFriendList(prof);
 if(!data || data.error){
  body.innerHTML = '<p style="text-align:center;color:#e74c3c;font-size:.9em;margin:20px;">Connexion impossible. Vérifie la connexion internet.</p>'
   + '<div style="text-align:center;"><button onclick="renderContactsScreen()" style="font-size:.9em;">Réessayer</button></div>';
  return;
 }
 try{ (data.contacts||[]).forEach(c=>{ _chatContactCache[c.id]={name:c.name,avatar:c.avatar}; }); }catch(e){}
 let html = '';
 html += '<div style="background:rgba(52,152,219,.1);border:1px solid rgba(52,152,219,.35);border-radius:10px;padding:10px 12px;margin-bottom:12px;">'
  + '<p style="margin:0 0 2px;font-size:.72em;color:#bdc3c7;">Ton code ami (à donner pour être ajouté) :</p>'
  + '<div style="display:flex;align-items:center;gap:8px;"><span style="font-family:monospace;font-size:1em;font-weight:700;letter-spacing:1px;color:#5dade2;">'+_e(myCode)+'</span>'
  + '<button onclick="chatCopyCode()" style="font-size:.72em;padding:4px 8px;">📋 Copier</button></div></div>';

 // AUD-02-047 (audit fonctionnel 2026-09-21) : jusqu'ici, les demandes
 // reçues/envoyées/refusées restaient invisibles en mode lecture seule
 // (visualisation parentale, "Voir →" du résumé hebdo) — un parent devait
 // savoir se rendre dans un panneau Options distinct pour seulement les
 // VOIR. Les sections restent désormais affichées en lecture seule ; seuls
 // les boutons d'action (Accepter/Refuser/Annuler) restent réservés à
 // l'enfant, qui reste seul décisionnaire de ses contacts.
 // AUD-03-045 (audit UX 2026-09-25) : ces sections s'affichaient AVANT
 // "Mes amis" — dès qu'une demande était en attente, l'usage le plus
 // fréquent (ouvrir une conversation avec un ami existant) était repoussé
 // plus bas. Construites à part, insérées APRÈS la liste d'amis ci-dessous.
 let htmlRequests = '';
 const inc = data.incoming || [];
 if(inc.length){
  htmlRequests += '<p style="font-size:.8em;font-weight:700;color:#f1c40f;margin:6px 0;">📨 Demandes reçues</p>';
  inc.forEach(c => {
   const cid=_e(c.id), cn=_e(c.name||c.id), av=_e(c.avatar||'\uD83E\uDDD9');
   htmlRequests += '<div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.06);border-radius:10px;padding:8px 10px;margin:4px 0;">'
    + '<span style="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">'+av+'</span>'
    + '<span style="flex:1;font-size:.9em;">'+cn+'</span>'
    + (_msgReadOnly ? '' :
       '<button onclick="chatAcceptContact(\''+cid+'\')" style="background:#27ae60;font-size:.72em;padding:5px 10px;">✅ Accepter</button>'
       + '<button onclick="chatDeclineContact(\''+cid+'\')" style="background:#7f8c8d;font-size:.72em;padding:5px 10px;">✕</button>')
    + '</div>';
  });
 }

 // AUD-02-041 (audit fonctionnel 2026-09-21) : friendList() renvoie déjà
 // `outgoing` (demandes envoyées, encore en attente) depuis longtemps côté
 // Worker, mais rien côté client ne l'affichait — une demande envoyée
 // devenait invisible et impossible à annuler en cas d'erreur (mauvais code).
 const outg = data.outgoing || [];
 if(outg.length){
  htmlRequests += '<p style="font-size:.8em;font-weight:700;color:#bdc3c7;margin:6px 0;">📤 Demandes envoyées</p>';
  outg.forEach(c => {
   const cn=_e(c.name||c.id), av=_e(c.avatar||'🧙'), cidArg=_jsAttr(c.id);
   htmlRequests += '<div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.04);border-radius:10px;padding:8px 10px;margin:4px 0;">'
    + '<span style="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">'+av+'</span>'
    + '<span style="flex:1;font-size:.9em;color:#bdc3c7;">'+cn+' <span style="font-size:.72em;">(en attente…)</span></span>'
    + (_msgReadOnly ? '' : '<button onclick="chatCancelContact(\''+cidArg+'\')" style="background:#7f8c8d;font-size:.72em;padding:5px 10px;">Annuler</button>')
    + '</div>';
  });
 }

 // AUD-02-042 (audit fonctionnel 2026-09-21) : demandes envoyées puis
 // refusées — distinctes des demandes "en attente" ci-dessus, pour que
 // l'enfant comprenne qu'une réponse a bien eu lieu (au lieu d'un silence
 // indiscernable d'une absence de réponse). Bouton "OK" réutilise
 // chatCancelContact() (la route serveur accepte désormais aussi ce cas).
 const declined = data.declined || [];
 if(declined.length){
  htmlRequests += '<p style="font-size:.8em;font-weight:700;color:#e67e22;margin:6px 0;">📭 Demandes refusées</p>';
  declined.forEach(c => {
   const cn=_e(c.name||c.id), av=_e(c.avatar||'🧙'), cidArg=_jsAttr(c.id);
   htmlRequests += '<div style="display:flex;align-items:center;gap:8px;background:rgba(230,126,34,.08);border-radius:10px;padding:8px 10px;margin:4px 0;">'
    + '<span style="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">'+av+'</span>'
    + '<span style="flex:1;font-size:.9em;color:#bdc3c7;">'+cn+' <span style="font-size:.72em;">(a refusé ta demande)</span></span>'
    + (_msgReadOnly ? '' : '<button onclick="chatCancelContact(\''+cidArg+'\')" style="background:#7f8c8d;font-size:.72em;padding:5px 10px;">OK</button>')
    + '</div>';
  });
 }

 let latest = {};
 try{ const l = await chatMsgLatest(prof); if(l && l.latest) latest = l.latest; }catch(e){}
 const seen = _chatSeen(prof);

 const contacts = data.contacts || [];
 html += '<p style="font-size:.8em;font-weight:700;color:#bdc3c7;margin:12px 0 6px;">👥 Mes amis</p>';
 if(!contacts.length){
  html += '<div style="text-align:center;border:2px dashed rgba(255,255,255,.18);border-radius:14px;padding:16px;margin:6px 0;">'
   + '<div style="font-size:30px;">🤝</div>'
   + '<p style="font-size:.8em;color:#bdc3c7;margin:6px 0 0;">Pas encore d\u2019amis ?<br>Partage ton code ami pour vous ajouter !</p></div>';
 } else {
  contacts.forEach(c => {
   const cid=_e(c.id), cn=_e(c.name||c.id), av=_e(c.avatar||'\uD83E\uDDD9');
   const nameArg=_jsAttr(c.name||c.id), avArg=_jsAttr(c.avatar||'');
   const unread = (latest[c.id]||0) > (seen[c.id]||0);
   // AUD-02-044 (audit fonctionnel 2026-09-21) : c.disabled (users.disabled
   // côté serveur) signale que cet ami a suspendu durablement sa messagerie
   // — sans ce badge, rien ne distingue "hors-ligne temporairement" de
   // "injoignable pour de bon", et l'enfant peut continuer d'écrire dans le
   // vide indéfiniment sans jamais le savoir.
   html += '<div style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.06);border-radius:12px;padding:10px 12px;margin:5px 0;cursor:pointer;" role="button" tabindex="0" onclick="chatOpenConv(\''+cid+'\',\''+nameArg+'\',\''+avArg+'\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();chatOpenConv(\''+cid+'\',\''+nameArg+'\',\''+avArg+'\');}">'
    + '<span style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:21px;flex-shrink:0;">'+av+'</span>'
    + '<span style="flex:1;font-size:.9em;font-weight:600;">'+cn+(c.disabled?' <span style="font-size:.7em;font-weight:400;color:#e67e22;">(injoignable)</span>':'')+'</span>'
    + (unread ? '<span style="background:#e74c3c;border-radius:50%;width:11px;height:11px;display:inline-block;"></span>' : '')
    + '<button onclick="event.stopPropagation();chatRemoveContact(\''+cid+'\',\''+nameArg+'\')" style="background:transparent;border:none;color:#7f8c8d;font-size:1em;cursor:pointer;" title="Retirer">\u2715</button>'
    + '<span style="color:#7f8c8d;">\u203A</span></div>';
  });
 }

 // AUD-03-045 : demandes re\u00E7ues/envoy\u00E9es/refus\u00E9es affich\u00E9es ICI, apr\u00E8s la
 // liste d'amis (et non plus avant), pour que l'action la plus fr\u00E9quente
 // reste la plus accessible.
 if(htmlRequests){
  html += '<div style="margin-top:14px;border-top:1px solid rgba(255,255,255,.1);padding-top:10px;">' + htmlRequests + '</div>';
 }

 if(!_msgReadOnly){
  html += '<div style="margin-top:14px;border-top:1px solid rgba(255,255,255,.1);padding-top:12px;">'
   + '<p style="font-size:.8em;font-weight:700;color:#2ecc71;margin:0 0 6px;">➕ Ajouter un ami</p>'
   + '<input type="text" id="msg-addcode" placeholder="Code ami (ex: 7K2P-9QXM)" style="width:70%;text-transform:uppercase;font-family:monospace;letter-spacing:1px;">'
   + '<button onclick="chatAddFriend()" style="background:#27ae60;font-size:.8em;margin-left:4px;">Envoyer</button>'
   + '<p id="msg-add-msg" style="font-size:.72em;margin-top:6px;"></p></div>';
 } else {
  html += '<p style="font-size:.72em;color:#7f8c8d;text-align:center;margin-top:14px;">👁 Visualisation parentale (lecture seule)</p>';
 }
 body.innerHTML = html;
}

function chatCopyCode(){
 const code = _msgProf && _msgProf.chatId; if(!code) return;
 try{ navigator.clipboard.writeText(code); if(typeof toast==='function') toast('📋 Code copié !',1800); }
 catch(e){ if(typeof toast==='function') toast(code,3000); }
}
async function chatAddFriend(){
 const inp = document.getElementById('msg-addcode'); const msg = document.getElementById('msg-add-msg');
 if(!inp) return; const code = inp.value.trim().toUpperCase();
 if(!code){ if(msg){msg.innerText='Entre un code ami.';msg.style.color='#e74c3c';} return; }
 if(msg){ msg.innerText='Envoi\u2026'; msg.style.color='#bdc3c7'; }
 const res = await chatFriendRequest(_msgProf, code);
 if(res && res.ok){
  if(res.status==='accepted'){ if(msg){msg.innerText='✅ Vous êtes déjà amis !';msg.style.color='#2ecc71';} }
  else { if(msg){msg.innerText='✅ Demande envoyée ! Ton ami devra l\u2019accepter de son côté.';msg.style.color='#2ecc71';} }
  inp.value=''; setTimeout(renderContactsScreen, 1200);
 } else {
  const m = (res && res.error==='no_such_code') ? 'Ce code ami n\u2019existe pas.'
          : (res && res.error==='invalid') ? 'Code invalide.'
          : 'Échec. Vérifie la connexion.';
  if(msg){ msg.innerText='❌ '+m; msg.style.color='#e74c3c'; }
 }
}
async function chatAcceptContact(from){
 if(!(await _chatParentGate())) return;
 const res = await chatFriendAccept(_msgProf, from);
 if(res && res.ok){ if(typeof toast==='function') toast('✅ Ami ajouté !',2000); renderContactsScreen(); }
 else if(typeof toast==='function') toast('Échec de l\u2019ajout.',2000);
}
async function chatDeclineContact(from){
 const res = await chatFriendDecline(_msgProf, from);
 if(res && res.ok) renderContactsScreen();
}
// AUD-02-041 : annule une demande d'ami envoyée par ce profil, encore en attente.
async function chatCancelContact(to){
 const res = await chatFriendCancel(_msgProf, to);
 if(res && res.ok){ if(typeof toast==='function') toast('Demande annulée.',1800); renderContactsScreen(); }
 else if(typeof toast==='function') toast('Échec de l’annulation.',2000);
}
async function chatRemoveContact(other, name){
 showConfirm('Retirer '+name+' de tes amis ? Vous ne pourrez plus vous écrire.', async ()=>{
  const res = await chatFriendRemove(_msgProf, other);
  if(res && res.ok){ if(typeof toast==='function') toast('Contact retiré.',1800); renderContactsScreen(); }
 });
}
async function _chatParentGate(){
 if(_msgReadOnly) return true;
 const pin = prompt('Validation parentale\n\nEntre le code parent pour accepter ce contact :');
 if(pin===null) return false;
 if(typeof checkStoredPin==='function' && (await checkStoredPin(String(pin).trim()))) return true;
 if(typeof toast==='function') toast('❌ Code parent incorrect.',2000);
 return false;
}

// ═══════════════════════════════════════════════════════
// ÉCRAN CONVERSATION
// ═══════════════════════════════════════════════════════
async function chatOpenConv(id, name, avatar){
 const cached = _chatContactCache[id];
 _msgConv = { id, name, avatar: avatar || (cached && cached.avatar) || null, lastId:0 };
 renderConvShell(name);
 await _convFetch(true);
 if(!_msgReadOnly) _startConvPoll();
}
function renderConvShell(name){
 const body = document.getElementById('msg-body'); if(!body) return;
 const av = (_msgConv && _msgConv.avatar) || '\uD83E\uDDD9';
 body.innerHTML =
  '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">'
  + '<button onclick="renderContactsScreen()" style="background:#444;font-size:.8em;padding:5px 10px;">\u2039 Retour</button>'
  + '<span style="width:30px;height:30px;border-radius:50%;background:#f1ece2;display:flex;align-items:center;justify-content:center;font-size:16px;">'+_e(av)+'</span>'
  + '<span style="font-weight:700;font-size:1em;">'+_e(name)+'</span></div>'
  + '<div style="position:relative;">'
  + '<div id="msg-thread" onscroll="_msgThreadScroll()" style="height:46vh;overflow-y:auto;background:rgba(0,0,0,.2);border-radius:10px;padding:10px;"></div>'
  + '<button id="msg-jump" class="hidden" onclick="_msgJumpToBottom()">\u2193 nouveau message</button>'
  + '</div>'
  // AUD-03-044 (audit UX 2026-09-25) : 12 raccourcis (5 phrases + 7 stickers)
  // s'empilaient jusque-l\u00E0 AVANT le champ de saisie principal, diluant sa
  // priorit\u00E9 visuelle. Champ de saisie remont\u00E9 en premier ; raccourcis
  // regroup\u00E9s dans un tiroir repliable (ferm\u00E9 par d\u00E9faut).
  + (_msgReadOnly
     ? '<p style="font-size:.72em;color:#7f8c8d;text-align:center;margin-top:8px;">\uD83D\uDC41 Lecture seule (espace parent)</p>'
     : ('<div style="display:flex;gap:6px;margin-top:8px;">'
        + '<input type="text" id="msg-input" maxlength="1000" placeholder="Ton message\u2026" style="flex:1;" onkeydown="if(event.key===\'Enter\')chatSendCurrent()">'
        + '<button onclick="chatSendCurrent()" style="background:#27ae60;">Envoyer</button></div>'
        + '<button onclick="_msgToggleQuickDrawer()" style="background:none;border:none;color:#bdc3c7;font-size:.78em;padding:6px 2px;margin-top:4px;cursor:pointer;">\u2795 R\u00E9ponses rapides</button>'
        + '<div id="msg-quick-drawer" class="hidden">'
        + '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">'
        + CHAT_PHRASES.map(s=>'<button onclick="chatQuickSend(\''+_jsAttr(s)+'\')" style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);border-radius:14px;padding:6px 11px;font-size:.8em;">'+_e(s)+'</button>').join('')
        + '</div>'
        + '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">'
        + CHAT_STICKERS.map(s=>'<button onclick="chatQuickSend(\''+s+'\')" style="background:rgba(255,255,255,.08);border-radius:50%;width:38px;height:38px;font-size:19px;padding:0;line-height:1;">'+s+'</button>').join('')
        + '</div></div>'));
}
function _msgToggleQuickDrawer(){
 const d=document.getElementById('msg-quick-drawer'); if(d) d.classList.toggle('hidden');
}
function _fmtTime(ts){ if(!ts) return ''; try{ const d=new Date(ts); const h=d.getHours(), m=d.getMinutes(); return h+':'+(m<10?'0':'')+m; }catch(e){ return ''; } }
function _msgSpeakIdx(i){ const m=_convCache[i]; if(m && typeof speak==='function'){ try{ speak(m.body); }catch(e){} } }
function _msgShowJump(){ const b=document.getElementById('msg-jump'); if(b) b.classList.remove('hidden'); }
function _msgHideJump(){ const b=document.getElementById('msg-jump'); if(b) b.classList.add('hidden'); }
function _msgJumpToBottom(){ const th=document.getElementById('msg-thread'); if(th) th.scrollTop = th.scrollHeight; _msgHideJump(); }
function _msgThreadScroll(){ const th=document.getElementById('msg-thread'); if(th && (th.scrollHeight - th.scrollTop - th.clientHeight) < 40) _msgHideJump(); }
function _renderBubbles(messages){
 const thread = document.getElementById('msg-thread'); if(!thread) return;
 const mine = _msgProf.chatId;
 const av = (_msgConv && _msgConv.avatar) || '\uD83E\uDDD9';
 const pend = _chatPendingFor(_msgConv && _msgConv.id).map(q=>({ sender:mine, body:q.body, ts:q.ts, pending:true }));
 messages = (messages||[]).concat(pend);
 const atBottom = !thread.innerHTML || (thread.scrollHeight - thread.scrollTop - thread.clientHeight) < 40;
 const prevTop = thread.scrollTop;
 const lastIdx = messages.length - 1;
 thread.innerHTML = messages.map((m, i) => {
  const isMine = (m.sender === mine);
  const t = _fmtTime(m.ts);
  if(isMine){
   const pop = (_msgJustSent && i===lastIdx) ? ' msg-pop' : '';
   const pendingCls = m.pending ? ' msg-bub-pending' : '';
   // #16 (accusé de lecture) : affiché uniquement sous le TOUT DERNIER message
   // envoyé, quand otherReadUpTo (renvoyé par /msg/fetch) couvre son id.
   const isLastMine = (i===lastIdx);
   const readByOther = !m.pending && m.id!=null && _msgConv && _msgConv.otherReadUpTo && _msgConv.otherReadUpTo>=m.id;
   const seenLine = (isLastMine && readByOther)
    ? '<div style="text-align:right;font-size:.65em;color:#bdc3c7;margin:2px 6px 6px;">Vu'+(_msgConv.otherReadTs?(' à '+_fmtTime(_msgConv.otherReadTs)):'')+' <span style="color:#3498db;">\u2713\u2713</span></div>'
    : '';
   return '<div class="msg-row msg-out"><div class="msg-bub msg-bub-out'+pop+pendingCls+'">'
    + '<div>'+_e(m.body)+'</div>'
    + '<div class="msg-meta msg-meta-out"><span>'+t+'</span><span class="msg-ck">'+(m.pending?'\u23F3':'\u2713')+'</span></div></div>'
    + seenLine + '</div>';
  }
  return '<div class="msg-row msg-in"><div class="msg-av">'+_e(av)+'</div>'
   + '<div class="msg-bub msg-bub-in"><div>'+_e(m.body)+'</div>'
   + '<div class="msg-meta"><span>'+t+'</span><span class="msg-spk" onclick="_msgSpeakIdx('+i+')">\uD83D\uDD0A</span></div></div></div>';
 }).join('');
 _msgJustSent = false;
 if(atBottom){ thread.scrollTop = thread.scrollHeight; _msgHideJump(); }
 else { thread.scrollTop = prevTop; _msgShowJump(); }
}
// ── Phrases toutes prêtes + autocollants (non-lecteurs) + file d'attente hors-ligne ──
const CHAT_PHRASES = ['Coucou !','Bravo !','Tu joues ?','Merci !','À bientôt !'];
const CHAT_STICKERS = ['\uD83D\uDC4D','\u2B50','\uD83C\uDF89','\u2764\uFE0F','\uD83D\uDE00','\uD83D\uDC36','\uD83E\uDD84'];
function _chatQueueLoad(){ try{ return JSON.parse(localStorage.getItem('chatQueue')||'[]'); }catch(e){ return []; } }
function _chatQueueSave(q){ try{ localStorage.setItem('chatQueue', JSON.stringify(q)); }catch(e){} }
// v2 (audit performances AUD-07-006) : `tmpId` optionnel — si le message a
// déjà été tenté une première fois (échec réseau/timeout géré par _chatSend),
// on RÉUTILISE le même tmpId pour la mise en attente plutôt que d'en générer
// un nouveau, pour que le Worker puisse reconnaître un simple retry.
function _chatEnqueue(prof,to,body,tmpId){ const q=_chatQueueLoad(); const it={ sender:prof.chatId, to:to, body:body, ts:Date.now(), tmpId: tmpId || ('q'+Math.random().toString(36).slice(2,9)) }; q.push(it); _chatQueueSave(q); return it; }
function _chatQueueRemove(tmpId){ _chatQueueSave(_chatQueueLoad().filter(x=>x.tmpId!==tmpId)); }
function _chatPendingFor(to){ if(!to||!_msgProf||!_msgProf.chatId) return []; return _chatQueueLoad().filter(x=>x.sender===_msgProf.chatId && x.to===to); }
let _chatFlushing=false;
async function _chatFlushQueue(prof){
 if(_chatFlushing || !prof || !prof.chatId) return 0;
 const mine=_chatQueueLoad().filter(x=>x.sender===prof.chatId);
 if(!mine.length) return 0;
 _chatFlushing=true; let sent=0;
 try{
  for(const it of mine){
   try{
    const r=await chatMsgSend(prof, it.to, it.body, it.tmpId);
    if(r && r.ok){ _chatQueueRemove(it.tmpId); sent++; }
    else if(r && (r.error==='not_contact'||r.error==='blocked'||r.error==='empty')){ _chatQueueRemove(it.tmpId); } // jamais envoyable → on retire
    else { break; } // réseau/serveur KO → on garde et on réessaiera
   }catch(e){ break; }
  }
 } finally { _chatFlushing=false; }
 return sent;
}
// Audit fonctionnel (#17) : filtre de contenu basique sur les messages sortants.
// Liste courte, non exhaustive, pensée pour un usage familial entre enfants —
// facilement modifiable ci-dessous. On BLOQUE l'envoi (toast explicite) plutôt
// que de censurer/altérer le message à l'insu de l'enfant.
const _CHAT_BLOCKED_WORDS = [
 'con','connard','connasse','encul','merde','putain','salope','pute',
 'batard','bâtard','nique','niquer','pd','pédé','abruti','débile','crétin',
];
// v2 (audit AUD-01-001) : matching par mot ENTIER, pas par sous-chaine - avant
// ce correctif, "includes()" bloquait "content" (contient "con"), "pique-
// nique" (contient "nique"), "constellation", "confiture"... - du
// vocabulaire scolaire courant a l'age cible. On decoupe sur les espaces
// seulement (pas sur les tirets/apostrophes, pour ne pas casser les mots
// composes comme "pique-nique" en sous-mots), puis on ne compare que des
// tokens complets a la liste. Logique IDENTIQUE au Worker odyssee-chat.js
// (defense en profondeur des deux cotes) : repercuter tout changement futur.
// La liste est aussi normalisee (accents retires) une seule fois : avant ce
// correctif, les entrees accentuees ("pede","debile","cretin") ne
// matchaient jamais, le texte entrant etant desaccentue avant comparaison.
const _chatNorm = s => String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const _CHAT_BLOCKED_NORM = new Set(_CHAT_BLOCKED_WORDS.map(_chatNorm));
// AUD-02-040 (audit fonctionnel 2026-09-21) : renvoie le mot bloqué lui-même
// (forme normalisée) plutôt qu'un simple booléen, pour pouvoir l'indiquer à
// l'enfant — avant ce correctif, le toast générique ne précisait jamais quel
// mot posait problème, sur un message parfois long à retaper de mémoire.
function _chatFindBlockedWord(txt){
 const tokens = _chatNorm(txt).split(/\s+/).map(t => t.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g,''));
 return tokens.find(t => t && _CHAT_BLOCKED_NORM.has(t)) || null;
}
function _chatContainsBlockedWord(txt){
 return !!_chatFindBlockedWord(txt);
}

async function _chatSend(body){
 if(!_msgConv) return;
 body=String(body==null?'':body).trim(); if(!body) return;
 const blockedWord = _chatFindBlockedWord(body);
 if(blockedWord){
  // AUD-02-040 : indique le mot bloqué (au lieu d'un message générique) et
  // signale à chatSendCurrent() (return true) de NE PAS vider le champ de
  // saisie — l'enfant n'a plus besoin de retaper tout son message de mémoire,
  // seulement de corriger le mot en cause.
  if(typeof toast==='function') toast(`⚠️ Message bloqué (mot : « ${blockedWord} ») : merci de rester poli(e) 🙂`, 4200);
  // v12.2.6 (ADR-56, méta-audit Lot 5, pt.3) : signalement passif pour le
  // parent — pas d'alerte push (aucune infra serveur pour ça), juste un
  // compteur persistant, affiché dans le résumé hebdomadaire (Vue Parent).
  try{
   if(typeof P!=='undefined' && P){
    P.chatFlags = P.chatFlags || [];
    P.chatFlags.push({ ts: Date.now(), kind: 'blocked_word' });
    if(typeof saveProfile==='function') saveProfile();
   }
  }catch(e){ /* signalement best-effort : ne doit jamais bloquer l'envoi */ }
  return true;
 }
 // v2 (audit performances AUD-07-006) : généré UNE fois avant le premier essai
 // réseau, et réutilisé tel quel si ce message doit être mis en file d'attente
 // hors-ligne (voir plus bas) — permet au Worker de reconnaître un renvoi
 // automatique d'un message déjà inséré (réponse perdue après un timeout).
 const tmpId = 'q'+Math.random().toString(36).slice(2,9)+Date.now().toString(36);
 const res = await chatMsgSend(_msgProf, _msgConv.id, body, tmpId);
 if(res && res.ok){
  _convCache.push({ id:res.id, sender:_msgProf.chatId, body:body, ts:res.ts });
  _msgConv.lastId = res.id || _msgConv.lastId;
  _msgJustSent = true;
  // AUD-03-042 (audit UX 2026-09-25) : le seul retour d'un envoi réussi était
  // une coche de 0,62rem dans le coin de la bulle — trop discret pour un
  // enfant sur une action à enjeu social, contrairement au feedback riche
  // (toast + double bip) déjà en place sur l'achat de figurine.
  if(typeof beep==='function'){ try{ beep(900,'sine',.12,.04); }catch(e){} }
  _chatMarkSeen(_msgProf, _msgConv.id, _msgConv.lastId);
  _renderBubbles(_convCache);
 } else if(res && (res.error==='not_contact'||res.error==='blocked'||res.error==='empty'||res.error==='blocked_word')){
  const m = res.error==='not_contact' ? 'Vous n\u2019êtes plus amis.' : (res.error==='blocked' ? 'Ce contact est bloqué.' : (res.error==='blocked_word' ? 'Message bloqué : merci de rester poli(e) 🙂' : 'Message vide.'));
  if(typeof toast==='function') toast('\u274C '+m, 2500);
  // v12.2.6 (ADR-56) : si le SERVEUR a dû bloquer un mot que le filtre
  // client n'a pas intercepté (client modifié, ou liste désynchronisée),
  // c'est un signal plus fort qu'un simple blocage client — signalé pareil.
  if(res.error==='blocked_word'){
   try{
    if(typeof P!=='undefined' && P){
     P.chatFlags = P.chatFlags || [];
     P.chatFlags.push({ ts: Date.now(), kind: 'blocked_word_server' });
     if(typeof saveProfile==='function') saveProfile();
    }
   }catch(e){}
  }
  // AUD-02-040 : même logique que le blocage client plus haut — ne pas faire
  // perdre le texte tapé, quelle que soit la raison de l'échec.
  return true;
 } else {
  _chatEnqueue(_msgProf, _msgConv.id, body, tmpId); // hors-ligne → file d'attente
  _msgJustSent = true;
  _renderBubbles(_convCache);
  if(typeof toast==='function') toast('Hors-ligne : message en attente d\u2019envoi.', 2400);
 }
}
function chatQuickSend(text){ _chatSend(text); }

// v2 (audit performances AUD-07-014) : petit cache local (localStorage) des
// derniers messages connus par conversation, pour permettre une consultation
// hors-ligne/en cas de panne serveur au lieu d'une coupure totale — la
// messagerie était jusqu'ici la SEULE fonctionnalité sociale du produit sans
// aucun repli quand le Worker/D1 est indisponible (tout le reste du jeu reste
// jouable hors-ligne via le Service Worker). Bornée à 50 messages/conversation,
// mise à jour à chaque sondage réussi.
function _chatCacheKey(prof, withId){ return 'chatCache_'+(prof&&prof.chatId)+'_'+withId; }
function _chatCacheLoad(prof, withId){ try{ return JSON.parse(localStorage.getItem(_chatCacheKey(prof, withId))||'[]'); }catch(e){ return []; } }
function _chatCacheSave(prof, withId, messages){ try{ localStorage.setItem(_chatCacheKey(prof, withId), JSON.stringify((messages||[]).slice(-50))); }catch(e){} }

let _convCache = [];
let _msgJustSent = false;
async function _convFetch(reset){
 // v2 (audit performances AUD-07-005) : valeur de retour (succès/échec)
 // ajoutée pour permettre un backoff du polling en cas d'erreurs répétées
 // (voir _startConvPoll) — comportement de rendu inchangé, uniquement des
 // `return` explicites ajoutés en fin de chaque branche.
 if(!reset && !_msgReadOnly){ try{ await _chatFlushQueue(_msgProf); }catch(e){} }
 if(!_msgConv) return true;
 if(reset) _convCache = [];
 const since = reset ? 0 : _msgConv.lastId;
 const res = await chatMsgFetch(_msgProf, _msgConv.id, since);
 if(res && res.ok){
  // #16 (accusé de lecture) : mémorise où en est la lecture de l'AUTRE
  // participant, à CHAQUE sondage (même sans nouveau message), pour afficher
  // "Vu à..." dès qu'il lit notre dernier message envoyé.
  const prevOtherRead = _msgConv.otherReadUpTo||0;
  _msgConv.otherReadUpTo = res.otherReadUpTo||0;
  _msgConv.otherReadTs = res.otherReadTs||0;
  const readChanged = _msgConv.otherReadUpTo !== prevOtherRead;
  if(res.messages && res.messages.length){
   _convCache = _convCache.concat(res.messages);
   _msgConv.lastId = _convCache[_convCache.length-1].id;
   _renderBubbles(_convCache);
   _chatCacheSave(_msgProf, _msgConv.id, _convCache);
   _chatMarkSeen(_msgProf, _msgConv.id, _msgConv.lastId);
   if(!_msgReadOnly && typeof chatMsgMarkRead==='function') chatMsgMarkRead(_msgProf, _msgConv.id, _msgConv.lastId).catch(()=>{});
  } else if(reset){
   // v2 (AUD-07-014) : à l'ouverture, sans nouveau message côté serveur, on
   // affiche quand même le cache local s'il existe (dernière conversation
   // consultée hors-ligne il y a peu), plutôt qu'un thread vide.
   const cached = _chatCacheLoad(_msgProf, _msgConv.id);
   if(cached.length){ _convCache = cached; _msgConv.lastId = cached[cached.length-1].id; }
   _renderBubbles(_convCache);
  } else if(readChanged){
   _renderBubbles(_convCache); // re-rendu pour afficher l'accusé de lecture mis à jour
  }
  return true;
 } else if(reset){
  // v2 (AUD-07-014) : le Worker/D1 est indisponible — au lieu d'une coupure
  // totale même pour les messages déjà reçus, on retombe sur le dernier cache
  // local connu de cette conversation (persisté à chaque sondage réussi
  // ci-dessus), avec un état explicite plutôt qu'un silence ou un blocage.
  const cached = _chatCacheLoad(_msgProf, _msgConv.id);
  if(cached.length){
   _convCache = cached;
   _msgConv.lastId = cached[cached.length-1].id;
   _renderBubbles(_convCache);
   if(typeof toast==='function') toast('⚠️ Messagerie indisponible — derniers messages connus affichés', 3200);
  } else {
   const thread = document.getElementById('msg-thread');
   if(thread) thread.innerHTML = '<p style="color:#e74c3c;font-size:.8em;text-align:center;">Connexion impossible.</p>';
  }
  return false;
 }
 return false;
}
async function chatSendCurrent(){
 const inp = document.getElementById('msg-input'); if(!inp) return;
 const txt = inp.value.trim(); if(!txt) return;
 inp.disabled=true;
 // AUD-02-040 (audit fonctionnel 2026-09-21) : le champ était vidé AVANT
 // l'envoi, donc aussi en cas de blocage par le filtre — l'enfant devait tout
 // retaper de mémoire. _chatSend() renvoie désormais true si le message a été
 // bloqué (client ou serveur) : dans ce cas, le texte reste dans le champ,
 // modifiable, pour que l'enfant puisse seulement corriger le mot en cause.
 const blocked = await _chatSend(txt);
 if(!blocked) inp.value='';
 inp.disabled=false; inp.focus();
}
// v2 (audit performances AUD-07-005) : intervalle fixe remplacé par un
// setTimeout auto-replanifié avec backoff exponentiel — en cas d'erreurs
// serveur répétées (429, 500, réseau), l'intervalle double à chaque échec
// consécutif (plafonné à 60s) au lieu de continuer à cogner toutes les 4s,
// puis revient immédiatement à la cadence normale dès le premier succès.
const CONV_POLL_BASE_MS = 4000, CONV_POLL_MAX_MS = 60000;
let _convPollFailStreak = 0;
function _startConvPoll(){
 _stopConvPoll();
 const tick = async () => {
  const ok = await _convFetch(false);
  _convPollFailStreak = ok ? 0 : _convPollFailStreak + 1;
  const delay = Math.min(CONV_POLL_BASE_MS * Math.pow(2, _convPollFailStreak), CONV_POLL_MAX_MS);
  _msgConvTimer = setTimeout(tick, delay);
 };
 _msgConvTimer = setTimeout(tick, CONV_POLL_BASE_MS);
}
function _stopConvPoll(){ if(_msgConvTimer){ clearTimeout(_msgConvTimer); _msgConvTimer=null; } }

// ═══════════════════════════════════════════════════════
// ENVELOPPE FLOTTANTE UNIQUE (partout) + PASTILLE + BANDEAU
// Une seule enveloppe en coin, présente sur tous les écrans,
// masquée pendant une question (vue v-game) et quand la
// messagerie est ouverte. Remplace l'ancien bouton menu + HUD.
// ═══════════════════════════════════════════════════════
function _msgEnsureFab(){
 if(!document.getElementById('msg-fab-style')){
  const st=document.createElement('style'); st.id='msg-fab-style';
  st.textContent=''
   +'#msg-fab{position:fixed;right:14px;bottom:16px;height:44px;padding:0 15px 0 11px;border-radius:22px;background:#fff;border:1px solid #e7ddcd;box-shadow:0 3px 10px rgba(0,0,0,.18);display:inline-flex;align-items:center;gap:7px;font-size:21px;cursor:pointer;z-index:9000;transition:transform .15s;}'+'.msg-fab-lbl{font-size:.72rem;font-weight:700;color:#2c2c2a;letter-spacing:.2px;}'
   +'#msg-fab:active{transform:scale(.92);}#msg-fab.hidden{display:none;}'
   +'#msg-fab-badge{position:absolute;top:-3px;right:-3px;min-width:20px;height:20px;line-height:20px;background:#e74c3c;color:#fff;font-size:.7rem;font-weight:700;border-radius:10px;text-align:center;padding:0 5px;box-shadow:0 1px 3px rgba(0,0,0,.3);}'
   +'#msg-fab-badge.hidden{display:none;}#msg-fab.msg-fab-pop{animation:msgFabPop .55s;}'
   +'@keyframes msgFabPop{0%{transform:scale(1);}25%{transform:scale(1.18) rotate(-9deg);}55%{transform:scale(.95) rotate(7deg);}100%{transform:scale(1) rotate(0);}}'
   +'#msg-toast{position:fixed;left:50%;top:14px;transform:translateX(-50%) translateY(-140%);max-width:340px;width:calc(100% - 28px);background:#fff;border:1px solid #e7ddcd;border-radius:14px;box-shadow:0 4px 16px rgba(0,0,0,.22);padding:10px 14px;display:flex;align-items:center;gap:10px;z-index:9500;cursor:pointer;transition:transform .38s cubic-bezier(.2,.8,.2,1.15);}'
   +'#msg-toast.msg-toast-show{transform:translateX(-50%) translateY(0);}#msg-toast.hidden{display:none;}'
   +'.msg-row{display:flex;align-items:flex-end;gap:6px;margin-bottom:8px;}.msg-row.msg-out{justify-content:flex-end;}'
   +'.msg-av{width:26px;height:26px;border-radius:50%;background:#f1ece2;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}'
   +'.msg-bub{max-width:76%;padding:7px 11px;border-radius:14px;font-size:.9em;word-break:break-word;}'
   +'.msg-bub-in{background:#fff;color:#2c2c2a;border:1px solid #eee;border-bottom-left-radius:4px;}'
   +'.msg-bub-out{background:#cdeafc;color:#0c447c;border-bottom-right-radius:4px;}'
   +'.msg-meta{display:flex;align-items:center;gap:6px;margin-top:3px;font-size:.72rem;color:#bdc3c7;}.msg-meta-out{justify-content:flex-end;color:#5a86a8;}'
   +'.msg-spk{cursor:pointer;font-size:.85rem;}.msg-ck{font-weight:700;font-size:.9rem;}'
   +'.msg-bub-pending{opacity:.6;}' /* AUD-03-043 : signal redondant (opacité) en plus de l'icône ⏳ pour un message en attente */
   +'.msg-pop{animation:msgBubPop .32s ease-out;}@keyframes msgBubPop{0%{transform:scale(.5) translateY(8px);opacity:0;}70%{transform:scale(1.04) translateY(0);opacity:1;}100%{transform:scale(1) translateY(0);}}'
   +'#msg-jump{position:absolute;left:50%;transform:translateX(-50%);bottom:14px;background:#1d9e75;color:#fff;border:none;border-radius:14px;padding:6px 14px;font-size:.78rem;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.25);z-index:20;}#msg-jump.hidden{display:none;}';
  document.head.appendChild(st);
 }
 if(!document.getElementById('msg-fab')){
  const fab=document.createElement('div');
  fab.id='msg-fab'; fab.className='hidden'; fab.setAttribute('role','button'); fab.setAttribute('aria-label','Messagerie');
  fab.onclick=function(){ try{ openMessaging(); }catch(e){} };
  fab.innerHTML='\u2709\uFE0F<span class="msg-fab-lbl">Messagerie</span><span id="msg-fab-badge" class="hidden"></span>';
  document.body.appendChild(fab);
 }
 if(!document.getElementById('msg-toast')){
  const t=document.createElement('div'); t.id='msg-toast'; t.className='hidden';
  document.body.appendChild(t);
 }
}
function _msgGameViewActive(){ const g=document.getElementById('v-game'); return !!(g && !g.classList.contains('hidden')); }
function _msgOverlayOpen(){ const ov=document.getElementById('msg-overlay'); return !!(ov && !ov.classList.contains('hidden')); }
function _msgFabUpdate(){
 _msgEnsureFab();
 const fab=document.getElementById('msg-fab'); if(!fab) return;
 const name=_curName(); const prof=name?_chatLoad(name):null;
 const show = !!(prof && prof.chatEnabled && prof.chatId) && !_msgGameViewActive() && !_msgOverlayOpen();
 fab.classList.toggle('hidden', !show);
}
function _msgWrapShowView(){
 if(typeof showView!=='function' || showView._msgWrapped) return;
 const orig=showView;
 showView=function(){ orig.apply(this, arguments); try{ _msgFabUpdate(); }catch(e){} };
 showView._msgWrapped=true;
}

// Détection d'un nouveau message entrant → enveloppe qui tressaute + son + bandeau.
let _chatLastLatest = {};
let _chatLatestInit = false;
const _chatContactCache = {}; // id -> {name, avatar}
let _msgToastTimer = null;
async function _chatMaybeNotify(prof, latest){
 const seen = _chatSeen(prof);
 if(!_chatLatestInit){ _chatLatestInit = true; _chatLastLatest = Object.assign({}, latest); return; } // 1re passe : pas de notif
 const newcomers=[];
 for(const cid in latest){
  const cur=latest[cid]||0, prev=_chatLastLatest[cid]||0;
  const isOpen=_msgOverlayOpen() && _msgConv && _msgConv.id===cid;
  if(cur>prev && cur>(seen[cid]||0) && !isOpen) newcomers.push(cid);
 }
 _chatLastLatest = Object.assign({}, latest);
 if(!newcomers.length) return;
 const fab=document.getElementById('msg-fab');
 if(fab && !fab.classList.contains('hidden')){ fab.classList.remove('msg-fab-pop'); void fab.offsetWidth; fab.classList.add('msg-fab-pop'); }
 try{ beep(660,'sine',.12,.07); setTimeout(()=>{ try{ beep(880,'sine',.12,.07); }catch(e){} },130); }catch(e){}
 const cid=newcomers[newcomers.length-1];
 let info=_chatContactCache[cid];
 if(!info){
  try{ const fl=await chatFriendList(prof); if(fl&&fl.ok&&Array.isArray(fl.contacts)){ fl.contacts.forEach(c=>{ _chatContactCache[c.id]={name:c.name,avatar:c.avatar}; }); info=_chatContactCache[cid]; } }catch(e){}
 }
 _msgShowToast(cid, info);
}
function _msgShowToast(cid, info){
 _msgEnsureFab();
 const t=document.getElementById('msg-toast'); if(!t) return;
 const name=(info&&info.name)||'un ami';
 const av=(info&&info.avatar)||'\uD83D\uDC64';
 t.innerHTML='<div style="width:34px;height:34px;border-radius:50%;background:#f1ece2;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">'+_e(av)+'</div>'
  +'<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:600;color:#2c2c2a;">\uD83D\uDCE9 Nouveau message</div>'
  +'<div style="font-size:12px;color:#888;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">de '+_e(name)+'</div></div>';
 t.onclick=function(){ _msgHideToast(); _msgOpenConvFromNotif(cid, name); };
 t.classList.remove('hidden'); void t.offsetWidth; t.classList.add('msg-toast-show');
 if(_msgToastTimer) clearTimeout(_msgToastTimer);
 _msgToastTimer=setTimeout(_msgHideToast, 4500);
}
function _msgHideToast(){
 const t=document.getElementById('msg-toast'); if(!t) return;
 t.classList.remove('msg-toast-show');
 if(_msgToastTimer) clearTimeout(_msgToastTimer);
 _msgToastTimer=setTimeout(()=>{ if(t) t.classList.add('hidden'); }, 400);
}
async function _msgOpenConvFromNotif(cid, name){
 try{ await openMessaging(); }catch(e){}
 setTimeout(()=>{ try{ chatOpenConv(cid, name); }catch(e){} }, 280);
}

async function chatRefreshBadges(){
 _msgEnsureFab();
 const name = _curName();
 const prof = name ? _chatLoad(name) : null;
 const enabled = !!(prof && prof.chatEnabled);
 // anciennes entrées remplacées par l'enveloppe flottante unique
 const menuBtn = document.getElementById('menu-msg-btn'); if(menuBtn) menuBtn.classList.add('hidden');
 const hud = document.getElementById('hud-msg'); if(hud) hud.classList.add('hidden');
 _msgFabUpdate();
 if(!enabled || !prof || !prof.chatId){ _setBadge('msg-fab-badge',0); _setBadge('menu-msg-badge',0); _setBadge('hud-msg-badge',0); _chatLastLatest={}; _chatLatestInit=false; return true; }
 const l = await chatMsgLatest(prof);
 const latest = (l && l.latest) ? l.latest : {};
 const n = chatUnreadCount(prof, latest);
 _setBadge('msg-fab-badge', n); _setBadge('menu-msg-badge', n); _setBadge('hud-msg-badge', n);
 try{ await _chatMaybeNotify(prof, latest); }catch(e){}
 // v2 (audit performances AUD-07-005) : succès/échec remonté pour le backoff
 // du polling de badges (voir chatStartBadgePoll).
 return !!(l && l.ok);
}
function _setBadge(id, n){
 const el = document.getElementById(id); if(!el) return;
 if(n>0){ el.textContent = n>9?'9+':String(n); el.classList.remove('hidden'); }
 else { el.classList.add('hidden'); }
}
// Tire l'identité de messagerie depuis le cloud (lecture seule du profil cloud, sans toucher au profil de jeu).
async function chatSyncIdentityFromCloud(name){
 name = name || _curName(); if(!name) return;
 let prof = null;
 try{ prof = (typeof P!=='undefined' && P && P.name===name) ? P : (typeof _readProfile==='function' ? _readProfile(name) : null); }catch(e){}
 const code = prof && prof.cloudCode;
 if(!code || typeof pullProfileFromCloud!=='function') return;
 try{
  const res = await pullProfileFromCloud(code);
  if(res && res.ok && res.profile && res.profile._chat){ chatMergeFromCloud(name, res.profile._chat); }
 }catch(e){}
}
let _chatPushedOnce = false;
async function chatSyncTick(){
 const name = _curName();
 if(name){
  await chatSyncIdentityFromCloud(name);              // adopte l'identité du cloud si dispo (tablette/téléphone)
  const prof = _chatLoad(name);
  if(prof.chatEnabled && prof.chatId){ try{ await _chatFlushQueue(prof); }catch(e){} } // ré-essaie les messages hors-ligne
  if(prof.chatEnabled && prof.chatId && !_chatPushedOnce){ // s'assure que l'appareil déjà activé pousse son identité
   _chatPushedOnce = true;
   try{ if(typeof scheduleCloudSync==='function') scheduleCloudSync(); }catch(e){}
  }
 }
 if(!_chatAllPulled){ _chatAllPulled = true; try{ await chatPullAllIdentities(); }catch(e){} } // adopte TOUS les profils synchronisés
 return await chatRefreshBadges();
}
// v2 (audit performances AUD-07-005) : même principe de backoff que
// _startConvPoll ci-dessus pour le sondage des badges non-lus.
const BADGE_POLL_BASE_MS = 25000, BADGE_POLL_MAX_MS = 120000;
let _badgePollFailStreak = 0;
function chatStartBadgePoll(){
 _msgEnsureFab(); _msgWrapShowView();
 if(_msgBadgePoll) clearTimeout(_msgBadgePoll);
 const tick = async () => {
  const ok = await chatSyncTick();
  _badgePollFailStreak = ok ? 0 : _badgePollFailStreak + 1;
  const delay = Math.min(BADGE_POLL_BASE_MS * Math.pow(2, _badgePollFailStreak), BADGE_POLL_MAX_MS);
  _msgBadgePoll = setTimeout(tick, delay);
 };
 tick();
}

// ═══════════════════════════════════════════════════════
// SECTION « MESSAGERIE » DANS LE PANNEAU PROFIL (espace parent)
// ═══════════════════════════════════════════════════════
// Actions parent : bloquer/débloquer un contact, accepter/refuser une demande (déjà dans l'espace parent).
async function chatBlockContact(name, otherId, otherName){
 showConfirm('Bloquer '+(otherName||otherId)+' ?\n\nCe contact ne pourra plus échanger avec '+name+' et ses messages seront ignorés. Tu pourras le débloquer plus tard.', async ()=>{
  const prof=_chatLoad(name); if(!prof.chatId) return;
  const r=await chatFriendBlock(prof, otherId);
  if(typeof toast==='function') toast((r&&r.ok)?'\uD83D\uDEAB Contact bloqué.':'Échec du blocage.',2000);
  _renderOptMsgManage(name); if(typeof chatRefreshBadges==='function') chatRefreshBadges();
 }, {danger:true, confirmLabel:'Bloquer'});
}
async function chatUnblockContact(name, otherId){
 const prof=_chatLoad(name); if(!prof.chatId) return;
 const r=await chatFriendUnblock(prof, otherId);
 if(r&&r.ok && typeof toast==='function') toast('Contact débloqué.',1600);
 _renderOptMsgManage(name); if(typeof chatRefreshBadges==='function') chatRefreshBadges();
}
async function optAcceptPending(name, fromId){
 const prof=_chatLoad(name); if(!prof.chatId) return;
 const r=await chatFriendAccept(prof, fromId);
 if(r&&r.ok && typeof toast==='function') toast('\u2705 Contact accepté.',1600);
 _renderOptMsgManage(name); if(typeof chatRefreshBadges==='function') chatRefreshBadges();
}
async function optDeclinePending(name, fromId){
 const prof=_chatLoad(name); if(!prof.chatId) return;
 await chatFriendDecline(prof, fromId);
 if(typeof toast==='function') toast('Demande refusée.',1500);
 _renderOptMsgManage(name);
}
// Sous-panneau parent : demandes en attente + contacts (bloquer) + bloqués (débloquer).
async function _renderOptMsgManage(name){
 const box=document.getElementById('opt-msg-manage'); if(!box) return;
 const prof=_chatLoad(name);
 if(!prof.chatEnabled || !prof.chatId){ box.innerHTML=''; return; }
 box.innerHTML='<p style="font-size:.72em;color:#7f8c8d;margin:8px 0 4px;">Chargement\u2026</p>';
 let fl=null; try{ fl=await chatFriendList(prof); }catch(e){}
 if(!fl || !fl.ok){ box.innerHTML='<p style="font-size:.72em;color:#7f8c8d;margin:8px 0;">Contacts indisponibles (hors-ligne ?).</p>'; return; }
 const nEsc=_jsAttr(name);
 const av=c=>_e(c.avatar||'\uD83E\uDDD9'), nm=c=>_e(c.name||c.id), idOf=c=>_e(c.id);
 const avat=v=>'<span style="width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">'+v+'</span>';
 let h='';
 const inc=fl.incoming||[];
 if(inc.length){
  h+='<div style="margin-top:10px;font-size:.72em;font-weight:700;color:#f39c12;">\uD83D\uDCE5 Demandes en attente ('+inc.length+')</div>';
  inc.forEach(c=>{ h+='<div style="display:flex;align-items:center;gap:8px;margin:5px 0;">'+avat(av(c))
    +'<span style="flex:1;font-size:.8em;">'+nm(c)+'</span>'
    +'<button onclick="optAcceptPending(\''+nEsc+'\',\''+idOf(c)+'\')" style="background:#27ae60;font-size:.72em;padding:4px 9px;">Accepter</button>'
    +'<button onclick="optDeclinePending(\''+nEsc+'\',\''+idOf(c)+'\')" style="background:#7f8c8d;font-size:.72em;padding:4px 9px;">Refuser</button></div>'; });
 }
 const contacts=fl.contacts||[];
 h+='<div style="margin-top:10px;font-size:.72em;font-weight:700;color:#bdc3c7;">\uD83D\uDC65 Contacts ('+contacts.length+')</div>';
 if(!contacts.length) h+='<p style="font-size:.72em;color:#7f8c8d;margin:4px 0;">Aucun contact.</p>';
 contacts.forEach(c=>{ const cnArg=_jsAttr(c.name||c.id);
  h+='<div style="display:flex;align-items:center;gap:8px;margin:5px 0;">'+avat(av(c))
   +'<span style="flex:1;font-size:.8em;">'+nm(c)+'</span>'
   +'<button onclick="chatBlockContact(\''+nEsc+'\',\''+idOf(c)+'\',\''+cnArg+'\')" style="background:#c0392b;font-size:.72em;padding:4px 9px;">\uD83D\uDEAB Bloquer</button></div>'; });
 const blocked=fl.blocked||[];
 if(blocked.length){
  h+='<div style="margin-top:10px;font-size:.72em;font-weight:700;color:#e74c3c;">\uD83D\uDEAB Bloqués ('+blocked.length+')</div>';
  blocked.forEach(c=>{ h+='<div style="display:flex;align-items:center;gap:8px;margin:5px 0;opacity:.7;">'+avat(av(c))
    +'<span style="flex:1;font-size:.8em;">'+nm(c)+'</span>'
    +'<button onclick="chatUnblockContact(\''+nEsc+'\',\''+idOf(c)+'\')" style="background:#7f8c8d;font-size:.72em;padding:4px 9px;">Débloquer</button></div>'; });
 }
 box.innerHTML=h;
}

function renderOptMessaging(name){
 const box = document.getElementById('opt-messaging'); if(!box) return;
 if(!name){ box.innerHTML=''; return; }
 const prof = _chatLoad(name);
 const on = !!prof.chatEnabled;
 const code = prof.chatId || '(généré à l\u2019activation)';
 const nEsc = _jsAttr(name);
 box.innerHTML =
  '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">'
  + '<span style="font-size:.9em;">Messagerie : <b style="color:'+(on?'#2ecc71':'#e67e22')+';">'+(on?'active':'suspendue')+'</b></span>'
  + '<button onclick="optToggleMessaging(\''+nEsc+'\')" style="background:'+(on?'#e67e22':'#27ae60')+';font-size:.8em;padding:5px 12px;">'+(on?'\u23F8 Suspendre':'\u25B6 Réactiver')+'</button>'
  + '</div>'
  + (on
     ? ('<p style="font-size:.72em;color:#bdc3c7;margin:0 0 6px;">Code ami : <span style="font-family:monospace;color:#5dade2;">'+_e(code)+'</span></p>'
        + '<button onclick="openMessaging(\''+nEsc+'\')" style="background:#2980b9;font-size:.8em;">\uD83D\uDC41 Voir les conversations</button>'
        + '<button onclick="chatAdoptCloudIdentity(\''+nEsc+'\')" style="background:#16a085;font-size:.8em;margin-left:4px;">\uD83D\uDD01 Aligner le code ami sur les autres appareils</button>'
        + '<div style="margin-top:8px;font-size:.72em;color:#bdc3c7;">Forcer le même code ami (transfert manuel d\u2019un appareil à l\u2019autre) :</div>'
        + '<button onclick="chatExportIdentityCode(\''+nEsc+'\')" style="background:#7f8c8d;font-size:.72em;">\uD83D\uDCE4 Exporter le code</button>'
        + '<button onclick="chatImportIdentityCode(\''+nEsc+'\')" style="background:#7f8c8d;font-size:.72em;margin-left:4px;">\uD83D\uDCE5 Importer un code</button>'
        + '<div id="opt-msg-manage"></div>')
     : '<p style="font-size:.72em;color:#7f8c8d;margin:0;">Suspendue : le code ami, les amis et l\u2019historique sont <b>conservés</b>. Réactive quand tu veux pour reprendre avec le même code.</p>');
 if(on){ try{ _renderOptMsgManage(name); }catch(e){} }
}
async function optToggleMessaging(name){
 const prof = _chatLoad(name);
 if(prof.chatEnabled){
  showConfirm('Suspendre la messagerie pour '+name+' ?\n\nLe code ami, les amis et l\u2019historique sont conservés. Tu pourras réactiver à tout moment avec le même code.', ()=>{
   chatDisableForProfile(name);
   if(typeof toast==='function') toast('\u23F8 Messagerie suspendue (identité conservée).',2200);
   renderOptMessaging(name);
   if(typeof chatRefreshBadges==='function') chatRefreshBadges();
  }, {confirmLabel:'Suspendre'});
  return;
 }
 if(typeof toast==='function') toast('Réactivation\u2026',1500);
 const res = await chatEnableForProfile(name);
 if(res && res.ok){ if(typeof toast==='function') toast('\u25B6 Messagerie réactivée !',2000); }
 else { if(typeof toast==='function') toast('\u25B6 Réactivée. Le code se synchronisera à la prochaine ouverture.',3200); }
 // Audit performances #6 : le polling de fond ne démarre plus automatiquement
 // au chargement de la page si la messagerie était désactivée (voir plus
 // haut) — s'il s'agit du profil actuellement actif, on le démarre donc ici,
 // sans attendre un rechargement de page.
 if(typeof chatStartBadgePoll==='function' && typeof _curName==='function' && name===_curName()) chatStartBadgePoll();
 renderOptMessaging(name);
 if(typeof chatRefreshBadges==='function') chatRefreshBadges();
}

// ── Synchronisation de l'identité via le cloud (fusion NON destructive) ──
function chatExportFor(name){ if(!name) return null; return _chatStore()[name] || null; }
function _chatMergeSeen(a,b){ const o=Object.assign({}, a||{}); const bb=b||{}; for(const k in bb){ if((bb[k]||0)>(o[k]||0)) o[k]=bb[k]; } return o; }
function chatMergeFromCloud(name, cloudChat){
 if(!name || !cloudChat || typeof cloudChat!=='object') return;
 const s=_chatStore(); const local=s[name]||{};
 const adoptId = (!local.id && !!cloudChat.id);
 const lt = local.ts||0, ct = cloudChat.ts||0;
 let enabled;
 if(lt===0 && ct===0) enabled = !!(local.enabled || cloudChat.enabled); // compat : aucun horodatage → OU
 else enabled = (ct > lt) ? !!cloudChat.enabled : !!local.enabled;       // le réglage le plus récent gagne (désactivation ne rebondit plus)
 s[name]={
  id: local.id || cloudChat.id || null,
  secret: local.secret || cloudChat.secret || null,
  enabled: enabled,
  registered: adoptId ? false : !!(local.registered || cloudChat.registered),
  seen: _chatMergeSeen(local.seen, cloudChat.seen),
  ts: Math.max(lt, ct)
 };
 _chatSaveStore(s);
 if(typeof chatRefreshBadges==='function'){ try{ chatRefreshBadges(); }catch(e){} }
}

// Force l'envoi de l'identité de messagerie de TOUS les profils activés vers le cloud
// (réutilise la version cloud la plus à jour pour ne pas régresser le profil de jeu).
async function chatForceSyncMessaging(){
 if(typeof getRoster!=='function' || typeof CLOUD_API==='undefined'){ if(typeof toast==='function') toast('Synchro cloud indisponible.',2500); return; }
 const roster = getRoster(); let okN=0, skip=0, fail=0;
 for(const name of roster){
  const local = _chatLoad(name);
  if(!local.chatEnabled || !local.chatId){ skip++; continue; }
  let prof=null; try{ prof = (typeof P!=='undefined' && P && P.name===name) ? P : _readProfile(name); }catch(e){}
  const cc = prof && prof.cloudCode;
  if(!cc){ fail++; continue; }
  let base = prof;
  try{ const r = await pullProfileFromCloud(cc); if(r && r.ok && r.profile) base = r.profile; }catch(e){}
  const payload = Object.assign({}, base);
  delete payload._syncedAt;
  payload._chat = { id:local.chatId, secret:local.chatSecret, enabled:true, registered:!!local.chatRegistered, seen:local.chatSeen||{}, ts:local.ts||Date.now() };
  try{
   const r = await fetch(`${CLOUD_API}/profile/${encodeURIComponent(cc)}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
   if(r.ok){ okN++; } else { fail++; }
  }catch(e){ fail++; }
 }
 if(typeof toast==='function') toast('🔄 Messagerie envoyée pour '+okN+' profil(s). Recharge maintenant les autres appareils.', 4500);
 return { ok:okN, skip, fail };
}
// Côté récepteur : tire l'identité de TOUS les profils synchronisés (une fois par session).
let _chatAllPulled = false;
async function chatPullAllIdentities(){
 if(typeof getRoster!=='function') return;
 for(const n of getRoster()){
  const local = _chatLoad(n);
  if(local.chatId) continue; // déjà une identité locale
  let prof=null; try{ prof = _readProfile(n); }catch(e){}
  const cc = prof && prof.cloudCode; if(!cc) continue;
  try{ const r = await pullProfileFromCloud(cc); if(r && r.ok && r.profile && r.profile._chat){ chatMergeFromCloud(n, r.profile._chat); } }catch(e){}
 }
}

// Aligne volontairement l'identité de CE profil sur celle, commune, du cloud (remplace l'identité locale).
async function chatAdoptCloudIdentity(name){
 let prof=null; try{ prof = (typeof P!=='undefined' && P && P.name===name) ? P : _readProfile(name); }catch(e){}
 const cc = prof && prof.cloudCode;
 if(!cc){ if(typeof toast==='function') toast('Ce profil n\u2019est pas en sauvegarde cloud.',3000); return; }
 showConfirm('Aligner le code ami de '+name+' sur celui des autres appareils ?\n\nLe code ami actuel de CET appareil sera remplacé par le code commun (cloud). Tu retrouveras alors les amis et l\u2019historique communs.', async ()=>{
  if(typeof toast==='function') toast('Récupération\u2026',1500);
  let cloudChat=null;
  try{ const r = await pullProfileFromCloud(cc); if(r && r.ok && r.profile && r.profile._chat) cloudChat = r.profile._chat; }catch(e){}
  if(!cloudChat || !cloudChat.id){ if(typeof toast==='function') toast('Aucune identité commune trouvée sur le cloud. Lance d\u2019abord « Forcer la synchro » depuis l\u2019appareil de référence.',5000); return; }
  const s=_chatStore();
  s[name]={ id:cloudChat.id, secret:cloudChat.secret, enabled:true, registered:false, seen:cloudChat.seen||{}, ts:cloudChat.ts||Date.now() };
  _chatSaveStore(s);
  try{ const p=_chatLoad(name); const rr=await chatRegister(p); if(rr&&rr.ok){ p.chatRegistered=true; _chatPersist(p); } }catch(e){}
  if(typeof toast==='function') toast('✅ Code ami aligné ('+cloudChat.id+'). Amis et historique communs récupérés.',5000);
  if(typeof renderOptMessaging==='function') renderOptMessaging(name);
  if(typeof chatRefreshBadges==='function') chatRefreshBadges();
 }, {confirmLabel:'Aligner'});
}

// ── Transfert MANUEL du code de messagerie (force le même code ami entre appareils) ──
// AUD-06-004 (audit securite 2026-09-25) : avant ce correctif, "exporter"
// encodait id+secret en BASE64 (donc en clair, reversible sans cle) et
// l'affichait/le copiait tel quel -- un simple mauvais copier-coller ou une
// capture d'ecran suffisait a voler definitivement l'identite de messagerie
// de l'enfant. Remplace par un jeton serveur a usage unique, valable 10
// minutes (routes /transfer/create et /transfer/claim, worker
// odyssee-chat.js) : le jeton affiche n'est PAS le secret lui-meme, il ne
// vaut plus rien apres la premiere utilisation ou l'expiration.
async function chatExportIdentityCode(name){
 const p = _chatLoad(name);
 if(!p.chatId || !p.chatSecret){ if(typeof toast==='function') toast('Active d\u2019abord la messagerie pour ce profil.',3000); return; }
 const res = await _chatApi('/transfer/create', _chatAuth(p));
 if(!res || !res.ok || !res.token){ if(typeof toast==='function') toast('Erreur d\u2019export (r\u00e9seau ?).',3000); return; }
 try{ if(navigator && navigator.clipboard) navigator.clipboard.writeText(res.token); }catch(e){}
 if(typeof prompt==='function') prompt('Code de transfert de '+name+' (deja copie, valable 10 minutes, usage unique) :\nColle-le sur l\u2019autre appareil via « Importer un code » :', res.token);
 return res.token;
}
async function chatImportIdentityCode(name){
 const token = (typeof prompt==='function') ? prompt('Colle le code de transfert de '+name+' (exporte depuis l\u2019appareil de reference, valable 10 minutes) :') : null;
 if(!token) return;
 const res2 = await _chatApi('/transfer/claim', { token: String(token).trim() });
 if(!res2 || !res2.ok || !res2.id || !res2.secret){
  if(typeof toast==='function') toast(res2 && res2.error==='expired' ? 'Code expire ou deja utilise, redemande-en un nouveau.' : 'Code invalide.', 3500);
  return;
 }
 const s=_chatStore();
 s[name] = { id:res2.id, secret:res2.secret, enabled:true, registered:false, seen:(s[name]&&s[name].seen)||{}, ts:Date.now() };
 _chatSaveStore(s);
 try{ const p=_chatLoad(name); const rr=await chatRegister(p); if(rr&&rr.ok){ p.chatRegistered=true; _chatPersist(p); } }catch(e){}
 if(typeof toast==='function') toast('Identite importee ('+res2.id+'). Amis et historique recuperes.',5000);
 if(typeof renderOptMessaging==='function') renderOptMessaging(name);
 if(typeof chatRefreshBadges==='function') chatRefreshBadges();
}

// Démarrage : suivi des pastilles + affichage du bouton menu (fixe)
// Audit performances #6 : ne démarre le polling de fond (toutes les 25s) que
// si la messagerie est réellement activée pour le profil courant — elle est
// désactivée par défaut pour tout profil neuf (opt-in parental), donc sans
// cette condition, un trafic réseau permanent tournait pour chaque session
// ouverte même quand la messagerie n'est jamais utilisée. Si un parent
// l'active en cours de session, le polling démarre alors depuis
// optToggleMessaging() (voir plus bas) — pas besoin de recharger la page.
try{ if(typeof window!=='undefined'){ setTimeout(()=>{
 if(typeof chatStartBadgePoll==='function' && typeof chatIsEnabledByName==='function' && typeof _curName==='function' && chatIsEnabledByName(_curName())){
  chatStartBadgePoll();
 }
}, 1500); } }catch(e){}

// Audit performances #8 : suspendre les minuteurs de polling pendant une
// coupure réseau détectée (au lieu de continuer à tenter — et échouer — des
// appels toutes les 4 à 25s), et reprendre immédiatement au retour du réseau
// plutôt que d'attendre le prochain tick programmé. _msgWasPollingConv retient
// si une conversation était activement suivie au moment de la coupure, pour
// ne reprendre que ce qui tournait réellement avant (ne force pas l'ouverture
// d'une conversation qui n'était pas affichée).
let _msgWasPollingConv = false;
function _msgOnOffline(){
 _msgWasPollingConv = !!(_msgConv && _msgConvTimer);
 _stopConvPoll();
 if(_msgBadgePoll){ clearTimeout(_msgBadgePoll); _msgBadgePoll=null; }
}
function _msgOnOnline(){
 if(typeof chatIsEnabledByName==='function' && typeof _curName==='function' && chatIsEnabledByName(_curName()) && typeof chatStartBadgePoll==='function'){
  chatStartBadgePoll(); // relance immédiatement (chatSyncTick() est appelé dès le démarrage)
 }
 if(_msgWasPollingConv && _msgConv){
  _startConvPoll();
  try{ _convFetch(false); }catch(e){}
 }
 _msgWasPollingConv = false;
}
try{ if(typeof window!=='undefined'){
 window.addEventListener('offline', _msgOnOffline);
 window.addEventListener('online', _msgOnOnline);
} }catch(e){}
