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
 return { name, chatId:e.id||null, chatSecret:e.secret||null, chatEnabled:!!e.enabled, chatRegistered:!!e.registered, chatSeen:e.seen||{} };
}
function _chatPersist(prof){
 if(!prof || !prof.name) return;
 const s = _chatStore();
 s[prof.name] = { id:prof.chatId||null, secret:prof.chatSecret||null, enabled:!!prof.chatEnabled, registered:!!prof.chatRegistered, seen:prof.chatSeen||{} };
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
async function _chatApi(path, body){
 try{
  const r = await fetch(CHAT_API + path, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
  return await r.json();
 }catch(e){ return { error:'network' }; }
}
function _chatAuth(prof){ return { id: prof.chatId, secret: prof.chatSecret }; }
async function chatRegister(prof){ ensureChatIdentity(prof); return _chatApi('/register', { id:prof.chatId, secret:prof.chatSecret, name:prof.name }); }
async function chatFriendRequest(prof, code){ return _chatApi('/friend/request', Object.assign(_chatAuth(prof), { code })); }
async function chatFriendList(prof){ return _chatApi('/friend/list', _chatAuth(prof)); }
async function chatFriendAccept(prof, from){ return _chatApi('/friend/accept', Object.assign(_chatAuth(prof), { from })); }
async function chatFriendDecline(prof, from){ return _chatApi('/friend/decline', Object.assign(_chatAuth(prof), { from })); }
async function chatFriendRemove(prof, other){ return _chatApi('/friend/remove', Object.assign(_chatAuth(prof), { other })); }
async function chatMsgSend(prof, to, txt){ return _chatApi('/msg/send', Object.assign(_chatAuth(prof), { to, body:txt })); }
async function chatMsgFetch(prof, withId, since){ return _chatApi('/msg/fetch', Object.assign(_chatAuth(prof), { with:withId, since:since||0 })); }
async function chatMsgLatest(prof){ return _chatApi('/msg/latest', _chatAuth(prof)); }

// ═══════════════════════════════════════════════════════
// ACTIVATION (parental) — désactivée par défaut
// ═══════════════════════════════════════════════════════
function chatIsEnabled(prof){ return !!(prof && prof.chatEnabled); }
function chatIsEnabledByName(name){ return name ? _chatLoad(name).chatEnabled : false; }

async function chatEnableForProfile(name){
 if(!name) return { error:'no_profile' };
 const prof = _chatLoad(name);
 ensureChatIdentity(prof);
 prof.chatEnabled = true; _chatPersist(prof);     // état LOCAL d'abord (jamais annulé sur échec réseau)
 let res = await chatRegister(prof);
 if(res && res.error === 'taken'){ prof.chatId = _chatGenId(); _chatPersist(prof); res = await chatRegister(prof); }
 if(res && res.ok){ prof.chatRegistered = true; _chatPersist(prof); }
 if(typeof scheduleCloudSync==='function'){ try{ scheduleCloudSync(); }catch(e){} } // fait voyager l'identité via le cloud
 return res || { error:'network' };
}
function chatDisableForProfile(name){
 if(!name) return;
 const prof = _chatLoad(name); prof.chatEnabled = false; _chatPersist(prof);
 if(typeof chatRefreshBadges==='function') chatRefreshBadges();
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
var _msgProf = null;       // objet messagerie (identité + état) du profil consulté
var _msgReadOnly = false;  // mode lecture seule (visualisation parentale)
var _msgConv = null;       // {id, name, lastId}
var _msgConvTimer = null;
var _msgBadgePoll = null;

function _e(s){ return (typeof esc==='function') ? esc(s) : String(s==null?'':s); }
function _msgEl(){ return document.getElementById('msg-overlay'); }
function _curName(){ return (typeof P!=='undefined' && P) ? P.name : null; }

async function openMessaging(readOnlyName){
 const name = readOnlyName || _curName();
 const ro = !!readOnlyName;
 if(!name){ if(typeof toast==='function') toast('Aucun profil.',2000); return; }
 const prof = _chatLoad(name);
 if(!prof.chatEnabled && !ro){ if(typeof toast==='function') toast('La messagerie est désactivée. Un parent peut l\u2019activer dans Vue Parent → Options.',3200); return; }
 ensureChatIdentity(prof);
 _msgProf = prof; _msgReadOnly = ro; _msgConv = null;
 const ov = _msgEl(); if(ov) ov.classList.remove('hidden');
 if(!ro && !prof.chatRegistered){ const r = await chatRegister(prof); if(r && r.ok){ prof.chatRegistered = true; _chatPersist(prof); } }
 renderContactsScreen();
}
function closeMessaging(){
 _stopConvPoll(); _msgConv = null;
 const ov = _msgEl(); if(ov) ov.classList.add('hidden');
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
 body.innerHTML = '<p style="text-align:center;color:#bdc3c7;font-size:.85em;margin:20px;">Chargement\u2026</p>';
 const data = await chatFriendList(prof);
 if(!data || data.error){
  body.innerHTML = '<p style="text-align:center;color:#e74c3c;font-size:.85em;margin:20px;">Connexion impossible. Vérifie la connexion internet.</p>'
   + '<div style="text-align:center;"><button onclick="renderContactsScreen()" style="font-size:.85em;">Réessayer</button></div>';
  return;
 }
 let html = '';
 html += '<div style="background:rgba(52,152,219,.1);border:1px solid rgba(52,152,219,.35);border-radius:10px;padding:10px 12px;margin-bottom:12px;">'
  + '<p style="margin:0 0 2px;font-size:.74em;color:#bdc3c7;">Ton code ami (à donner pour être ajouté) :</p>'
  + '<div style="display:flex;align-items:center;gap:8px;"><span style="font-family:monospace;font-size:1.1em;font-weight:700;letter-spacing:1px;color:#5dade2;">'+_e(myCode)+'</span>'
  + '<button onclick="chatCopyCode()" style="font-size:.72em;padding:4px 8px;">📋 Copier</button></div></div>';

 const inc = data.incoming || [];
 if(inc.length && !_msgReadOnly){
  html += '<p style="font-size:.78em;font-weight:700;color:#f1c40f;margin:6px 0;">📨 Demandes reçues</p>';
  inc.forEach(c => {
   const cid=_e(c.id), cn=_e(c.name||c.id);
   html += '<div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.06);border-radius:10px;padding:8px 10px;margin:4px 0;">'
    + '<span style="flex:1;font-size:.9em;">'+cn+'</span>'
    + '<button onclick="chatAcceptContact(\''+cid+'\')" style="background:#27ae60;font-size:.76em;padding:5px 10px;">✅ Accepter</button>'
    + '<button onclick="chatDeclineContact(\''+cid+'\')" style="background:#7f8c8d;font-size:.76em;padding:5px 10px;">✕</button></div>';
  });
 }

 let latest = {};
 try{ const l = await chatMsgLatest(prof); if(l && l.latest) latest = l.latest; }catch(e){}
 const seen = _chatSeen(prof);

 const contacts = data.contacts || [];
 html += '<p style="font-size:.78em;font-weight:700;color:#bdc3c7;margin:12px 0 6px;">👥 Mes amis</p>';
 if(!contacts.length){
  html += '<p style="font-size:.8em;color:#7f8c8d;margin:6px 0;">Aucun ami pour l\u2019instant. Échange ton code ami pour vous ajouter.</p>';
 } else {
  contacts.forEach(c => {
   const cid=_e(c.id), cn=_e(c.name||c.id);
   const unread = (latest[c.id]||0) > (seen[c.id]||0);
   html += '<div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.06);border-radius:10px;padding:10px 12px;margin:4px 0;cursor:pointer;" onclick="chatOpenConv(\''+cid+'\',\''+cn.replace(/'/g,"\\'")+'\')">'
    + '<span style="flex:1;font-size:.95em;font-weight:600;">'+cn+'</span>'
    + (unread ? '<span style="background:#e74c3c;border-radius:50%;width:10px;height:10px;display:inline-block;"></span>' : '')
    + '<button onclick="event.stopPropagation();chatRemoveContact(\''+cid+'\',\''+cn.replace(/'/g,"\\'")+'\')" style="background:transparent;border:none;color:#7f8c8d;font-size:1em;cursor:pointer;" title="Retirer">✕</button>'
    + '<span style="color:#7f8c8d;">›</span></div>';
  });
 }

 if(!_msgReadOnly){
  html += '<div style="margin-top:14px;border-top:1px solid rgba(255,255,255,.1);padding-top:12px;">'
   + '<p style="font-size:.78em;font-weight:700;color:#2ecc71;margin:0 0 6px;">➕ Ajouter un ami</p>'
   + '<input type="text" id="msg-addcode" placeholder="Code ami (ex: 7K2P-9QXM)" style="width:70%;text-transform:uppercase;font-family:monospace;letter-spacing:1px;">'
   + '<button onclick="chatAddFriend()" style="background:#27ae60;font-size:.82em;margin-left:4px;">Envoyer</button>'
   + '<p id="msg-add-msg" style="font-size:.76em;margin-top:6px;"></p></div>';
 } else {
  html += '<p style="font-size:.74em;color:#7f8c8d;text-align:center;margin-top:14px;">👁 Visualisation parentale (lecture seule)</p>';
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
 if(!_chatParentGate()) return;
 const res = await chatFriendAccept(_msgProf, from);
 if(res && res.ok){ if(typeof toast==='function') toast('✅ Ami ajouté !',2000); renderContactsScreen(); }
 else if(typeof toast==='function') toast('Échec de l\u2019ajout.',2000);
}
async function chatDeclineContact(from){
 const res = await chatFriendDecline(_msgProf, from);
 if(res && res.ok) renderContactsScreen();
}
async function chatRemoveContact(other, name){
 if(!confirm('Retirer '+name+' de tes amis ? Vous ne pourrez plus vous écrire.')) return;
 const res = await chatFriendRemove(_msgProf, other);
 if(res && res.ok){ if(typeof toast==='function') toast('Contact retiré.',1800); renderContactsScreen(); }
}
function _chatParentGate(){
 if(_msgReadOnly) return true;
 const pin = prompt('Validation parentale\n\nEntre le code parent pour accepter ce contact :');
 if(pin===null) return false;
 if(typeof checkStoredPin==='function' && checkStoredPin(String(pin).trim())) return true;
 if(typeof toast==='function') toast('❌ Code parent incorrect.',2000);
 return false;
}

// ═══════════════════════════════════════════════════════
// ÉCRAN CONVERSATION
// ═══════════════════════════════════════════════════════
async function chatOpenConv(id, name){
 _msgConv = { id, name, lastId:0 };
 renderConvShell(name);
 await _convFetch(true);
 if(!_msgReadOnly) _startConvPoll();
}
function renderConvShell(name){
 const body = document.getElementById('msg-body'); if(!body) return;
 body.innerHTML =
  '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">'
  + '<button onclick="renderContactsScreen()" style="background:#444;font-size:.82em;padding:5px 10px;">‹ Retour</button>'
  + '<span style="font-weight:700;font-size:1em;">'+_e(name)+'</span></div>'
  + '<div id="msg-thread" style="height:46vh;overflow-y:auto;background:rgba(0,0,0,.2);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:6px;"></div>'
  + (_msgReadOnly
     ? '<p style="font-size:.74em;color:#7f8c8d;text-align:center;margin-top:8px;">👁 Lecture seule (espace parent)</p>'
     : ('<div style="display:flex;gap:4px;margin-top:8px;flex-wrap:wrap;">'
        + ['😀','😂','❤️','👍','🎉','😢','😮','🌟'].map(em=>'<button onclick="chatInsertEmoji(\''+em+'\')" style="font-size:1.1em;padding:2px 6px;background:rgba(255,255,255,.08);">'+em+'</button>').join('')
        + '</div>'
        + '<div style="display:flex;gap:6px;margin-top:6px;">'
        + '<input type="text" id="msg-input" maxlength="1000" placeholder="Ton message\u2026" style="flex:1;" onkeydown="if(event.key===\'Enter\')chatSendCurrent()">'
        + '<button onclick="chatSendCurrent()" style="background:#27ae60;">Envoyer</button></div>'));
}
function _renderBubbles(messages){
 const thread = document.getElementById('msg-thread'); if(!thread) return;
 const mine = _msgProf.chatId;
 thread.innerHTML = messages.map(m => {
  const isMine = (m.sender === mine);
  const side = isMine ? 'flex-end' : 'flex-start';
  const bg = isMine ? '#2980b9' : 'rgba(255,255,255,.12)';
  return '<div style="align-self:'+side+';max-width:78%;background:'+bg+';color:#fff;padding:7px 11px;border-radius:14px;font-size:.92em;word-break:break-word;">'+_e(m.body)+'</div>';
 }).join('');
 thread.scrollTop = thread.scrollHeight;
}
var _convCache = [];
async function _convFetch(reset){
 if(!_msgConv) return;
 if(reset) _convCache = [];
 const since = reset ? 0 : _msgConv.lastId;
 const res = await chatMsgFetch(_msgProf, _msgConv.id, since);
 if(res && res.ok && res.messages){
  if(res.messages.length){
   _convCache = _convCache.concat(res.messages);
   _msgConv.lastId = _convCache[_convCache.length-1].id;
   _renderBubbles(_convCache);
   _chatMarkSeen(_msgProf, _msgConv.id, _msgConv.lastId);
  } else if(reset){ _renderBubbles([]); }
 } else if(reset){
  const thread = document.getElementById('msg-thread');
  if(thread) thread.innerHTML = '<p style="color:#e74c3c;font-size:.82em;text-align:center;">Connexion impossible.</p>';
 }
}
function chatInsertEmoji(em){ const i=document.getElementById('msg-input'); if(i){ i.value += em; i.focus(); } }
async function chatSendCurrent(){
 const inp = document.getElementById('msg-input'); if(!inp) return;
 const txt = inp.value.trim(); if(!txt) return;
 inp.value=''; inp.disabled=true;
 const res = await chatMsgSend(_msgProf, _msgConv.id, txt);
 inp.disabled=false; inp.focus();
 if(res && res.ok){
  _convCache.push({ id:res.id, sender:_msgProf.chatId, body:txt, ts:res.ts });
  _msgConv.lastId = res.id || _msgConv.lastId;
  _renderBubbles(_convCache);
  _chatMarkSeen(_msgProf, _msgConv.id, _msgConv.lastId);
 } else {
  const m = (res && res.error==='not_contact') ? 'Vous n\u2019êtes plus amis.' : 'Échec de l\u2019envoi.';
  if(typeof toast==='function') toast('❌ '+m, 2000);
 }
}
function _startConvPoll(){ _stopConvPoll(); _msgConvTimer = setInterval(()=>{ _convFetch(false); }, 4000); }
function _stopConvPoll(){ if(_msgConvTimer){ clearInterval(_msgConvTimer); _msgConvTimer=null; } }

// ═══════════════════════════════════════════════════════
// PASTILLES NON-LUS + POINTS D'ACCÈS
// (bouton menu TOUJOURS visible ; icône HUD visible si activée)
// ═══════════════════════════════════════════════════════
async function chatRefreshBadges(){
 const name = _curName();
 const prof = name ? _chatLoad(name) : null;
 const enabled = !!(prof && prof.chatEnabled);
 const menuBtn = document.getElementById('menu-msg-btn'); if(menuBtn) menuBtn.classList.remove('hidden'); // fixe
 const hud = document.getElementById('hud-msg'); if(hud) hud.classList.toggle('hidden', !enabled);
 if(!enabled || !prof || !prof.chatId){ _setBadge('menu-msg-badge',0); _setBadge('hud-msg-badge',0); return; }
 const l = await chatMsgLatest(prof);
 const n = (l && l.latest) ? chatUnreadCount(prof, l.latest) : 0;
 _setBadge('menu-msg-badge', n); _setBadge('hud-msg-badge', n);
}
function _setBadge(id, n){
 const el = document.getElementById(id); if(!el) return;
 if(n>0){ el.textContent = n>9?'9+':String(n); el.classList.remove('hidden'); }
 else { el.classList.add('hidden'); }
}
function chatStartBadgePoll(){
 if(_msgBadgePoll) clearInterval(_msgBadgePoll);
 chatRefreshBadges();
 _msgBadgePoll = setInterval(chatRefreshBadges, 25000);
}

// ═══════════════════════════════════════════════════════
// SECTION « MESSAGERIE » DANS LE PANNEAU PROFIL (espace parent)
// ═══════════════════════════════════════════════════════
function renderOptMessaging(name){
 const box = document.getElementById('opt-messaging'); if(!box) return;
 if(!name){ box.innerHTML=''; return; }
 const prof = _chatLoad(name);
 const on = !!prof.chatEnabled;
 const code = prof.chatId || '(généré à l\u2019activation)';
 const nEsc = _e(name).replace(/'/g,"\\'");
 box.innerHTML =
  '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">'
  + '<span style="font-size:.85em;">Activer la messagerie pour ce profil</span>'
  + '<button onclick="optToggleMessaging(\''+nEsc+'\')" style="background:'+(on?'#27ae60':'#7f8c8d')+';font-size:.78em;padding:5px 12px;">'+(on?'Activée ✓':'Désactivée')+'</button>'
  + '</div>'
  + (on
     ? ('<p style="font-size:.72em;color:#bdc3c7;margin:0 0 6px;">Code ami : <span style="font-family:monospace;color:#5dade2;">'+_e(code)+'</span></p>'
        + '<button onclick="openMessaging(\''+nEsc+'\')" style="background:#2980b9;font-size:.8em;">👁 Voir les conversations</button>')
     : '<p style="font-size:.72em;color:#7f8c8d;margin:0;">Désactivée par défaut. Active-la pour permettre à cet enfant d\u2019échanger avec des contacts validés.</p>');
}
async function optToggleMessaging(name){
 const prof = _chatLoad(name);
 if(prof.chatEnabled){
  if(!confirm('Désactiver la messagerie pour '+name+' ?')) return;
  chatDisableForProfile(name);
  if(typeof toast==='function') toast('Messagerie désactivée.',1800);
 } else {
  if(typeof toast==='function') toast('Activation\u2026',1500);
  const res = await chatEnableForProfile(name);
  if(res && res.ok){ if(typeof toast==='function') toast('✅ Messagerie activée !',2000); }
  else { if(typeof toast==='function') toast('✅ Activée. Le code se synchronisera à la prochaine ouverture de la messagerie.',3500); }
 }
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
 s[name]={
  id: local.id || cloudChat.id || null,
  secret: local.secret || cloudChat.secret || null,
  enabled: !!(local.enabled || cloudChat.enabled),        // activé quelque part → activé partout (jamais désactivé par une synchro)
  registered: adoptId ? false : !!(local.registered || cloudChat.registered), // identité adoptée → (re)enregistrement au prochain accès
  seen: _chatMergeSeen(local.seen, cloudChat.seen)
 };
 _chatSaveStore(s);
 if(typeof chatRefreshBadges==='function'){ try{ chatRefreshBadges(); }catch(e){} }
}

// Démarrage : suivi des pastilles + affichage du bouton menu (fixe)
try{ if(typeof window!=='undefined'){ setTimeout(()=>{ if(typeof chatStartBadgePoll==='function') chatStartBadgePoll(); }, 1500); } }catch(e){}
